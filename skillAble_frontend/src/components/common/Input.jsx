import React, { useId } from 'react'
import { cn } from './Button'

export const Input = React.forwardRef(({
  label,
  error,
  helpText,
  id: externalId,
  className,
  type = 'text',
  ...props
}, ref) => {
  const internalId = useId()
  const id = externalId || internalId
  const errorId = `${id}-error`
  const helpId = `${id}-help`
  
  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)}>
      {label && (
        <label 
          htmlFor={id} 
          className="text-base font-sans font-medium text-[var(--color-foreground)]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        type={type}
        className={cn(
          "w-full px-4 py-3 min-h-[44px] rounded-xl border bg-[var(--color-surface)] text-base font-sans outline-none transition-colors",
          "hover:border-gray-400 focus:ring-4 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]",
          error ? "border-red-500 focus:ring-red-500/30 focus:border-red-500" : "border-[var(--color-border)]"
        )}
        aria-invalid={!!error}
        aria-describedby={
          cn(error && errorId, helpText && !error && helpId) || undefined
        }
        {...props}
      />
      
      {/* Polite ARIA live region for dynamic error handling */}
      <div aria-live="polite">
        {error && (
          <p id={errorId} className="text-sm font-sans font-medium text-red-600 mt-1">
            {error}
          </p>
        )}
      </div>

      {helpText && !error && (
        <p id={helpId} className="text-sm font-sans text-gray-500 mt-1">
          {helpText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
