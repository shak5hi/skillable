import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare,
  HandMetal, User, Volume2, VolumeX, Captions, CaptionsOff, Settings
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

// ─────────────────────────────────────────────────────────────────────────────
// InterviewRoom — fully accessible for:
//   • DEAF candidates  : sign-language → text overlay + TTS voiced to interviewer
//                        interviewer speech → live captions shown on screen
//   • BLIND candidates : all events are read aloud via SpeechSynthesis
// ─────────────────────────────────────────────────────────────────────────────
export default function InterviewRoom() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { user, accessToken } = useAuthStore()

  const isDeaf = user?.disabilityType === 'DEAF'
  const isBlind = user?.disabilityType === 'BLIND'
  const isEmployer = user?.role === 'EMPLOYER'

  // ── Refs ──
  const videoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const canvasRef = useRef(null)
  const wsRef = useRef(null)
  const handsRef = useRef(null)
  const sendIntervalRef = useRef(null)
  const latestLandmarksRef = useRef([])
  const employerRecognitionRef = useRef(null)
  const messagesEndRef = useRef(null)

  // ── Media state ──
  const [stream, setStream] = useState(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  // ── WebSocket ──
  const [isConnected, setIsConnected] = useState(false)

  // ── Sign Language ──
  const [isSignActive, setIsSignActive] = useState(false)
  const [mediapipeReady, setMediapipeReady] = useState(false)
  const [currentSignResult, setCurrentSignResult] = useState(null)

  // ── Speech → Text (interviewer speaking → deaf candidate reads) ──
  const [captionsEnabled, setCaptionsEnabled] = useState(isDeaf)   // auto-on for deaf
  const [currentCaption, setCurrentCaption] = useState('')
  const [captionHistory, setCaptionHistory] = useState([])

  // ── TTS toggle (blind users) ──
  const [ttsEnabled, setTtsEnabled] = useState(isBlind)

  // ── Participants / Chat ──
  const [participants, setParticipants] = useState([
    { id: user?.id, name: user?.fullName || 'You', isMe: true, role: user?.role }
  ])
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')

  // ── TTS Settings (Voices) ──
  const [voices, setVoices] = useState([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('')
  const [speechRate, setSpeechRate] = useState(1.0)
  const lastSignSpokenRef = useRef({ text: '', time: 0 })

  useEffect(() => {
    if (!window.speechSynthesis) return
    const populateVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length > 0) {
        setVoices(v)
        // Default to Google US English if available, else standard default
        if (!selectedVoiceURI) {
          const defaultVoice = v.find(x => x.name.includes('Google US English')) || v.find(x => x.default) || v.find(x => x.lang.startsWith('en')) || v[0]
          if (defaultVoice) setSelectedVoiceURI(defaultVoice.voiceURI)
        }
      }
    }
    populateVoices()
    window.speechSynthesis.onvoiceschanged = populateVoices
  }, [selectedVoiceURI])

  // ── Helper: speak via TTS ──
  const speak = useCallback((text, options = {}) => {
    if (!text || !window.speechSynthesis) return

    // Debounce rapid identical sign words to prevent spam
    if (options.isSignEvent) {
      const now = Date.now()
      if (lastSignSpokenRef.current.text === text && (now - lastSignSpokenRef.current.time) < 2000) {
        return // skip this utterance
      }
      lastSignSpokenRef.current = { text, time: now }
    } else {
      // Violent interrupt for system events (not sign language)
      window.speechSynthesis.cancel()
    }

    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = speechRate
    if (selectedVoiceURI) {
      const v = window.speechSynthesis.getVoices().find(x => x.voiceURI === selectedVoiceURI)
      if (v) utt.voice = v
    }
    window.speechSynthesis.speak(utt)
  }, [speechRate, selectedVoiceURI])

  // ── Load MediaPipe Hands script on demand ──
  const loadMediaPipe = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Hands) { resolve(); return }
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
      script.crossOrigin = 'anonymous'
      script.onload = resolve
      document.head.appendChild(script)
    })
  }, [])

  // ── Camera setup ──
  const setupCamera = useCallback(async () => {
    setCameraError(null)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Browser blocked camera access (requires localhost or HTTPS).')
      return null
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setStream(mediaStream)
      setIsVideoOn(true)
      setIsMuted(false)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(e => console.error("Video play error:", e))
      }
      if (isBlind) speak('Camera and microphone connected.')
      return mediaStream
    } catch (err) {
      console.error('Camera error:', err)
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No webcam or microphone found plugged into your system.')
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied by browser. Please click the lock icon in your URL bar to allow it.')
      } else {
        setCameraError(`Camera failed to start: ${err.message || err.name}`)
      }
      if (isBlind) speak('Camera access failed. Please check permissions.')
      return null
    }
  }, [isBlind, speak])

  useEffect(() => {
    let localStream = null
    setupCamera().then(s => { localStream = s })
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop())
      }
    }
  }, [setupCamera])

  // ── WebSocket ──
  useEffect(() => {
    if (!roomId) return
    let attempts = 0
    let reconnectTimer = null

    function connect() {
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/interview/${roomId}/?token=${accessToken}`)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        attempts = 0
        if (isBlind) speak('Connected to interview room.')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        handleWsMessage(data)
      }

      ws.onclose = () => {
        setIsConnected(false)
        if (attempts < 4) {
          attempts++
          reconnectTimer = setTimeout(connect, Math.pow(2, attempts) * 1000)
        }
      }

      ws.onerror = (e) => console.error('WS error', e)
    }

    connect()
    return () => {
      clearTimeout(reconnectTimer)
      wsRef.current?.close()
    }
  }, [roomId, accessToken]) // eslint-disable-line

  // ── WS message router ──
  const handleWsMessage = useCallback((data) => {
    switch (data.type) {

      case 'user_joined': {
        const p = { id: data.user_id, name: data.full_name, role: data.role, isConnected: true }
        setParticipants(prev => [...prev.filter(x => x.id !== p.id), p])
        const joinMsg = `${data.full_name} joined as ${data.role}.`
        addSystemMessage('join', joinMsg)
        if (isBlind) speak(joinMsg)
        break
      }

      case 'user_left': {
        setParticipants(prev => prev.filter(x => x.id !== data.user_id))
        const leftMsg = `${data.full_name} left the room.`
        addSystemMessage('leave', leftMsg)
        if (isBlind) speak(leftMsg)
        break
      }

      case 'chat': {
        const chatMsg = { id: Date.now(), type: 'chat', senderName: data.sender_name, message: data.message, isMine: false }
        setMessages(prev => [...prev, chatMsg])
        if (isBlind) speak(`${data.sender_name} says: ${data.message}`)
        break
      }

      // Sign language result — received by ALL participants
      case 'sign_result': {
        const txt = data.text || data.gesture || ''
        const pct = Math.round((data.confidence || 0) * 100)

        // Show overlay card
        setCurrentSignResult({ word: txt, confidence: pct, sender: data.sender_name })
        setTimeout(() => setCurrentSignResult(null), 4000)

        // Add to chat transcript
        setMessages(prev => [...prev, {
          id: Date.now(), type: 'sign_result',
          senderName: data.sender_name, text: txt, confidence: pct
        }])

        // Voice the translation aloud for everyone, using queueing (isSignEvent: true)
        if (txt) {
          speak(txt, { isSignEvent: true })
        }
        // If WE are blind, also speak it
        if (isBlind && data.sender_id !== user?.id && txt) {
          speak(`Sign language detected: ${txt}`)
        }
        break
      }

      // Interviewer speech → text for deaf candidate
      case 'speech_text': {
        const spokenText = data.text || ''
        // Update live caption bar
        setCurrentCaption(spokenText)
        setCaptionHistory(prev => [...prev.slice(-19), { id: Date.now(), speaker: data.sender_name, text: spokenText }])
        // Add to chat
        setMessages(prev => [...prev, {
          id: Date.now(), type: 'speech_text',
          senderName: data.sender_name, text: spokenText
        }])
        // If blind, also read it
        if (isBlind && data.sender_id !== user?.id) speak(`${data.sender_name} said: ${spokenText}`)
        // Auto-clear caption bar after 6s
        setTimeout(() => setCurrentCaption(''), 6000)
        break
      }

      case 'error':
        console.error('WS server error:', data.message)
        break

      default: break
    }
  }, [user, isBlind, speak])

  // Expose handler to ws after it's defined
  useEffect(() => {
    if (!wsRef.current) return
    wsRef.current.onmessage = (event) => handleWsMessage(JSON.parse(event.data))
  }, [handleWsMessage])

  // ── Helper: add system messages ──
  function addSystemMessage(type, text) {
    setMessages(prev => [...prev, { id: Date.now(), type: 'system_' + type, text }])
  }

  // ── Auto-scroll chat ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ─────────────────────────────────────────────────────────────────────────
  // SIGN LANGUAGE DETECTION  (activated for DEAF users automatically)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isSignActive) {
      handsRef.current?.close()
      handsRef.current = null
      clearInterval(sendIntervalRef.current)
      return
    }

    async function initHands() {
      await loadMediaPipe()
      if (!window.Hands) { console.warn('MediaPipe Hands not loaded'); return }

      const hands = new window.Hands({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
      })
      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.5
      })

      hands.onResults((results) => {
        // Draw landmarks on overlay canvas
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (results.multiHandLandmarks?.length) {
          for (const lms of results.multiHandLandmarks) {
            // Draw connections
            if (window.drawConnectors && window.HAND_CONNECTIONS) {
              window.drawConnectors(ctx, lms, window.HAND_CONNECTIONS, { color: '#4F7DFF', lineWidth: 2 })
            }
            // Draw points
            for (const lm of lms) {
              ctx.beginPath()
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI)
              ctx.fillStyle = '#111827'
              ctx.fill()
            }
          }
          // Store latest landmarks for WS transmission
          latestLandmarksRef.current = results.multiHandLandmarks.map(hand =>
            hand.map(lm => [lm.x, lm.y, lm.z])
          )
        } else {
          latestLandmarksRef.current = []
        }
      })

      handsRef.current = hands
      setMediapipeReady(true)

      // Process frames
      const processFrame = async () => {
        const vid = videoRef.current
        if (vid && vid.readyState >= 2 && handsRef.current) {
          await handsRef.current.send({ image: vid })
        }
        if (handsRef.current) requestAnimationFrame(processFrame)
      }
      requestAnimationFrame(processFrame)

      // Send landmarks to backend every 600ms
      sendIntervalRef.current = setInterval(() => {
        const ws = wsRef.current
        const lms = latestLandmarksRef.current
        if (ws?.readyState === WebSocket.OPEN && lms.length > 0) {
          ws.send(JSON.stringify({ type: 'sign_data', landmarks: lms }))
        }
      }, 600)
    }

    initHands()
    return () => {
      handsRef.current?.close()
      handsRef.current = null
      clearInterval(sendIntervalRef.current)
    }
  }, [isSignActive, loadMediaPipe])

  // ─────────────────────────────────────────────────────────────────────────
  // EMPLOYER SPEECH → TEXT  (for deaf candidate's benefit)
  // Auto-starts when captionsEnabled is true AND user is EMPLOYER
  // Also starts for any user when captionsEnabled toggles on (interviewer role)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    if (!isEmployer) return   // only interviewer runs this recognition

    if (!captionsEnabled) {
      employerRecognitionRef.current?.stop()
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-US'

    let finalBuf = ''

    rec.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalBuf += txt + ' '
          // Send final transcript over WS
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'speech_text', text: finalBuf.trim() }))
          }
          finalBuf = ''
        } else {
          interim += txt
        }
      }
      // Show interim locally for previewing (only to the speaker)
      if (interim) setCurrentCaption(`(you speaking) ${interim}`)
    }

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return
      console.error('Employer STT error:', e.error)
    }

    rec.onend = () => {
      // Restart automatically
      if (captionsEnabled && isEmployer) {
        try { rec.start() } catch (_) { }
      }
    }

    try { rec.start() } catch (_) { }
    employerRecognitionRef.current = rec

    return () => { rec.stop() }
  }, [captionsEnabled, isEmployer])

  // ── Auto-enable sign language for deaf users ──
  useEffect(() => {
    if (isDeaf && !isSignActive) setIsSignActive(true)
  }, [isDeaf]) // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // Chat send
  // ─────────────────────────────────────────────────────────────────────────
  const sendChatMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim() || wsRef.current?.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({ type: 'chat', message: messageInput.trim() }))
    setMessages(prev => [...prev, {
      id: Date.now(), type: 'chat', senderName: 'You', message: messageInput.trim(), isMine: true
    }])
    setMessageInput('')
  }

  // ── Device toggles ──
  const handleToggle = async (type) => {
    if (!stream) {
      // Re-request if it failed initially
      await setupCamera()
      return
    }
    if (type === 'video') {
      const track = stream.getVideoTracks()[0]
      if (track) {
        track.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
      }
    } else {
      const track = stream.getAudioTracks()[0]
      if (track) {
        track.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#FAFAF8] text-[#111827] overflow-hidden font-sans">

      {/* ── Top Bar ── */}
      <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-6">
          <Link to="/" style={{ fontFamily: 'var(--font-serif)' }} className="text-[24px] font-bold tracking-tight text-[#111827] hover:opacity-80 transition-opacity">
            SkillAble.
          </Link>
          <div className="hidden sm:flex items-center gap-3">
            <span className="w-[1px] h-6 bg-gray-200"></span>
            <h1 className="text-[14px] font-bold text-[#111827] tracking-wide uppercase">Interview Room</h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isConnected ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              {isConnected ? 'Connected' : 'Reconnecting…'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDeaf && (
            <span className="text-[10px] bg-[#4F7DFF]/10 text-[#4F7DFF] px-3 py-1 rounded-full font-bold uppercase tracking-widest hidden lg:block">
              Sign Language + Captions Active
            </span>
          )}
          {isBlind && (
            <span className="text-[10px] bg-[#111827]/5 text-[#111827] px-3 py-1 rounded-full font-bold uppercase tracking-widest hidden lg:block">
              Screen Reader Mode
            </span>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-colors flex items-center gap-2 border border-red-100"
            aria-label="Leave interview"
          >
            <PhoneOff className="w-3.5 h-3.5" /> Leave
          </button>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── LEFT: Participants (Hidden on small screens) ── */}
        <aside className="w-64 bg-white border-r border-gray-100 flex-col hidden xl:flex shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 relative">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-[#111827] font-bold text-[11px] uppercase tracking-widest">
              Participants ({participants.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-default border border-transparent hover:border-gray-100">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-gray-200 flex items-center justify-center text-[#111827] font-bold shadow-sm">
                    {(p.name || '?').charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white bg-emerald-500 rounded-full" />
                </div>
                <div>
                  <p className="text-[#111827] font-bold text-[13px]">{p.name} {p.isMe && <span className="text-gray-400 font-medium">(You)</span>}</p>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER: Video & Controls ── */}
        <main className="flex-1 flex flex-col relative bg-[#F8FAFC] p-4 lg:p-6" aria-label="Video area">

          <div className="flex-1 relative w-full h-full max-w-5xl mx-auto rounded-3xl overflow-hidden bg-[#111827] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border-4 border-white flex items-center justify-center group">

            {/* Own video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-500 ${!isVideoOn ? 'opacity-0' : 'opacity-100'}`}
              style={{ transform: 'scaleX(-1)' }}
              aria-label="Your camera"
            />

            {/* Sign landmark overlay */}
            {isSignActive && (
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-80"
                style={{ transform: 'scaleX(-1)' }}
                aria-hidden="true"
              />
            )}

            {/* No-video placeholder */}
            {(!stream || !isVideoOn) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111827]">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-white/40" />
                </div>
                {cameraError ? (
                  <p className="text-red-400 text-[13px] font-bold text-center max-w-sm bg-red-950/40 px-4 py-2 rounded-lg border border-red-900/50">{cameraError}</p>
                ) : (
                  <p className="text-white/40 text-sm font-medium">Camera is turned off</p>
                )}
              </div>
            )}

            {/* ── Sign result overlay (Sleek Glassmorphism popup) ── */}
            <AnimatePresence>
              {currentSignResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-24 left-0 right-0 mx-auto w-max px-8 py-5 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-20"
                  role="status"
                  aria-live="polite"
                >
                  <p className="text-[10px] text-[#4F7DFF] text-center mb-1 font-bold uppercase tracking-widest">
                    {currentSignResult.sender} signed
                  </p>
                  <p className="text-4xl font-sans font-bold text-[#111827] text-center tracking-tight mb-1">
                    "{currentSignResult.word}"
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      {currentSignResult.confidence}% confidence
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── LIVE CAPTION BAR (Premium floating pill) ── */}
            <AnimatePresence>
              {currentCaption && (
                <motion.div
                  key="caption"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-8 left-8 right-8 mx-auto max-w-2xl bg-black/70 backdrop-blur-xl border border-white/10 text-white text-center px-6 py-4 rounded-2xl z-30 shadow-2xl"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <p className="text-[16px] font-medium leading-relaxed font-sans">
                    {currentCaption}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Name tag */}
            <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-[11px] font-bold tracking-widest uppercase flex gap-2 items-center z-10 border border-white/10 shadow-lg">
              {user?.fullName || 'You'} {isMuted && <MicOff className="w-3.5 h-3.5 text-red-400" />}
            </div>
          </div>

          {/* ── Floating Control Bar (Modern Zoom/Meet style) ── */}
          <div className="absolute bottom-10 left-0 right-0 mx-auto w-max bg-white/90 backdrop-blur-lg border border-gray-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-full px-3 py-3 flex items-center gap-2 z-40">

            {/* Mute */}
            <button
              onClick={() => handleToggle('audio')}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-[#111827] hover:bg-gray-100'}`}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Video */}
            <button
              onClick={() => handleToggle('video')}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${!isVideoOn ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-[#111827] hover:bg-gray-100'}`}
              aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {!isVideoOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <div className="w-px h-8 bg-gray-200 mx-2" />

            {/* Sign Language toggle */}
            <button
              onClick={() => setIsSignActive(v => !v)}
              className={`px-5 h-12 rounded-full flex items-center justify-center gap-2 transition-all font-bold text-[11px] uppercase tracking-widest border ${isSignActive
                  ? 'bg-[#111827] border-[#111827] text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-[#111827]'
                }`}
            >
              <HandMetal className={`w-4 h-4 ${isSignActive ? 'text-[#4F7DFF]' : ''}`} />
              <span className="hidden sm:inline">{isSignActive ? 'Signing ON' : 'Sign Language'}</span>
              {isSignActive && mediapipeReady && <span className="w-2 h-2 rounded-full bg-[#4F7DFF] animate-pulse ml-1" />}
            </button>

            {/* Captions toggle */}
            <button
              onClick={() => setCaptionsEnabled(v => !v)}
              className={`px-5 h-12 rounded-full flex items-center justify-center gap-2 transition-all font-bold text-[11px] uppercase tracking-widest border ${captionsEnabled
                  ? 'bg-[#111827] border-[#111827] text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-[#111827]'
                }`}
            >
              {captionsEnabled ? <Captions className="w-4 h-4 text-[#4F7DFF]" /> : <CaptionsOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{captionsEnabled ? 'Captions ON' : 'Captions'}</span>
            </button>

            {/* TTS toggle */}
            <button
              onClick={() => setTtsEnabled(v => !v)}
              className={`px-5 h-12 rounded-full flex items-center justify-center gap-2 transition-all font-bold text-[11px] uppercase tracking-widest border ${ttsEnabled
                  ? 'bg-[#111827] border-[#111827] text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-[#111827]'
                }`}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4 text-[#4F7DFF]" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden lg:inline">{ttsEnabled ? 'TTS ON' : 'Read Aloud'}</span>
            </button>
            {/* TTS Settings Dropdown */}
            {window.speechSynthesis && voices.length > 0 && (
              <div className="relative group">
                <button className="px-3 h-12 rounded-full border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-[#111827] flex items-center justify-center transition-all shadow-sm">
                   <Settings className="w-4 h-4" />
                </button>
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-4 hidden group-hover:block transition-all opacity-0 group-hover:opacity-100 z-50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">TTS Voice</p>
                  <select 
                    value={selectedVoiceURI} 
                    onChange={e => setSelectedVoiceURI(e.target.value)}
                    className="w-full text-xs p-2 border border-gray-200 rounded-xl mb-3 text-[#111827] bg-[#FAFAF8] outline-none focus:border-[#4F7DFF] focus:ring-2 focus:ring-[#4F7DFF]/10 transition-all"
                  >
                    {voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name.replace(/Google |Microsoft /g, '')}</option>)}
                  </select>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Speed</p>
                    <p className="text-[10px] font-bold text-[#111827]">{speechRate}x</p>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.1" value={speechRate} onChange={e => setSpeechRate(parseFloat(e.target.value))} className="w-full accent-[#4F7DFF]" />
                </div>
              </div>
            )}
          </div>

        </main>

        {/* ── RIGHT: Chat + Caption History ── */}
        <aside className="w-80 lg:w-[360px] bg-white border-l border-gray-100 flex flex-col shrink-0 relative z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]" aria-label="Chat and captions">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="text-[#111827] font-bold text-[11px] uppercase tracking-widest flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#4F7DFF]" />
              Meeting Chat
            </h2>
          </div>

          {/* Caption transcript panel */}
          {isDeaf && captionHistory.length > 0 && (
            <div className="border-b border-gray-100 max-h-48 overflow-y-auto bg-gray-50/50">
              <p className="text-[9px] text-gray-400 font-bold px-5 pt-4 pb-2 uppercase tracking-widest sticky top-0 bg-gray-50/90 backdrop-blur-sm">
                Live Speech Transcript
              </p>
              {captionHistory.map(c => (
                <div key={c.id} className="px-5 py-2.5 text-[13px] font-sans text-gray-700 border-b border-gray-100/50 hover:bg-white transition-colors">
                  <span className="text-[#111827] font-bold text-[11px] uppercase tracking-widest block mb-0.5">{c.speaker}</span>
                  {c.text}
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col bg-white" aria-live="polite" aria-label="Messages">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-gray-400 text-xs font-medium">Messages sent to the room will appear here.</p>
              </div>
            )}

            {messages.map(msg => {
              if (msg.type === 'sign_result') {
                return (
                  <div key={msg.id} className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#4F7DFF] text-[10px] font-bold uppercase tracking-widest mb-2">
                      <HandMetal className="w-3.5 h-3.5" /> {msg.senderName} signed
                    </div>
                    <p className="text-[#111827] font-bold text-lg mb-1">"{msg.text}"</p>
                    <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">{msg.confidence}% confidence</p>
                  </div>
                )
              }

              if (msg.type === 'speech_text') {
                return (
                  <div key={msg.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                      <MessageSquare className="w-3.5 h-3.5" /> {msg.senderName} spoke
                    </div>
                    <p className="text-[#111827] font-bold text-sm">"{msg.text}"</p>
                  </div>
                )
              }

              if (msg.type?.startsWith('system_')) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gray-100">
                      {msg.text}
                    </span>
                  </div>
                )
              }

              return (
                <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                  {!msg.isMine && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 ml-1">{msg.senderName}</span>}
                  <div className={`px-4 py-3 rounded-2xl max-w-[85%] font-sans text-[13px] leading-relaxed shadow-sm ${msg.isMine ? 'bg-[#111827] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm'}`}>
                    {msg.message}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={sendChatMessage} className="p-4 border-t border-gray-100 bg-white">
            <div className="relative flex items-center">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={isDeaf ? 'Type message (signing active)...' : 'Type a message...'}
                className="w-full bg-[#F8FAFC] border border-gray-200 rounded-full pl-5 pr-20 py-3.5 text-[#111827] placeholder-gray-400 font-sans text-xs font-semibold outline-none focus:bg-white focus:border-[#4F7DFF] focus:ring-4 focus:ring-[#4F7DFF]/10 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="absolute right-1.5 px-4 py-2 bg-[#111827] hover:bg-[#1f2937] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full font-sans font-bold text-[10px] uppercase tracking-widest transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  )
}
