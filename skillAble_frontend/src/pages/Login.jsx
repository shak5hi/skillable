import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data } = await api.post('/api/auth/login/', formData)
      
      setAuth(data.user, data.access, data.refresh)
      
      if (data.user?.role === 'EMPLOYER') {
        navigate('/employer/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF8] text-[#111827] font-sans">
      
      {/* ── Left form pane ── */}
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
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-8 h-[1px] bg-[#111827]"></div>
              <span className="text-[#111827] font-bold text-[10px] uppercase tracking-widest">Welcome Back</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-serif text-[#111827] leading-tight mb-3">Log in.</h1>
            <p className="text-sm font-light text-[#475569]">Access your dashboard and continue your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-800 border border-red-200 text-[13px] font-medium" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] text-[#111827] focus:outline-none focus:border-[#111827] transition-colors rounded-full shadow-sm"
                  autoComplete="email"
                />
              </div>
              
              <div className="relative">
                <label className="block text-[11px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Password</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] text-[#111827] focus:outline-none focus:border-[#111827] transition-colors rounded-full shadow-sm"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-9 text-[#475569] hover:text-[#111827]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded-none border border-[#E5E7EB] text-[#111827] focus:ring-[#111827]"
                />
                <label htmlFor="remember-me" className="text-[13px] text-[#475569] font-light">
                  Remember me
                </label>
              </div>

              <Link to="/forgot-password" className="text-[13px] text-[#111827] font-semibold border-b border-[#111827] pb-0.5 hover:opacity-50 transition-opacity">
                Forgot password?
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#111827] text-white py-4 text-[12px] uppercase tracking-widest font-bold hover:bg-[#475569] transition-colors flex justify-center items-center rounded-full mt-4 shadow-md"
            >
              {loading ? "Logging in..." : "Log in to your account"}
            </button>
          </form>

          <div className="pt-10 mt-10 border-t border-[#E5E7EB]">
            <p className="text-[11px] uppercase tracking-widest text-[#475569] mb-4 font-bold ml-2">New to SkillAble?</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup/seeker" className="flex-1 bg-white border border-[#E5E7EB] text-[#111827] py-3.5 flex justify-center items-center gap-2 text-[11px] uppercase tracking-widest font-bold hover:border-[#111827] transition-colors rounded-full shadow-sm">
                <User className="w-3.5 h-3.5" /> Job Seeker
              </Link>
              <Link to="/signup/employer" className="flex-1 bg-white border border-[#E5E7EB] text-[#475569] py-3.5 flex justify-center items-center gap-2 text-[11px] uppercase tracking-widest font-bold hover:border-[#111827] hover:text-[#111827] transition-colors rounded-full shadow-sm">
                <Lock className="w-3.5 h-3.5" /> Employer
              </Link>
            </div>
          </div>
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
