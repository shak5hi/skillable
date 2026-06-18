import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2, X, Volume2, ChevronDown } from 'lucide-react'
import { useAccessibilityStore } from '../../store/accessibilityStore'
import { useAuthStore } from '../../store/authStore'
import api from '../../api/axios'

// ─────────────────────────────────────────────────────────────────────────────
// VoiceNavigationButton  — "Hello Bandhu" voice agent
//
// FEATURES
//   • Wake word: "hello bandhu" (always listening)
//   • Navigation: "go to jobs / dashboard / resources / resume / applications"
//   • Search: "search Python developer jobs"
//   • Filter: "show remote jobs / full time / accessibility friendly"
//   • Apply:  "apply for Software Engineer at Google"
//   • Read aloud: reads ALL visible text on screen with pauses between sections
//   • "stop" / "goodbye" deactivates
//   • Keyboard shortcut: Alt+V to toggle
//   • All actions confirmed via TTS response
//   • Emits custom DOM events so pages (BrowseJobs etc.) can react
// ─────────────────────────────────────────────────────────────────────────────

export function VoiceNavigationButton() {
  const { settings, isVoiceAssistantActive, setVoiceAssistantActive } = useAccessibilityStore()
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()

  const [isListening,   setIsListening]   = useState(false)
  const [isProcessing,  setIsProcessing]  = useState(false)
  const [transcript,    setTranscript]    = useState('')
  const [statusMsg,     setStatusMsg]     = useState('')
  const [showPanel,     setShowPanel]     = useState(false)
  const [history,       setHistory]       = useState([])

  const recognitionRef    = useRef(null)
  const isListeningRef    = useRef(false)
  const activeRef         = useRef(isVoiceAssistantActive)
  const settingsRef       = useRef(settings)
  const statusTimerRef    = useRef(null)

  const isBlind = user?.disabilityType === 'BLIND'

  // ── Keep refs in sync ──
  useEffect(() => { activeRef.current = isVoiceAssistantActive }, [isVoiceAssistantActive])
  useEffect(() => { settingsRef.current = settings }, [settings])

  // ── TTS helper ──
  const speak = useCallback((text, priority = false) => {
    if (!text || !window.speechSynthesis) return
    if (priority) window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.9
    window.speechSynthesis.speak(utt)
  }, [])

  const setStatus = useCallback((msg, ms = 4000) => {
    setStatusMsg(msg)
    clearTimeout(statusTimerRef.current)
    if (ms > 0) statusTimerRef.current = setTimeout(() => setStatusMsg(''), ms)
  }, [])

  // ── Read Aloud — scans ALL readable DOM text ──
  const readPageAloud = useCallback(() => {
    window.speechSynthesis.cancel()

    // Collect text from semantic elements in order
    const selectors = [
      'h1', 'h2', 'h3', 'h4',
      'main p', 'main li', 'main td', 'main th',
      '[role="main"] p', '[role="article"] p',
      '.job-card', '[data-readable]',
      'label', 'button:not([aria-hidden])', 'a[href]'
    ]

    const seen = new Set()
    const chunks = []

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(el => {
        if (seen.has(el)) return
        seen.add(el)
        const txt = el.innerText?.trim()
        if (txt && txt.length > 2) chunks.push(txt)
      })
    }

    if (chunks.length === 0) {
      speak('No readable content found on this page.', true)
      return
    }

    // Speak chunks sequentially with tiny pauses
    speak('Reading page content. ' + chunks.join('. '), true)
    setStatus(`Reading ${chunks.length} items aloud…`, chunks.length * 800)
  }, [speak, setStatus])

  // ─────────────────────────────────────────────────────────────────────────
  // COMMAND PROCESSOR
  // ─────────────────────────────────────────────────────────────────────────
  const processCommand = useCallback(async (rawText) => {
    if (!rawText.trim()) return
    setIsProcessing(true)

    const text = rawText.toLowerCase().trim()
    setStatus(`Processing: "${rawText}"`)

    // ── Local fast-path commands (no API needed) ──────────────────────────

    // Stop / deactivate
    if (/\b(stop|goodbye|deactivate|exit voice|quiet)\b/.test(text)) {
      setVoiceAssistantActive(false)
      speak('Voice assistant deactivated. Say hello bandhu to reactivate.', true)
      setStatus('Deactivated', 3000)
      setIsProcessing(false)
      return
    }

    // Read aloud
    if (/\b(read aloud|read the page|read page|read this|read content|read screen|read everything)\b/.test(text)) {
      readPageAloud()
      setIsProcessing(false)
      addHistory(rawText, 'read_aloud', null)
      return
    }

    // Go back
    if (/\b(go back|back|previous page)\b/.test(text)) {
      navigate(-1)
      speak('Going back.', true)
      setStatus('← Going back')
      setIsProcessing(false)
      addHistory(rawText, 'navigate_back', null)
      return
    }

    // ── Try backend API for smart NLP resolution ──────────────────────────
    try {
      const payload = { command: `hello bandhu ${text}` }
      const { data } = await api.post('/api/accessibility/voice-command/', payload)

      addHistory(rawText, data.action, data.route || null)

      if (data.action === 'navigate' && data.route) {
        navigate(data.route)
        speak(data.message || `Navigating to ${data.route}`, true)
        setStatus(data.message || `→ ${data.route}`)

      } else if (data.action === 'filter_jobs') {
        // Navigate to jobs and emit a custom event so BrowseJobs applies filters
        navigate('/jobs')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('voice:filter_jobs', { detail: data.filters }))
        }, 400)
        speak(data.message || 'Applying job filters.', true)
        setStatus(data.message)

      } else if (data.action === 'search_jobs') {
        navigate(`/jobs?search=${encodeURIComponent(data.query || '')}`)
        window.dispatchEvent(new CustomEvent('voice:search_jobs', { detail: { query: data.query } }))
        speak(data.message || `Searching for ${data.query}`, true)
        setStatus(data.message)

      } else if (data.action === 'apply_job') {
        // Navigate to job detail or jobs list and trigger apply
        navigate(`/jobs?search=${encodeURIComponent(data.job_title || '')}`)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('voice:apply_job', { detail: { job_title: data.job_title } }))
        }, 600)
        speak(data.message || `Looking for ${data.job_title} jobs to apply.`, true)
        setStatus(data.message)

      } else if (data.action === 'navigate_back') {
        navigate(-1)
        speak(data.message || 'Going back.', true)

      } else if (data.action === 'read_aloud') {
        readPageAloud()

      } else if (data.action === 'deactivate') {
        setVoiceAssistantActive(false)
        speak(data.message, true)
        setStatus('Voice deactivated', 3000)

      } else {
        speak(data.message || "I didn't understand that. Try saying search jobs or go to dashboard.", true)
        setStatus("Command not understood. Try again.")
      }

    } catch (err) {
      console.warn('Voice API error, using fallback:', err)
      // ── Robust client-side fallback ────────────────────────────────────
      const fallback = clientFallback(text)
      if (fallback.action === 'navigate') {
        navigate(fallback.route)
        speak(`Going to ${fallback.route}`, true)
      } else if (fallback.action === 'filter_jobs') {
        navigate('/jobs')
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('voice:filter_jobs', { detail: fallback.filters }))
        }, 400)
        speak(fallback.message, true)
      } else if (fallback.action === 'search_jobs') {
        navigate(`/jobs?search=${encodeURIComponent(fallback.query)}`)
        speak(`Searching for ${fallback.query}`, true)
      } else {
        speak("Sorry, command not recognised. Try saying read aloud or go to jobs.", true)
      }
      addHistory(rawText, fallback.action, null)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setTranscript(''), 4000)
    }
  }, [navigate, readPageAloud, speak, setStatus, setVoiceAssistantActive])

  // ── Client-side fallback NLP ──
  function clientFallback(text) {
    if (/\b(job|jobs|search|browse)\b/.test(text)) {
      if (/\b(remote|work from home)\b/.test(text))
        return { action: 'filter_jobs', filters: { job_type: 'REMOTE' }, message: 'Showing remote jobs.' }
      if (/\b(full.?time)\b/.test(text))
        return { action: 'filter_jobs', filters: { job_type: 'FULL_TIME' }, message: 'Showing full-time jobs.' }
      if (/\b(part.?time)\b/.test(text))
        return { action: 'filter_jobs', filters: { job_type: 'PART_TIME' }, message: 'Showing part-time jobs.' }
      const q = text.replace(/\b(search|find|show|browse|jobs?|for|me)\b/g, '').trim()
      if (q) return { action: 'search_jobs', query: q }
      return { action: 'navigate', route: '/jobs' }
    }
    if (/\b(dashboard|home)\b/.test(text))   return { action: 'navigate', route: '/dashboard' }
    if (/\b(resume|profile)\b/.test(text))   return { action: 'navigate', route: '/resumes' }
    if (/\b(resource|help)\b/.test(text))    return { action: 'navigate', route: '/resources' }
    if (/\b(application)\b/.test(text))      return { action: 'navigate', route: '/applications' }
    return { action: 'unknown' }
  }

  function addHistory(cmd, action, route) {
    setHistory(prev => [{ id: Date.now(), cmd, action, route }, ...prev].slice(0, 8))
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SPEECH RECOGNITION SETUP
  // ─────────────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListeningRef.current) return
    try {
      recognitionRef.current.start()
      setIsListening(true)
      isListeningRef.current = true
    } catch (e) {
      console.warn('Recognition start error', e)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListeningRef.current) return
    try { recognitionRef.current.stop() } catch (_) {}
    setIsListening(false)
    isListeningRef.current = false
  }, [])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition not supported in this browser.')
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous      = true
    rec.interimResults  = false
    rec.lang            = 'en-US'
    recognitionRef.current = rec

    rec.onresult = async (event) => {
      const raw = event.results[event.results.length - 1][0].transcript.toLowerCase().trim()
      if (!raw) return
      setTranscript(raw)

      const wakePhrase = 'hello bandhu'
      if (raw.includes(wakePhrase)) {
        setVoiceAssistantActive(true)
        speak('Hello! How can I help you?', true)
        setStatus('Hello Bandhu active! Listening for your command…', 5000)
        const afterWake = raw.split(wakePhrase).pop()?.trim()
        if (afterWake && afterWake.length > 2) {
          await processCommand(afterWake)
        }
        return
      }

      if (activeRef.current) {
        await processCommand(raw)
      }
    }

    rec.onerror = (e) => {
      if (['no-speech', 'aborted'].includes(e.error)) return
      if (e.error === 'not-allowed') {
        speak('Microphone permission was denied. Please allow microphone access.', true)
        setVoiceAssistantActive(false)
        return
      }
      console.warn('Speech error:', e.error)
    }

    rec.onend = () => {
      isListeningRef.current = false
      setIsListening(false)
      // Auto-restart while voice nav is enabled
      if (settingsRef.current?.voiceNavigation) {
        setTimeout(() => {
          if (!isListeningRef.current && settingsRef.current?.voiceNavigation) startListening()
        }, 500)
      }
    }

    return () => {
      try { rec.stop() } catch (_) {}
      recognitionRef.current = null
    }
  }, []) // eslint-disable-line

  // ── Auto-start/stop based on settings ──
  useEffect(() => {
    if (settings.voiceNavigation) {
      startListening()
      if (isBlind) speak('Voice navigation enabled. Say hello bandhu followed by your command.', true)
    } else {
      stopListening()
    }
  }, [settings.voiceNavigation]) // eslint-disable-line

  // ── Auto-activate for blind users ──
  useEffect(() => {
    if (isBlind && !settings.voiceNavigation) {
      // Soft prompt
      setTimeout(() => {
        speak('Tip: Enable voice navigation in accessibility settings to use Hello Bandhu voice commands.', false)
      }, 2000)
    }
  }, [isBlind]) // eslint-disable-line

  // ── Keyboard shortcut Alt+V ──
  useEffect(() => {
    const handler = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        if (isListeningRef.current) stopListening()
        else startListening()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [startListening, stopListening])

  // ── Announce page changes for blind users ──
  useEffect(() => {
    if (!isBlind || !settings.voiceNavigation) return
    const pageMap = {
      '/jobs': 'Browse Jobs page. Say read aloud to hear job listings.',
      '/dashboard': 'Dashboard page.',
      '/resumes': 'Resume manager page.',
      '/resources': 'Resources page.',
      '/applications': 'My Applications page.',
      '/accessibility': 'Accessibility Settings page.',
    }
    const msg = pageMap[location.pathname] || `You are now on ${location.pathname}.`
    setTimeout(() => speak(msg, false), 600)
  }, [location.pathname]) // eslint-disable-line

  // ── Render ──
  const showButton = settings.voiceNavigation || isBlind

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none"
      role="complementary"
      aria-label="Voice navigation assistant"
    >
      {/* Status / transcript bubble */}
      <AnimatePresence>
        {(isListening || transcript || isProcessing || statusMsg) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white border border-[#E5E7EB] text-[#111827] px-4 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] pointer-events-auto max-w-xs"
            role="status"
            aria-live="polite"
          >
            {isListening && (
              <p className="text-sm font-sans flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                {activeRef.current ? 'Bandhu listening…' : 'Waiting for "Hello Bandhu"…'}
              </p>
            )}
            {isProcessing && (
              <p className="text-sm font-sans flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#111827] shrink-0" />
                Processing command…
              </p>
            )}
            {transcript && !isProcessing && (
              <p className="text-xs font-sans text-[#475569] mt-1 italic">"{transcript}"</p>
            )}
            {statusMsg && !isProcessing && (
              <p className="text-xs font-sans font-medium text-[#111827] mt-1">{statusMsg}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command history panel */}
      <AnimatePresence>
        {showPanel && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 w-72 pointer-events-auto"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold font-sans text-gray-900">Command History</h4>
              <button onClick={() => setShowPanel(false)} className="text-gray-400 hover:text-gray-700" aria-label="Close history">
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {history.map(item => (
                <li key={item.id} className="text-xs font-sans p-2 bg-[#FAFAF8] rounded-lg border border-[#E5E7EB]">
                  <p className="text-[#111827] font-medium truncate">"{item.cmd}"</p>
                  <p className="text-[#475569] truncate mt-0.5 capitalize font-semibold tracking-wide text-[10px]">
                    {item.action?.replace(/_/g, ' ')} {item.route ? `→ ${item.route}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick command tip (shown when voice is active) */}
      <AnimatePresence>
        {isVoiceAssistantActive && !isListening && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-[#111827] border border-[#111827] text-white shadow-xl text-[11px] px-4 py-3 rounded-2xl max-w-[220px] pointer-events-none text-center font-sans tracking-wide leading-relaxed"
          >
            Say: "search Python jobs" · "read aloud" · "show remote jobs" · "apply for Designer"
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button row */}
      <div className="flex gap-2 pointer-events-auto">
        {/* History toggle */}
        {history.length > 0 && (
          <button
            onClick={() => setShowPanel(v => !v)}
            className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Show command history"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* Read aloud quick button */}
        <button
          onClick={readPageAloud}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-lg border border-[#E5E7EB] hover:bg-[#FAFAF8] transition-colors"
          aria-label="Read page aloud"
          title="Read page aloud"
        >
          <Volume2 className="w-5 h-5 text-[#111827]" />
        </button>

        {/* Main mic button */}
        <button
          onClick={() => {
            if (isListeningRef.current) stopListening()
            else startListening()
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all relative border border-[#E5E7EB] ${
            isVoiceAssistantActive
              ? 'bg-[#111827] text-white border-[#111827] scale-105'
              : isListening
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white text-[#111827] hover:border-[#111827]'
          }`}
          aria-label={
            isVoiceAssistantActive
              ? 'Voice assistant active. Click to toggle listening.'
              : isListening
              ? 'Listening for Hello Bandhu. Click to stop.'
              : 'Start voice navigation (Alt+V)'
          }
          aria-pressed={isListening}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-50" />
          )}
          {isProcessing
            ? <Loader2 className="w-6 h-6 animate-spin" />
            : isListening
            ? <Mic className="w-6 h-6 animate-pulse" />
            : <Mic className="w-6 h-6" />
          }
        </button>
      </div>

      {/* Keyboard hint */}
      {!isBlind && (
        <p className="text-xs text-gray-500 font-sans pointer-events-none pr-1 text-right">
          Alt+V to toggle
        </p>
      )}
    </div>
  )
}
