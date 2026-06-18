import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─────────────────────────────────────────────────────────────────────────────
// Accessibility Store
//
// Persisted to localStorage under key 'accessibility-storage'.
// App.jsx AccessibilitySync reads user.seeker_profile.disability_type on login
// and calls updateSettings() to pre-configure the correct features.
// ─────────────────────────────────────────────────────────────────────────────

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      settings: {
        screenReader:         false,
        voiceNavigation:      false,
        signLanguageSupport:  false,
        highContrast:         false,
        fontSize:             'medium', // 'small' | 'medium' | 'large'
      },

      // true after user says "Hello Bandhu" — voice agent enters active command mode
      isVoiceAssistantActive: false,

      // ── Setters ──────────────────────────────────────────────────────────

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      toggleHighContrast: () =>
        set((state) => ({
          settings: { ...state.settings, highContrast: !state.settings.highContrast },
        })),

      toggleVoiceNavigation: () =>
        set((state) => ({
          settings: { ...state.settings, voiceNavigation: !state.settings.voiceNavigation },
        })),

      setVoiceAssistantActive: (active) =>
        set(() => ({ isVoiceAssistantActive: active })),

      // ── Sync all preferences from backend API response ────────────────────
      // Call this after login with the user.accessibility object
      syncFromBackend: (accessibilityPrefs) => {
        if (!accessibilityPrefs) return
        set((state) => ({
          settings: {
            ...state.settings,
            screenReader:        accessibilityPrefs.screen_reader        ?? state.settings.screenReader,
            voiceNavigation:     accessibilityPrefs.voice_navigation      ?? state.settings.voiceNavigation,
            signLanguageSupport: accessibilityPrefs.sign_language_support ?? state.settings.signLanguageSupport,
          },
        }))
      },
    }),
    {
      name: 'accessibility-storage',
      // Only persist user preferences, not the transient active state
      partialize: (state) => ({ settings: state.settings }),
    }
  )
)
