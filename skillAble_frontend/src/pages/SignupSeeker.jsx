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
    <div className="flex min-h-screen bg-[#FAFAF8] text-[#111827] font-sans">

      {/* ── Left form pane ── */}
      <div className="w-full lg:w-[45%] flex flex-col px-6 py-12 sm:px-12 xl:px-24 relative z-10 overflow-y-auto">
        
        <div className="mb-12 mt-4 lg:mt-0">
          <Link to="/" style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl font-bold tracking-tight text-[#111827]">
            SkillAble.
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-10 max-w-md mx-auto w-full">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-8 h-[1px] bg-[#111827]"></div>
            <span className="text-[#111827] font-bold text-[10px] uppercase tracking-widest">Step {step} of 3</span>
          </div>
          
          <div className="flex items-center gap-3 mb-8">
            {[1, 2, 3].map(n => (
              <React.Fragment key={n}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  step > n ? 'bg-[#111827] text-white' :
                  step === n ? 'bg-[#111827] text-white ring-4 ring-[#111827]/10' :
                  'bg-white border border-[#E5E7EB] text-[#475569]'
                }`} aria-current={step === n ? 'step' : undefined}>
                  {step > n ? <CheckCircle className="w-4 h-4" /> : n}
                </div>
                {n < 3 && <div className={`flex-1 h-[1px] transition-all ${step > n ? 'bg-[#111827]' : 'bg-[#E5E7EB]'}`} />}
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#111827]">{stepTitles[step - 1]}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto w-full" noValidate>
          {error && (
            <div className="p-4 bg-red-50 text-red-800 border border-red-200 text-[13px] font-medium" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Step 1: Account details ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Full Name</label>
                  <input name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="As on Aadhaar card" className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Email Address</label>
                  <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Password</label>
                  <input name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="Min. 8 characters" className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Confirm Password</label>
                  <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required placeholder="Repeat your password" className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Identity verification ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <fieldset>
                  <legend className="text-[11px] uppercase tracking-widest font-bold text-[#111827] mb-4">Disability Type</legend>
                  <div className="flex flex-col gap-3">
                    {disabilityOptions.map(opt => (
                      <label
                        key={opt.id}
                        className={`relative cursor-pointer border px-5 py-4 flex items-center gap-4 transition-all rounded-[20px] ${
                          formData.disabilityType === opt.id
                            ? 'border-[#111827] bg-white shadow-md'
                            : 'border-[#E5E7EB] bg-transparent hover:border-[#111827]'
                        }`}
                      >
                        <input type="radio" name="disabilityType" value={opt.id} checked={formData.disabilityType === opt.id} onChange={handleChange} className="sr-only" />
                        <div className={`p-2.5 rounded-full border ${formData.disabilityType === opt.id ? 'bg-[#111827] text-white border-[#111827]' : 'bg-[#FAFAF8] text-[#111827] border-[#E5E7EB]'}`}>
                          <opt.icon className="w-5 h-5" strokeWidth={1.5} />
                        </div>
                        <div className="flex flex-col">
                          <span className={`font-bold text-[12px] uppercase tracking-wider mb-1 ${formData.disabilityType === opt.id ? 'text-[#111827]' : 'text-[#475569]'}`}>{opt.label}</span>
                          <span className="text-[11px] text-[#475569] font-light leading-snug">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="space-y-5 pt-6 border-t border-[#E5E7EB]">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Aadhaar Number (12 digits)</label>
                    <input name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleChange} required maxLength={12} placeholder="0000 0000 0000" className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm mb-1" />
                    <p className="text-[10px] text-[#475569] flex items-center gap-1.5 uppercase tracking-wide ml-4">
                      <Lock className="w-3 h-3 text-[#475569]" /> Stored as SHA-256 hash
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">PWD Certificate ID</label>
                    <input name="pwdCertificateId" value={formData.pwdCertificateId} onChange={handleChange} required placeholder="E.g. UP/0000000" className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Accessibility preferences ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <p className="text-[13px] text-[#475569] font-light leading-relaxed">
                  Based on your disability type (<strong>{formData.disabilityType}</strong>), we've pre-selected the most relevant accessibility features. You can change these at any time in Settings.
                </p>

                <div className="space-y-3">
                  {prefOptions.map(pref => (
                    <label key={pref.id} className="flex items-start justify-between gap-4 p-5 border border-[#E5E7EB] bg-white hover:border-[#111827] cursor-pointer transition-colors rounded-[20px] shadow-sm">
                      <div>
                        <p className="font-bold text-[12px] uppercase tracking-wider text-[#111827] mb-1">{pref.title}</p>
                        <p className="text-[11px] text-[#475569] font-light">{pref.desc}</p>
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
                        <div className="w-12 h-6 bg-[#FAFAF8] border border-[#E5E7EB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-[#E5E7EB] peer-checked:after:bg-[#111827] after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#FAFAF8] peer-checked:border-[#111827]" />
                      </div>
                    </label>
                  ))}
                </div>

                {formData.disabilityType === 'BLIND' && (
                  <div className="p-5 bg-white shadow-sm border border-[#111827] rounded-[20px] text-[13px] text-[#111827] font-light leading-relaxed">
                    🎤 Voice Navigation is enabled — you can say <strong>"Hello Bandhu"</strong> anytime to give voice commands across the entire site.
                  </div>
                )}
                {formData.disabilityType === 'DEAF' && (
                  <div className="p-5 bg-white shadow-sm border border-[#111827] rounded-[20px] text-[13px] text-[#111827] font-light leading-relaxed">
                    🤟 Sign Language Detection will auto-activate during your interview sessions. Interviewers' speech will appear as live captions.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between gap-4 pt-8 mt-8 border-t border-[#E5E7EB]">
            {step > 1 ? (
              <button type="button" onClick={handleBack} className="w-32 border border-[#E5E7EB] bg-white text-[#111827] py-4 text-[11px] uppercase tracking-widest font-bold hover:border-[#111827] transition-colors rounded-full shadow-sm">
                ← Back
              </button>
            ) : (
              <Link to="/signup" className="text-[11px] uppercase tracking-widest text-[#475569] hover:text-[#111827] font-bold self-center border-b border-transparent hover:border-[#111827] transition-all pb-0.5">
                ← Back
              </Link>
            )}
            <button type="submit" disabled={loading} className="flex-1 border border-[#111827] bg-[#111827] text-white py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-[#475569] hover:border-[#475569] transition-colors rounded-full shadow-md">
              {step < 3 ? 'Continue →' : 'Create Account'}
            </button>
          </div>

          <p className="text-center text-[12px] text-[#475569] font-light pt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#111827] font-semibold border-b border-[#111827] hover:opacity-50 pb-0.5">Log in</Link>
          </p>
        </form>
      </div>

      {/* Right Pane - Vibrant Editorial Image */}
      <div className="hidden lg:flex lg:w-[55%] relative h-screen bg-[#F3F4F6] border-l border-[#E5E7EB] items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200" 
          alt="Minimalist architecture" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute bottom-12 right-12 text-white text-right z-10">
           <p className="font-serif text-3xl font-bold leading-tight mb-2">"True inclusion starts with design."</p>
           <p className="text-white/90 text-[11px] uppercase tracking-widest font-bold">SkillAble Platform</p>
        </div>
      </div>
    </div>
  )
}
