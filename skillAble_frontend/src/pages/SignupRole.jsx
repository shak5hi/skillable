import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, UserPlus } from 'lucide-react'

export default function SignupRole() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex flex-col flex-1 bg-[var(--color-primary)] text-white p-12 justify-between relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[var(--color-primary-light)] rounded-full blur-[100px] opacity-50" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[var(--color-primary-dark)] rounded-full blur-[100px] opacity-50" />
        
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="text-3xl font-serif hover:text-white focus-ring rounded-md">
            SkillAble
          </Link>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-5xl font-serif leading-tight">
            Join a platform built on <span className="text-[var(--color-accent)]">dignity and ability.</span>
          </h2>
          <p className="text-xl font-sans text-teal-100/90 leading-relaxed">
            Whether you're bringing your exceptional skills to the table or looking to hire extraordinary talent, your journey starts here.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-teal-200">
          © {new Date().getFullYear()} SkillAble.
        </div>
      </div>

      {/* Right Pane - Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 w-full max-w-3xl mx-auto">
        <div className="lg:hidden mb-12">
          <Link to="/" className="text-3xl font-serif text-[var(--color-primary)] focus-ring rounded-md">
            SkillAble
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div>
            <h1 className="text-4xl font-serif text-[var(--color-foreground)]">Create your account</h1>
            <p className="mt-3 text-lg text-gray-600 font-sans">How would you like to use SkillAble?</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/signup/seeker')}
              className="flex flex-col items-center p-8 border-2 border-[var(--color-border)] rounded-2xl hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] focus-ring transition-all group group-hover:shadow-md text-center text-left"
              aria-label="Sign up as a Job Seeker"
            >
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <UserPlus className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">I'm looking for a job</h3>
              <p className="text-sm font-sans text-gray-500 mt-2">Create your accessible profile and find inclusive opportunities.</p>
            </button>

            <button
              onClick={() => navigate('/signup/employer')}
              className="flex flex-col items-center p-8 border-2 border-[var(--color-border)] rounded-2xl hover:border-[var(--color-accent)] hover:bg-[#fffbf0] focus-ring transition-all group group-hover:shadow-md text-center text-left"
              aria-label="Sign up as an Employer"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-[var(--color-accent)]" />
              </div>
              <h3 className="text-xl font-serif font-bold text-gray-900 group-hover:text-[var(--color-accent)] transition-colors">I'm hiring</h3>
              <p className="text-sm font-sans text-gray-500 mt-2">Post jobs and connect with a diverse, talented workforce.</p>
            </button>
          </div>

          <p className="text-center font-sans text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:underline focus-ring rounded-sm">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
