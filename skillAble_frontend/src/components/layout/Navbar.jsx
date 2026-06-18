// src/components/layout/Navbar.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../common/Button'
import { useAuthStore } from '../../store/authStore'
import { useAccessibilityStore } from '../../store/accessibilityStore'

export function Navbar() {
  const { user, logout } = useAuthStore()
  const { toggleHighContrast, settings } = useAccessibilityStore()

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-md border-b border-[var(--color-border)] px-4 sm:px-8 py-3 w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-2xl font-serif text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors focus-ring rounded-md px-2 py-1"
            aria-label="SkillAble Home"
          >
            SkillAble
          </Link>
          
          <nav className="hidden md:flex items-center gap-4" aria-label="Main navigation">
            <Link to="/jobs" className="font-sans font-medium text-gray-700 hover:text-[var(--color-primary)] focus-ring rounded-md px-3 py-2">Jobs</Link>
            <Link to="/resources" className="font-sans font-medium text-gray-700 hover:text-[var(--color-primary)] focus-ring rounded-md px-3 py-2">Resources</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleHighContrast}
            className="p-2 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] focus-ring transition-colors"
            aria-label={settings.highContrast ? "Disable high contrast" : "Enable high contrast"}
            aria-pressed={settings.highContrast}
          >
            <span aria-hidden="true" className="text-xl">◑</span>
          </button>
          
          {user ? (
            <>
              <Link to={user.role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard'}>
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
