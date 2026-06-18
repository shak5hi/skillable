// src/components/layout/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--color-border)] py-12 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1 space-y-4">
          <Link to="/" className="text-2xl font-serif text-[var(--color-primary)] hover:underline focus-ring rounded-sm">
            SkillAble
          </Link>
          <p className="text-sm text-gray-600 font-sans max-w-xs mt-2">
            Your skills define you. Not your disability. An inclusive platform connecting talented individuals with equal opportunity employers.
          </p>
        </div>
        
        <nav aria-label="Footer Navigation">
          <h3 className="font-sans font-bold text-gray-900 mb-4">Platform</h3>
          <ul className="space-y-3">
            <li><Link to="/jobs" className="text-sm text-gray-600 hover:text-[var(--color-primary)] focus-ring rounded-sm focus:outline-none">Find Jobs</Link></li>
            <li><Link to="/resources" className="text-sm text-gray-600 hover:text-[var(--color-primary)] focus-ring rounded-sm focus:outline-none">Resources</Link></li>
            <li><Link to="/accessibility" className="text-sm text-gray-600 hover:text-[var(--color-primary)] focus-ring rounded-sm focus:outline-none">Accessibility</Link></li>
          </ul>
        </nav>
        
        <nav aria-label="Company Navigation">
          <h3 className="font-sans font-bold text-gray-900 mb-4">Company</h3>
          <ul className="space-y-3">
            <li><Link to="/about" className="text-sm text-gray-600 hover:text-[var(--color-primary)] focus-ring rounded-sm focus:outline-none">About Us</Link></li>
            <li><Link to="/employers" className="text-sm text-gray-600 hover:text-[var(--color-primary)] focus-ring rounded-sm focus:outline-none">For Employers</Link></li>
            <li><Link to="/contact" className="text-sm text-gray-600 hover:text-[var(--color-primary)] focus-ring rounded-sm focus:outline-none">Contact</Link></li>
          </ul>
        </nav>
        
        <div>
          <h3 className="font-sans font-bold text-gray-900 mb-4">Accessibility Statement</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience and applying WCAG standards.
          </p>
          <div className="inline-flex items-center gap-2 border border-green-200 bg-green-50 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium">
            <span aria-hidden="true" className="w-2 h-2 rounded-full bg-green-500"></span>
            WCAG AA Compliant
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} SkillAble. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900 focus-ring rounded-sm">Privacy</Link>
          <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900 focus-ring rounded-sm">Terms</Link>
        </div>
      </div>
    </footer>
  )
}
