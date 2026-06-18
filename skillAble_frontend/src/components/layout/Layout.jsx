// src/components/layout/Layout.jsx
import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { SkipToMain } from '../common/SkipToMain'
import { useAccessibilityStore } from '../../store/accessibilityStore'

export function Layout() {
  const { settings } = useAccessibilityStore()

  useEffect(() => {
    // Apply high contrast styling globally by toggling a class on the document body
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [settings.highContrast])

  return (
    <div className="flex flex-col min-h-screen">
      <SkipToMain />
      <Navbar />
      <main id="main-content" className="flex-grow focus:outline-none" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
