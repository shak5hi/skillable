import React from 'react'
import { motion } from 'framer-motion'
import { cn } from './Button'

export function SkeletonCard({ className }) {
  // Uses "shimmer" animation not spinner, per requirements
  return (
    <div 
      className={cn("w-full bg-white rounded-2xl shadow-sm p-6 overflow-hidden flex flex-col gap-4 border-l-4 border-[var(--color-border)] relative", className)}
    >
      <motion.div
        className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full"
        animate={{ translateX: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
      <div className="flex gap-4 items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded-md w-1/3" />
          <div className="h-4 bg-gray-200 rounded-md w-1/4" />
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <div className="h-4 bg-gray-200 rounded-md w-full" />
        <div className="h-4 bg-gray-200 rounded-md w-5/6" />
        <div className="h-4 bg-gray-200 rounded-md w-4/6" />
      </div>
      <div className="flex gap-2 pt-4">
        <div className="h-8 bg-gray-200 rounded-full w-20" />
        <div className="h-8 bg-gray-200 rounded-full w-24" />
      </div>
    </div>
  )
}
