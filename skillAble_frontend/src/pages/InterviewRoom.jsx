import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare,
  HandMetal, User, Volume2, VolumeX, Captions, CaptionsOff
} from 'lucide-react'
import { Button } from '../components/common/Button'
import { useAuthStore } from '../store/authStore'
import { Badge } from '../components/common/Badge'

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

  const isDeaf   = user?.disabilityType === 'DEAF'
  const isBlind  = user?.disabilityType === 'BLIND'
  const isEmployer = user?.role === 'EMPLOYER'

  // ── Refs ──
  const videoRef      = useRef(null)
  const remoteVideoRef= useRef(null)
  const canvasRef     = useRef(null)
  const wsRef         = useRef(null)
  const handsRef      = useRef(null)
  const sendIntervalRef = useRef(null)
  const latestLandmarksRef = useRef([])
  const employerRecognitionRef = useRef(null)
  const messagesEndRef = useRef(null)

  // ── Media state ──
  const [stream, setStream]           = useState(null)
  const [isVideoOn, setIsVideoOn]     = useState(true)
  const [isMuted, setIsMuted]         = useState(false)

  // ── WebSocket ──
  const [isConnected, setIsConnected] = useState(false)

  // ── Sign Language ──
  const [isSignActive, setIsSignActive]       = useState(false)
  const [mediapipeReady, setMediapipeReady]   = useState(false)
  const [currentSignResult, setCurrentSignResult] = useState(null)

  // ── Speech → Text (interviewer speaking → deaf candidate reads) ──
  const [captionsEnabled, setCaptionsEnabled]       = useState(isDeaf)   // auto-on for deaf
  const [currentCaption, setCurrentCaption]         = useState('')
  const [captionHistory, setCaptionHistory]         = useState([])

  // ── TTS toggle (blind users) ──
  const [ttsEnabled, setTtsEnabled] = useState(isBlind)

  // ── Participants / Chat ──
  const [participants, setParticipants] = useState([
    { id: user?.id, name: user?.fullName || 'You', isMe: true, role: user?.role }
  ])
  const [messages, setMessages]       = useState([])
  const [messageInput, setMessageInput] = useState('')

  // ── Helper: speak via TTS ──
  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.95
    window.speechSynthesis.speak(utt)
  }, [])

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
  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        setStream(mediaStream)
        if (videoRef.current) videoRef.current.srcObject = mediaStream
        if (isBlind) speak('Camera and microphone connected.')
      } catch (err) {
        console.error('Camera error:', err)
        if (isBlind) speak('Camera access failed. Please check permissions.')
      }
    }
    setupCamera()
    return () => stream?.getTracks().forEach(t => t.stop())
  }, []) // eslint-disable-line

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

        // If the signing user is the DEAF CANDIDATE → voice it to the interviewer
        if (data.sender_id !== user?.id && txt) {
          speak(`${data.sender_name} signed: ${txt}`)
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
              window.drawConnectors(ctx, lms, window.HAND_CONNECTIONS, { color: '#00c4a0', lineWidth: 2 })
            }
            // Draw points
            for (const lm of lms) {
              ctx.beginPath()
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI)
              ctx.fillStyle = '#0F6E56'
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
        try { rec.start() } catch (_) {}
      }
    }

    try { rec.start() } catch (_) {}
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
  const handleToggle = (type) => {
    if (!stream) return
    if (type === 'video') {
      const track = stream.getVideoTracks()[0]
      if (track) { track.enabled = !isVideoOn; setIsVideoOn(v => !v) }
    } else {
      const track = stream.getAudioTracks()[0]
      if (track) { track.enabled = isMuted; setIsMuted(m => !m) }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-serif text-white font-bold">Interview Room</h1>
          <Badge variant={isConnected ? 'success' : 'warning'}>
            {isConnected ? 'Connected' : 'Reconnecting…'}
          </Badge>
          {isDeaf && (
            <span className="text-xs bg-teal-900 text-teal-200 px-3 py-1 rounded-full border border-teal-700 font-sans">
              Sign Language + Captions Active
            </span>
          )}
          {isBlind && (
            <span className="text-xs bg-blue-900 text-blue-200 px-3 py-1 rounded-full border border-blue-700 font-sans">
              Screen Reader Mode
            </span>
          )}
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="bg-red-600 hover:bg-red-700 text-white font-bold border-0"
          aria-label="Leave interview"
        >
          <PhoneOff className="w-4 h-4 mr-2" /> Leave
        </Button>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Participants ── */}
        <aside className="w-56 bg-gray-900 border-r border-gray-800 flex-col hidden lg:flex shrink-0">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-gray-400 font-sans font-medium text-sm">
              Participants ({participants.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                    {(p.name || '?').charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-gray-900 bg-green-500 rounded-full" />
                </div>
                <div>
                  <p className="text-gray-200 font-sans text-sm">{p.name} {p.isMe && '(You)'}</p>
                  <p className="text-gray-500 text-xs capitalize">{p.role?.toLowerCase()}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── CENTER: Video ── */}
        <main className="flex-1 flex flex-col relative bg-black" aria-label="Video area">
          <div className="flex-1 relative p-4 flex items-center justify-center">
            <div className="relative w-full h-full max-w-4xl max-h-full rounded-2xl overflow-hidden bg-gray-800 border-2 border-gray-700 shadow-2xl flex items-center justify-center">

              {/* Own video feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isVideoOn ? 'hidden' : ''}`}
                style={{ transform: 'scaleX(-1)' }}
                aria-label="Your camera"
              />

              {/* Sign landmark overlay */}
              {isSignActive && (
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ transform: 'scaleX(-1)' }}
                  aria-hidden="true"
                />
              )}

              {/* No-video placeholder */}
              {!isVideoOn && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <User className="w-24 h-24 text-gray-500" />
                </div>
              )}

              {/* ── Sign result overlay (BIG popup) ── */}
              <AnimatePresence>
                {currentSignResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute bottom-24 left-0 right-0 mx-auto w-max px-10 py-5 bg-black/85 backdrop-blur border-2 border-teal-500 rounded-2xl shadow-[0_0_40px_rgba(15,110,86,0.5)] z-20"
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-xs text-teal-400 text-center mb-1 font-sans uppercase tracking-widest">
                      {currentSignResult.sender} signed
                    </p>
                    <p className="text-5xl font-sans font-bold text-teal-300 text-center uppercase tracking-widest">
                      {currentSignResult.word}
                    </p>
                    <p className="text-teal-500 text-xs text-center mt-1">
                      {currentSignResult.confidence}% confidence
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── LIVE CAPTION BAR (visible always when caption exists, auto-on for deaf) ── */}
              <AnimatePresence>
                {currentCaption && (
                  <motion.div
                    key="caption"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 bg-black/90 text-white text-center px-6 py-3 z-30 border-t border-blue-700"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <p className="text-base font-sans leading-snug max-w-2xl mx-auto">
                      {currentCaption}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name tag */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-lg text-white text-sm font-sans flex gap-2 items-center z-10">
                {user?.fullName || 'You'} {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
              </div>
            </div>
          </div>

          {/* ── Control Bar ── */}
          <div className="h-24 bg-gray-900 border-t border-gray-800 flex items-center justify-center gap-4 px-6 shrink-0 flex-wrap">
            {/* Mute */}
            <button
              onClick={() => handleToggle('audio')}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff className="text-white w-6 h-6" /> : <Mic className="text-white w-6 h-6" />}
            </button>

            {/* Video */}
            <button
              onClick={() => handleToggle('video')}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${!isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              aria-label={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {!isVideoOn ? <VideoOff className="text-white w-6 h-6" /> : <Video className="text-white w-6 h-6" />}
            </button>

            <div className="w-px h-10 bg-gray-700 mx-1" />

            {/* Sign Language toggle (deaf candidates) */}
            <button
              onClick={() => setIsSignActive(v => !v)}
              className={`px-5 h-14 rounded-full flex items-center justify-center gap-2 transition-colors font-sans font-bold border-2 text-sm ${
                isSignActive
                  ? 'bg-teal-900 border-teal-500 text-teal-200'
                  : 'bg-transparent border-gray-600 text-gray-300 hover:border-teal-500'
              }`}
              aria-pressed={isSignActive}
              aria-label={isSignActive ? 'Disable sign language detection' : 'Enable sign language detection'}
            >
              <HandMetal className={`w-5 h-5 ${isSignActive ? 'text-teal-400' : ''}`} />
              {isSignActive ? 'Signing ON' : 'Sign Language'}
              {isSignActive && mediapipeReady && (
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse ml-1" />
              )}
            </button>

            {/* Captions toggle */}
            <button
              onClick={() => setCaptionsEnabled(v => !v)}
              className={`px-5 h-14 rounded-full flex items-center justify-center gap-2 transition-colors font-sans font-bold border-2 text-sm ${
                captionsEnabled
                  ? 'bg-blue-900 border-blue-500 text-blue-200'
                  : 'bg-transparent border-gray-600 text-gray-300 hover:border-blue-500'
              }`}
              aria-pressed={captionsEnabled}
              aria-label={captionsEnabled ? 'Disable live captions' : 'Enable live captions (speech to text)'}
            >
              {captionsEnabled ? <Captions className="w-5 h-5 text-blue-400" /> : <CaptionsOff className="w-5 h-5" />}
              {captionsEnabled ? 'Captions ON' : 'Captions'}
            </button>

            {/* TTS toggle (primarily for blind) */}
            <button
              onClick={() => setTtsEnabled(v => !v)}
              className={`px-5 h-14 rounded-full flex items-center justify-center gap-2 transition-colors font-sans font-bold border-2 text-sm ${
                ttsEnabled
                  ? 'bg-purple-900 border-purple-500 text-purple-200'
                  : 'bg-transparent border-gray-600 text-gray-300 hover:border-purple-500'
              }`}
              aria-pressed={ttsEnabled}
              aria-label={ttsEnabled ? 'Disable text to speech readout' : 'Enable text to speech readout'}
            >
              {ttsEnabled ? <Volume2 className="w-5 h-5 text-purple-400" /> : <VolumeX className="w-5 h-5" />}
              {ttsEnabled ? 'TTS ON' : 'Read Aloud'}
            </button>
          </div>
        </main>

        {/* ── RIGHT: Chat + Caption History ── */}
        <aside className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col shrink-0" aria-label="Chat and captions">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-white font-serif font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-teal-400" />
              Room Chat
            </h2>
          </div>

          {/* Caption transcript panel */}
          {isDeaf && captionHistory.length > 0 && (
            <div className="border-b border-gray-800 max-h-36 overflow-y-auto">
              <p className="text-xs text-blue-400 font-sans px-4 pt-3 pb-1 uppercase tracking-widest">
                Interviewer speech log
              </p>
              {captionHistory.map(c => (
                <div key={c.id} className="px-4 py-1.5 text-sm font-sans text-gray-300 border-b border-gray-800/50">
                  <span className="text-blue-400 text-xs">{c.speaker}: </span>
                  {c.text}
                </div>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col" aria-live="polite" aria-label="Messages">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center font-sans mt-auto mb-auto">
                No messages yet.
              </p>
            )}

            {messages.map(msg => {
              if (msg.type === 'sign_result') {
                return (
                  <div key={msg.id} className="bg-teal-900/50 border border-teal-700 rounded-xl px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-teal-300 text-xs font-sans mb-1">
                      <HandMetal className="w-3 h-3" /> {msg.senderName} signed
                    </div>
                    <p className="text-white font-bold tracking-wide">"{msg.text}"</p>
                    <p className="text-teal-500 text-xs mt-0.5">{msg.confidence}% confidence</p>
                  </div>
                )
              }

              if (msg.type === 'speech_text') {
                return (
                  <div key={msg.id} className="bg-blue-900/50 border border-blue-700 rounded-xl px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-300 text-xs font-sans mb-1">
                      <MessageSquare className="w-3 h-3" /> {msg.senderName} spoke
                    </div>
                    <p className="text-white font-bold tracking-wide">"{msg.text}"</p>
                  </div>
                )
              }

              if (msg.type?.startsWith('system_')) {
                return (
                  <p key={msg.id} className="text-gray-500 text-xs text-center font-sans italic">
                    {msg.text}
                  </p>
                )
              }

              return (
                <div key={msg.id} className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}>
                  {!msg.isMine && <span className="text-xs text-gray-500 mb-1 ml-1 font-sans">{msg.senderName}</span>}
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] font-sans text-sm ${msg.isMine ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                    {msg.message}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat input */}
          <form onSubmit={sendChatMessage} className="p-4 border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={isDeaf ? 'Type a message (sign language active)' : 'Type a message…'}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 font-sans text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              aria-label="Chat message input"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-sans font-bold text-sm transition-colors"
              aria-label="Send message"
            >
              Send
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}
