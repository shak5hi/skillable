import React from 'react'
import { cn } from './Button'

export function SkipToMain() {
  return (
    <a 
      href="#main-content" 
      className={cn(
        "absolute top-0 left-0 p-3 m-3 -translate-y-16 transition-transform z-50",
        "bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-lg border-2 border-white",
        "focus:translate-y-0 focus:outline-none focus:ring-4 focus:ring-[var(--color-accent)]"
      )}
    >
      Skip to Main Content
    </a>
  )
}
