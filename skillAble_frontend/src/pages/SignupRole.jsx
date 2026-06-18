import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, UserPlus } from 'lucide-react'

export default function SignupRole() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-[#FAFAF8] text-[#111827] font-sans">
      
      {/* Left Pane - Content */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-12 sm:px-12 xl:px-24 relative z-10">
        
        <div className="mb-12 mt-4 lg:mt-0 lg:absolute lg:top-12 lg:left-12 xl:left-24">
          <Link to="/" style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl font-bold tracking-tight text-[#111827]">
            SkillAble.
          </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto space-y-12"
        >
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[1px] bg-[#111827]"></div>
              <span className="text-[#111827] font-bold text-[10px] uppercase tracking-widest">Join Us</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif text-[#111827] leading-tight mb-3">Create an account.</h1>
            <p className="text-sm font-light text-[#475569]">How would you like to use SkillAble?</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/signup/seeker')}
              className="w-full flex items-center p-6 border border-[#E5E7EB] bg-white hover:border-[#111827] transition-all group text-left rounded-[24px] shadow-sm"
            >
              <div className="w-12 h-12 bg-[#FAFAF8] rounded-full border border-[#E5E7EB] flex items-center justify-center mr-6 group-hover:bg-[#111827] group-hover:border-[#111827] transition-colors">
                <UserPlus className="w-5 h-5 text-[#111827] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#111827] mb-1">I'm looking for a job</h3>
                <p className="text-[12px] font-light text-[#475569]">Create your accessible profile.</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/signup/employer')}
              className="w-full flex items-center p-6 border border-[#E5E7EB] bg-white hover:border-[#111827] transition-all group text-left rounded-[24px] shadow-sm"
            >
              <div className="w-12 h-12 bg-[#FAFAF8] rounded-full border border-[#E5E7EB] flex items-center justify-center mr-6 group-hover:bg-[#111827] group-hover:border-[#111827] transition-colors">
                <Briefcase className="w-5 h-5 text-[#111827] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#111827] mb-1">I'm hiring</h3>
                <p className="text-[12px] font-light text-[#475569]">Connect with extraordinary talent.</p>
              </div>
            </button>
          </div>

          <p className="text-[13px] font-light text-[#475569] pt-8 border-t border-[#E5E7EB]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#111827] border-b border-[#111827] pb-0.5 hover:opacity-50 transition-opacity">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Pane - Vibrant Editorial Image */}
      <div className="hidden lg:flex lg:w-[55%] relative h-screen bg-[#F3F4F6] border-l border-[#E5E7EB] items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200" 
          alt="Minimalist architecture" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute bottom-12 right-12 text-white text-right z-10">
           <p className="font-serif text-3xl font-bold leading-tight mb-2">"True inclusion starts with design."</p>
           <p className="text-white/90 text-[11px] uppercase tracking-widest font-bold">SkillAble Platform</p>
        </div>
      </div>
      
    </div>
  )
}
