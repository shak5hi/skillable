import React from 'react'
import { cn } from './Button'

export function Badge({ 
  children, 
  variant = 'primary', 
  className 
}) {
  const variants = {
    primary: "bg-[var(--color-primary)] text-white shadow-sm",
    coral: "bg-[var(--color-coral)] text-[var(--color-foreground)]",
    secondary: "bg-[var(--color-border)] text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
    ghost: "bg-transparent text-[var(--color-primary)] opacity-80"
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md", // Humanist type size
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
