import { create } from 'zustand'

// ── Helpers ──────────────────────────────────────────────────────────────────
// The login API returns: { user: { seeker_profile: { disability_type, ... }, accessibility: { ... } } }
// These selectors centralise the nested access so components never need to reach deep.

export function getDisabilityType(user) {
  return user?.seeker_profile?.disability_type || null
}

export function isDeafUser(user) {
  return getDisabilityType(user) === 'DEAF'
}

export function isBlindUser(user) {
  return getDisabilityType(user) === 'BLIND'
}

// ─────────────────────────────────────────────────────────────────────────────

export const useAuthStore = create(set => ({
  user: (() => {
    try {
      const raw = localStorage.getItem('user')
      if (!raw || raw === 'undefined') return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  })(),
  accessToken:     localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (user, access, refresh) => {
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, accessToken: access, isAuthenticated: true })
  },

  logout: () => {
    localStorage.clear()
    set({ user: null, accessToken: null, isAuthenticated: false })
  },
}))
