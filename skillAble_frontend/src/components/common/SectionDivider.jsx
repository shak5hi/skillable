import React from 'react'

export const SectionDivider = ({ number, title, align = 'center' }) => (
  <div className="w-full flex items-center gap-4 lg:gap-6 mb-12 lg:mb-16">
    <div className="flex gap-2 items-center text-[10px] sm:text-[11px] uppercase tracking-widest text-[#475569] whitespace-nowrap">
      <span className="font-bold">{number}</span>
      <span>{title}</span>
    </div>
    <div className="h-[1px] bg-[#E5E7EB] flex-1"></div>
    {align === 'center' && (
      <>
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#111827] font-bold whitespace-nowrap px-2">skillable.com</span>
        <div className="h-[1px] bg-[#E5E7EB] flex-1"></div>
      </>
    )}
    <span className="text-[10px] sm:text-[11px] text-[#475569] whitespace-nowrap">©{new Date().getFullYear()}</span>
  </div>
)
