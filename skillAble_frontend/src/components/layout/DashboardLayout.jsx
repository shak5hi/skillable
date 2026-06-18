import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { SkipToMain } from '../common/SkipToMain'
import { useAuthStore } from '../../store/authStore'
import { useAccessibilityStore } from '../../store/accessibilityStore'

export function DashboardLayout() {
  const { user } = useAuthStore()
  const { settings } = useAccessibilityStore()

  // High contrast + font-size are handled globally by App.jsx AccessibilitySync,
  // but we also keep them in the layout so the dashboard route picks up
  // any changes made mid-session on the Accessibility Settings page.
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', !!settings.highContrast)
  }, [settings.highContrast])

  useEffect(() => {
    const sizeMap = { small: '14px', medium: '16px', large: '19px' }
    document.documentElement.style.fontSize = sizeMap[settings.fontSize] || '16px'
  }, [settings.fontSize])

  return (
    <div
      className="flex min-h-screen bg-[var(--color-surface)] font-sans"
      // Tell screen readers what mode we are in
      aria-label="SkillAble application"
    >
      <SkipToMain />

      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0 z-20">
        <Sidebar role={user?.role} />
      </div>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 flex flex-col focus:outline-none relative w-full overflow-hidden"
        tabIndex={-1}
        aria-label="Main content"
      >
        {/* Screen-reader mode indicator (invisible but read by SRs) */}
        {settings.screenReader && (
          <div className="sr-only" aria-live="polite">
            Screen reader mode is active. Use Tab to navigate between sections.
          </div>
        )}

        <div className="flex-1 overflow-y-auto w-full p-6 sm:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
