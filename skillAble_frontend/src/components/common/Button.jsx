import React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { motion } from 'framer-motion'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  isLoading,
  type = 'button',
  role = 'button',
  ariaLabel,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-sans font-medium rounded-xl transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]",
    accent: "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]",
    coral: "bg-[var(--color-coral)] text-[var(--color-foreground)] hover:bg-[var(--color-coral-light)]",
    outline: "border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)]",
    ghost: "text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)]"
  }
  
  const sizes = {
    sm: "px-4 py-2 text-sm min-h-[44px]", // Min touch target 44px
    md: "px-6 py-3 text-base min-h-[48px]",
    lg: "px-8 py-4 text-lg min-h-[56px]"
  }

  return (
    <motion.button
      type={type}
      role={role}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      whileTap={{ scale: 0.97 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </motion.button>
  )
}
