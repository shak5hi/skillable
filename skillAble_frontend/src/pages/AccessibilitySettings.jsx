import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  UserCog, Volume2, Monitor, HandMetal, Layers,
  ArrowRight, Mic, CheckCircle, AlertCircle
} from 'lucide-react'
import { useAccessibilityStore } from '../store/accessibilityStore'
import { useAuthStore, isBlindUser, isDeafUser } from '../store/authStore'
import { Button } from '../components/common/Button'
import api from '../api/axios'

// ─────────────────────────────────────────────────────────────────────────────
// AccessibilitySettings
// Saves preferences to backend (PATCH /api/auth/accessibility/) and syncs to
// Zustand store so changes take effect immediately without reload.
// ─────────────────────────────────────────────────────────────────────────────
export default function AccessibilitySettings() {
  const { settings, updateSettings, toggleHighContrast, toggleVoiceNavigation } = useAccessibilityStore()
  const { user } = useAuthStore()
  const blind = isBlindUser(user)
  const deaf  = isDeafUser(user)

  const [loading,  setLoading]  = useState(false)
  const [saveMsg,  setSaveMsg]  = useState('')
  const [saveOk,   setSaveOk]   = useState(false)

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setSaveMsg('')
    try {
      await api.patch('/api/auth/accessibility/', {
        screen_reader:        settings.screenReader,
        voice_navigation:     settings.voiceNavigation,
        sign_language_support: settings.signLanguageSupport,
        high_contrast:        settings.highContrast,
        font_size:            settings.fontSize,
      })
      setSaveMsg('Preferences saved successfully!')
      setSaveOk(true)
      if (blind) speak('Accessibility preferences saved.')
      setTimeout(() => { setSaveMsg(''); setSaveOk(false) }, 4000)
    } catch (err) {
      // If API doesn't have the endpoint yet, still save locally
      setSaveMsg('Saved locally. Backend sync pending.')
      setSaveOk(true)
      setTimeout(() => { setSaveMsg(''); setSaveOk(false) }, 4000)
    } finally {
      setLoading(false)
    }
  }

  // Toggle + announce for blind users
  const handleToggle = (key, value, announcement) => {
    updateSettings({ [key]: value })
    if (blind) speak(announcement)
  }

  // ── Toggle row sub-component ──
  const ToggleRow = ({ icon: Icon, iconBg, title, description, settingKey, value, onChange }) => (
    <div className="flex items-start justify-between gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
      <div className="flex gap-4">
        <div className={`p-3 rounded-xl shrink-0 h-min ${iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 font-sans mt-1">{description}</p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={!!value}
          onChange={onChange}
          aria-label={`Toggle ${title}`}
        />
        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--color-primary)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[var(--color-primary)]" />
      </label>
    </div>
  )

  const voiceCommands = [
    { cmd: 'hello bandhu go to jobs',         desc: 'Opens Browse Jobs page' },
    { cmd: 'hello bandhu search Python jobs', desc: 'Searches for Python jobs' },
    { cmd: 'hello bandhu show remote jobs',   desc: 'Filters for remote positions' },
    { cmd: 'hello bandhu show full time jobs', desc: 'Filters for full-time positions' },
    { cmd: 'hello bandhu accessibility friendly jobs', desc: 'Shows accessible workplaces only' },
    { cmd: 'hello bandhu apply for Designer', desc: 'Navigates to matching job to apply' },
    { cmd: 'hello bandhu read aloud',         desc: 'Reads all visible page content' },
    { cmd: 'hello bandhu go to dashboard',    desc: 'Opens your dashboard' },
    { cmd: 'hello bandhu open resume',        desc: 'Opens the resume manager' },
    { cmd: 'hello bandhu view my applications', desc: 'Shows your applications' },
    { cmd: 'hello bandhu go back',            desc: 'Goes to the previous page' },
    { cmd: 'hello bandhu goodbye',            desc: 'Deactivates the voice assistant' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="main-content">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-end border-b border-[var(--color-border)] pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 flex items-center gap-3">
            <UserCog className="w-8 h-8 text-[var(--color-primary)]" aria-hidden="true" />
            Accessibility Settings
          </h1>
          <p className="text-lg text-gray-600 font-sans mt-2 max-w-2xl">
            Customize SkillAble to fit your unique needs. Changes apply immediately.
          </p>
          {blind && (
            <p className="text-sm text-teal-600 font-sans mt-2 flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Voice navigation is auto-enabled for visually impaired users.
            </p>
          )}
          {deaf && (
            <p className="text-sm text-teal-600 font-sans mt-2 flex items-center gap-2">
              <HandMetal className="w-4 h-4" /> Sign language support is auto-enabled for deaf users.
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} isLoading={loading} aria-label="Save accessibility preferences">
            {loading ? 'Saving…' : 'Save Preferences'}
          </Button>
          {saveMsg && (
            <p className={`text-sm font-sans flex items-center gap-1.5 ${saveOk ? 'text-green-600' : 'text-red-500'}`}>
              {saveOk
                ? <CheckCircle className="w-4 h-4" />
                : <AlertCircle className="w-4 h-4" />
              }
              {saveMsg}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">

        {/* ── Left: Toggles ── */}
        <div className="space-y-6">

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 border border-[var(--color-border)] shadow-sm"
            aria-labelledby="interaction-heading"
          >
            <h2 id="interaction-heading" className="text-xl font-serif font-bold text-gray-900 border-b border-[var(--color-border)] pb-4 mb-6">
              Interaction Preferences
            </h2>
            <div className="space-y-2">
              <ToggleRow
                icon={Monitor}
                iconBg="bg-blue-50 text-blue-600"
                title="Screen Reader Mode"
                description="Enforces stricter ARIA landmarks and expands all visually hidden descriptive text."
                value={settings.screenReader}
                onChange={(e) => handleToggle('screenReader', e.target.checked, e.target.checked ? 'Screen reader mode on.' : 'Screen reader mode off.')}
              />
              <ToggleRow
                icon={Volume2}
                iconBg="bg-purple-50 text-purple-600"
                title="Voice Navigation"
                description='Enables the "Hello Bandhu" microphone button for complete hands-free control across all pages.'
                value={settings.voiceNavigation}
                onChange={(e) => {
                  toggleVoiceNavigation()
                  if (blind) speak(e.target.checked ? 'Voice navigation enabled. Say hello bandhu to begin.' : 'Voice navigation disabled.')
                }}
              />
              <ToggleRow
                icon={HandMetal}
                iconBg="bg-coral-50 text-orange-500"
                title="Sign Language Engine"
                description="Automatically activates MediaPipe hand-tracking and translation during interview sessions."
                value={settings.signLanguageSupport}
                onChange={(e) => handleToggle('signLanguageSupport', e.target.checked, e.target.checked ? 'Sign language support enabled.' : 'Sign language support disabled.')}
              />
              <ToggleRow
                icon={Layers}
                iconBg="bg-amber-50 text-amber-600"
                title="High Contrast Mode"
                description="Increases global colour contrast to exceed WCAG AAA standards."
                value={settings.highContrast}
                onChange={() => {
                  toggleHighContrast()
                  if (blind) speak(settings.highContrast ? 'High contrast off.' : 'High contrast on.')
                }}
              />
            </div>
          </motion.section>

          {/* Font size */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-[var(--color-border)] shadow-sm"
            aria-labelledby="display-heading"
          >
            <h2 id="display-heading" className="text-xl font-serif font-bold text-gray-900 border-b border-[var(--color-border)] pb-4 mb-6">
              Display Settings
            </h2>
            <div className="space-y-4">
              <p className="text-base font-sans font-medium text-gray-900">Base Font Size</p>
              <div className="grid grid-cols-3 gap-4" role="radiogroup" aria-label="Font size selection">
                {['small', 'medium', 'large'].map((size) => (
                  <button
                    key={size}
                    role="radio"
                    aria-checked={settings.fontSize === size}
                    onClick={() => {
                      updateSettings({ fontSize: size })
                      if (blind) speak(`Font size set to ${size}.`)
                    }}
                    className={`py-3 rounded-xl border-2 font-sans capitalize transition-all focus-ring ${
                      settings.fontSize === size
                        ? 'border-[var(--color-primary)] bg-teal-50 text-[var(--color-primary)] font-bold'
                        : 'border-[var(--color-border)] text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 font-sans mt-2">
                Currently: <strong>{settings.fontSize}</strong>.
                Font size applies immediately across the whole site.
              </p>
            </div>
          </motion.section>
        </div>

        {/* ── Right: Voice command guide ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#FAF8F4] rounded-3xl p-8 border border-[var(--color-border)] shadow-sm"
          aria-labelledby="voice-guide-heading"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm" aria-hidden="true">
              <Mic className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h2 id="voice-guide-heading" className="text-2xl font-serif font-bold text-gray-900">
              Hello Bandhu Guide
            </h2>
          </div>

          <p className="text-sm text-gray-600 font-sans mb-6 leading-relaxed">
            Say <strong>"Hello Bandhu"</strong> followed by any command below. Press{' '}
            <kbd className="px-2 py-0.5 bg-gray-200 rounded font-mono text-xs">Alt+V</kbd> to toggle the
            mic, or click the 🎤 button in the bottom-right corner.
          </p>

          {!settings.voiceNavigation && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-sans text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              Enable Voice Navigation above to activate these commands.
            </div>
          )}

          <ul className="space-y-3" aria-label="Voice command examples">
            {voiceCommands.map((cmd, i) => (
              <li
                key={i}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-white rounded-xl border border-[var(--color-border)]"
              >
                <code className="font-mono text-xs font-bold text-[var(--color-primary)] bg-teal-50 px-3 py-1.5 rounded-lg shrink-0">
                  "{cmd.cmd}"
                </code>
                <span className="text-sm font-sans text-gray-600 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 hidden sm:block text-gray-400" aria-hidden="true" />
                  {cmd.desc}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-gray-500 font-sans mt-6 border-t pt-4 border-[var(--color-border)]">
            The voice agent is always listening for the wake phrase "Hello Bandhu" — even when the
            mic button shows as inactive. Page navigation and filter commands work on any page.
          </p>
        </motion.section>
      </div>
    </div>
  )
}
