import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Ear, Eye, ShieldCheck, Lock, HandMetal, CheckCircle } from 'lucide-react'
import { Button }  from '../components/common/Button'
import { Input }   from '../components/common/Input'
import { useAuthStore } from '../store/authStore'
import { useAccessibilityStore } from '../store/accessibilityStore'
import api from '../api/axios'

// ─────────────────────────────────────────────────────────────────────────────
// SignupSeeker
// When a user selects DEAF or BLIND, the relevant accessibility toggles are
// automatically pre-checked (they can still change them manually).
// ─────────────────────────────────────────────────────────────────────────────
export default function SignupSeeker() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { updateSettings } = useAccessibilityStore()

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
    aadhaarNumber:   '',
    pwdCertificateId:'',
    disabilityType:  'DEAF',
    preferences: {
      screenReader:         false,
      voiceNavigation:      false,
      signLanguageSupport:  true,   // pre-checked for default DEAF selection
      highContrast:         false,
    }
  })

  // ── Auto-toggle prefs when disability type changes ──────────────────────
  useEffect(() => {
    const type = formData.disabilityType
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        screenReader:        type === 'BLIND',
        voiceNavigation:     type === 'BLIND',
        signLanguageSupport: type === 'DEAF',
      }
    }))
  }, [formData.disabilityType])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('pref_')) {
      const prefKey = name.replace('pref_', '')
      setFormData(prev => ({
        ...prev,
        preferences: { ...prev.preferences, [prefKey]: checked }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const handleNext = () => {
    // Basic validation per step
    if (step === 1) {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
        setError('Please fill in all required fields.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }
    if (step === 2) {
      if (!formData.aadhaarNumber || !formData.pwdCertificateId) {
        setError('Aadhaar number and PWD Certificate ID are required.')
        return
      }
    }
    setError('')
    setStep(s => s + 1)
  }

  const handleBack = () => { setError(''); setStep(s => s - 1) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step < 3) { handleNext(); return }

    setLoading(true)
    setError('')
    try {
      const payload = {
        full_name:            formData.fullName,
        email:                formData.email,
        password:             formData.password,
        aadhaar_number:       formData.aadhaarNumber,
        pwd_certificate_id:   formData.pwdCertificateId,
        disability_type:      formData.disabilityType,
        screen_reader:        formData.preferences.screenReader,
        voice_navigation:     formData.preferences.voiceNavigation,
        sign_language_support: formData.preferences.signLanguageSupport,
      }

      await api.post('/api/auth/signup/seeker/', payload)

      // Auto-login
      const { data } = await api.post('/api/auth/login/', {
        email: formData.email,
        password: formData.password,
      })

      // Push prefs into accessibility store immediately so the user lands
      // on their dashboard with everything correctly configured
      updateSettings({
        screenReader:        formData.preferences.screenReader,
        voiceNavigation:     formData.preferences.voiceNavigation,
        signLanguageSupport: formData.preferences.signLanguageSupport,
      })

      setAuth(data.user, data.access, data.refresh)

      // Speak welcome for blind users
      if (formData.disabilityType === 'BLIND' && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(
          'Account created! Welcome to SkillAble. Voice navigation is active. ' +
          'Say hello bandhu to get started.'
        )
        utt.rate = 0.9
        window.speechSynthesis.speak(utt)
      }

      navigate('/dashboard')
    } catch (err) {
      console.error('Signup error:', err)
      const d = err.response?.data
      let msg = 'Something went wrong. Please try again.'
      if (!err.response) msg = 'Network Error: Cannot connect to the server. Is the backend running?'
      else if (d?.message) msg = d.message
      else if (d?.detail)  msg = d.detail
      else if (typeof d === 'object') {
        msg = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`).join(' | ')
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const disabilityOptions = [
    {
      id: 'DEAF',
      label: 'Deaf or Hard of Hearing',
      icon: Ear,
      desc: 'Sign language detection + speech-to-text captions in interviews.',
    },
    {
      id: 'BLIND',
      label: 'Visually Impaired',
      icon: Eye,
      desc: 'Voice navigation (Hello Bandhu) + screen reader mode + read-aloud.',
    },
    {
      id: 'OTHER',
      label: 'Other Disability',
      icon: HandMetal,
      desc: 'Choose individual accessibility preferences on the next step.',
    },
  ]

  const prefOptions = [
    { id: 'screenReader',        title: 'Screen Reader Mode',           desc: 'ARIA-enhanced layout for external screen readers.' },
    { id: 'voiceNavigation',     title: 'Voice Navigation (Hello Bandhu)', desc: 'Control the entire site with voice commands.' },
    { id: 'signLanguageSupport', title: 'Sign Language Detection',      desc: 'MediaPipe hand-tracking in interview sessions.' },
    { id: 'highContrast',        title: 'High Contrast Mode',           desc: 'Increased colour contrast across the interface.' },
  ]

  const stepTitles = [
    'Create your account',
    'Verify your identity',
    'Set up accessibility',
  ]

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">

      {/* ── Left branding pane ── */}
      <div className="hidden lg:flex flex-col flex-1 bg-[var(--color-primary)] text-white p-12 justify-between relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-400 rounded-full blur-[100px] opacity-30" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-[120px] opacity-20" />
        <Link to="/" className="text-4xl font-serif focus-ring rounded-md relative z-10">SkillAble</Link>
        <div className="relative z-10 space-y-8 max-w-lg">
          <blockquote className="text-4xl font-serif leading-tight">
            "Your profile highlights exactly what you can do, and handles what you need to do it."
          </blockquote>
          <div className="flex gap-3 text-teal-100/80 items-center bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm shadow-xl">
            <ShieldCheck className="w-8 h-8 text-[var(--color-accent)] shrink-0" />
            <p className="font-sans text-sm">Your data is strictly confidential and shared only with verified inclusive employers.</p>
          </div>
        </div>
      </div>

      {/* ── Right form pane ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 max-w-3xl mx-auto w-full overflow-y-auto">

        {/* Progress */}
        <div className="mb-10">
          <Link to="/" className="text-2xl font-serif text-[var(--color-primary)] lg:hidden mb-8 block">SkillAble</Link>
          <div className="flex items-center gap-3 mb-3">
            {[1, 2, 3].map(n => (
              <React.Fragment key={n}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-sans transition-all ${
                  step > n ? 'bg-[var(--color-primary)] text-white' :
                  step === n ? 'bg-[var(--color-primary)] text-white ring-4 ring-[var(--color-primary)]/30' :
                  'bg-gray-200 text-gray-500'
                }`} aria-current={step === n ? 'step' : undefined}>
                  {step > n ? <CheckCircle className="w-4 h-4" /> : n}
                </div>
                {n < 3 && <div className={`flex-1 h-1 rounded-full transition-all ${step > n ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">{stepTitles[step - 1]}</h1>
          <p className="text-sm text-gray-500 font-sans mt-1">Step {step} of 3</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm font-medium" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Step 1: Account details ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="As on Aadhaar card" autoComplete="name" />
                <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" autoComplete="email" />
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Min. 8 characters" autoComplete="new-password" />
                <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Repeat your password" autoComplete="new-password" />
              </motion.div>
            )}

            {/* ── Step 2: Identity verification ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <fieldset>
                  <legend className="text-base font-sans font-semibold text-gray-900 mb-4">Disability Type</legend>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {disabilityOptions.map(opt => (
                      <label
                        key={opt.id}
                        className={`relative cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-3 text-center transition-all focus-within:ring-4 focus-within:ring-[var(--color-primary)]/40 ${
                          formData.disabilityType === opt.id
                            ? 'border-[var(--color-primary)] bg-teal-50'
                            : 'border-[var(--color-border)] hover:bg-gray-50'
                        }`}
                      >
                        <input type="radio" name="disabilityType" value={opt.id} checked={formData.disabilityType === opt.id} onChange={handleChange} className="sr-only" />
                        <div className={`p-3 rounded-full ${formData.disabilityType === opt.id ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                          <opt.icon className="w-6 h-6" />
                        </div>
                        <span className={`font-sans font-medium text-sm ${formData.disabilityType === opt.id ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}>{opt.label}</span>
                        <span className="text-xs text-gray-500 font-sans leading-tight">{opt.desc}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="grid sm:grid-cols-2 gap-5 pt-4 border-t border-[var(--color-border)]">
                  <div className="space-y-1">
                    <Input label="Aadhaar Number (12 digits)" name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required maxLength={12} placeholder="0000 0000 0000" />
                    <p className="text-xs text-gray-500 flex items-center gap-1.5 font-sans">
                      <Lock className="w-3.5 h-3.5 text-gray-400" /> Stored as SHA-256 hash — never in plain text.
                    </p>
                  </div>
                  <Input label="PWD Certificate ID" name="pwdCertificateId" value={formData.pwdCertificateId} onChange={handleChange} required placeholder="E.g. UP/0000000" />
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Accessibility preferences ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <p className="text-sm text-gray-600 font-sans leading-relaxed">
                  Based on your disability type (<strong>{formData.disabilityType}</strong>), we've pre-selected the most relevant accessibility features. You can change these at any time in Settings.
                </p>

                <div className="space-y-3">
                  {prefOptions.map(pref => (
                    <label key={pref.id} className="flex items-start justify-between gap-4 p-4 rounded-2xl border border-[var(--color-border)] hover:bg-gray-50 cursor-pointer transition-colors">
                      <div>
                        <p className="font-sans font-semibold text-gray-900">{pref.title}</p>
                        <p className="text-sm text-gray-500 font-sans mt-0.5">{pref.desc}</p>
                      </div>
                      <div className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          name={`pref_${pref.id}`}
                          checked={!!formData.preferences[pref.id]}
                          onChange={handleChange}
                          className="sr-only peer"
                          aria-label={`Toggle ${pref.title}`}
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--color-primary)]" />
                      </div>
                    </label>
                  ))}
                </div>

                {formData.disabilityType === 'BLIND' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800 font-sans">
                    🎤 Voice Navigation is enabled — you can say <strong>"Hello Bandhu"</strong> anytime to give voice commands across the entire site.
                  </div>
                )}
                {formData.disabilityType === 'DEAF' && (
                  <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-800 font-sans">
                    🤟 Sign Language Detection will auto-activate during your interview sessions. Interviewers' speech will appear as live captions.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between gap-4 pt-4 border-t border-[var(--color-border)]">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack} className="w-32">← Back</Button>
            ) : (
              <Link to="/signup" className="text-sm text-gray-500 font-sans hover:underline self-center">← Choose role</Link>
            )}
            <Button type="submit" isLoading={loading} className="flex-1 max-w-xs ml-auto">
              {step < 3 ? 'Continue →' : 'Create Account'}
            </Button>
          </div>

          <p className="text-center text-sm font-sans text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
