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
      
      // Assume returning { user, access, refresh }
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
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      {/* Left Pane - Branding */}
      <div className="hidden lg:flex flex-col flex-1 bg-[var(--color-primary)] text-white p-12 justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-32 -mr-32 w-96 h-96 bg-[var(--color-accent)] rounded-full blur-[100px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-0 -left-32 w-[600px] h-[600px] bg-teal-400 rounded-full blur-[120px] opacity-20 mix-blend-screen" />
        
        <div className="relative z-10 flex items-center gap-3">
          <Link to="/" className="text-3xl font-serif focus-ring rounded-md">SkillAble</Link>
        </div>
        
        <div className="relative z-10 space-y-6 max-w-lg">
          <h2 className="text-5xl font-serif leading-tight">
             Welcome back to an <br/><span className="text-[var(--color-accent)]">inclusive future.</span>
          </h2>
          <p className="text-lg font-sans text-teal-100/90 leading-relaxed">
            Log in to continue your journey. Your skills and talents are needed now more than ever.
          </p>
        </div>
        
        <div className="relative z-10 text-sm text-teal-200 font-sans">
           Breaking barriers, building careers.
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 w-full max-w-2xl mx-auto">
        
        <div className="lg:hidden mb-12 flex justify-center">
          <Link to="/" className="text-4xl font-serif text-[var(--color-primary)]">SkillAble</Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-[var(--color-border)]"
        >
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-gray-900">Sign in</h1>
            <p className="mt-3 text-lg font-sans text-gray-600">Access your dashboard and opportunities.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm font-medium" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Email address"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
              />
              
              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-11 text-gray-400 hover:text-gray-600 focus-ring rounded-full p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-sans font-medium">
                  Remember me
                </label>
              </div>

              <div className="text-sm font-sans">
                <Link to="/forgot-password" className="font-semibold text-[var(--color-primary)] hover:underline focus-ring rounded-sm">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-lg" isLoading={loading}>
              Log in to your account
            </Button>
          </form>

          <div className="pt-8 border-t border-[var(--color-border)] text-center relative">
            <h3 className="text-sm font-medium text-gray-500 mb-4 bg-white px-4 inline-block relative -top-7">New to SkillAble?</h3>
            <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm font-sans">
              <Link to="/signup/seeker" className="font-semibold text-[var(--color-primary)] p-3 border border-[var(--color-primary)]/20 rounded-xl hover:bg-[var(--color-primary)]/5 focus-ring flex items-center justify-center gap-2 transition-colors">
                <User className="w-4 h-4" /> Sign up as Job Seeker
              </Link>
              <Link to="/signup/employer" className="font-semibold text-gray-700 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 focus-ring flex items-center justify-center gap-2 transition-colors">
                <Lock className="w-4 h-4" /> Sign up as Employer
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
