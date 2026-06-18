import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Info, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

export default function SignupEmployer() {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    industry: '',
    location: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const payload = {
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password,
        company_name: formData.companyName,
        company_description: formData.companyDescription,
        company_website: formData.companyWebsite,
        industry: formData.industry,
        location: formData.location
      }
      
      await api.post('/api/auth/signup/employer/', payload)
      
      // Auto-login
      const { data } = await api.post('/api/auth/login/', {
        email: formData.email,
        password: formData.password
      })
      
      setAuth(data.user, data.access, data.refresh)
      navigate('/employer/dashboard')
    } catch (err) {
      console.error("Employer Signup error:", err)
      const errorData = err.response?.data
      let errorMsg = 'Something went wrong. Let\'s try that again.'
      
      if (!err.response) {
         errorMsg = 'Network Error: Cannot connect to the backend server at http://127.0.0.1:8000. Is it running?'
      } else if (errorData) {
         if (errorData.message) errorMsg = errorData.message
         else if (errorData.detail) errorMsg = errorData.detail
         else if (typeof errorData === 'object') {
           errorMsg = Object.entries(errorData).map(([key, val]) => `${key}: ${val}`).join(' | ')
         }
      }
      
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAF8] text-[#111827] font-sans">

      {/* ── Left form pane ── */}
      <div className="w-full lg:w-[45%] flex flex-col px-6 py-12 sm:px-12 xl:px-24 relative z-10 overflow-y-auto">
        
        <div className="mb-12 mt-4 lg:mt-0">
          <Link to="/" style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl font-bold tracking-tight text-[#111827]">
            SkillAble.
          </Link>
        </div>

        <div className="mb-10 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#111827]"></div>
            <span className="text-[#111827] font-bold text-[10px] uppercase tracking-widest">Hire Talent</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-[#111827] mb-4">Register as an Employer.</h1>
          
          <div className="bg-[#FAFAF8] border border-[#111827] rounded-[20px] p-5 flex gap-4 mt-6">
            <Info className="w-5 h-5 text-[#111827] shrink-0 mt-0.5" />
            <p className="font-light text-[12px] text-[#111827] leading-relaxed">Your account will be reviewed by our team before you can post jobs. This ensures the quality and safety of opportunities for our users.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto w-full" noValidate>
          {error && (
            <div className="p-4 bg-red-50 text-red-800 border border-red-200 text-[13px] font-medium" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Account Details */}
            <div className="space-y-5">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#111827] border-b border-[#E5E7EB] pb-2">Account Details</h3>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Work Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Password</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} required className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-5 pt-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#111827] border-b border-[#E5E7EB] pb-2">Company Details</h3>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Company Name</label>
                <input name="companyName" value={formData.companyName} onChange={handleChange} required className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Website</label>
                <input name="companyWebsite" type="url" value={formData.companyWebsite} onChange={handleChange} required placeholder="https://" className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm appearance-none"
                  >
                    <option value="">Select...</option>
                    <option value="IT">Technology</option>
                    <option value="FINANCE">Finance</option>
                    <option value="HEALTHCARE">Healthcare</option>
                    <option value="RETAIL">Retail</option>
                    <option value="EDUCATION">Education</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Location</label>
                  <input name="location" value={formData.location} onChange={handleChange} required placeholder="City, State" className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-full shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#111827] mb-2 ml-4">Company Description</label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us about your company and your commitment to an inclusive workplace..."
                  className="w-full bg-white border border-[#E5E7EB] px-6 py-4 text-[14px] focus:outline-none focus:border-[#111827] rounded-[24px] shadow-sm resize-y"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between gap-4 pt-8 mt-8 border-t border-[#E5E7EB] items-center">
            <Link to="/signup" className="text-[11px] uppercase tracking-widest text-[#475569] hover:text-[#111827] font-bold border-b border-transparent hover:border-[#111827] transition-all pb-0.5">
              ← Change Role
            </Link>
            
            <button type="submit" disabled={loading} className="w-full sm:w-auto px-12 bg-[#111827] text-white py-4 text-[11px] uppercase tracking-widest font-bold hover:bg-[#475569] transition-colors rounded-full shadow-md">
              {loading ? "Registering..." : "Register"}
            </button>
          </div>

          <p className="text-center text-[12px] text-[#475569] font-light pt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#111827] font-semibold border-b border-[#111827] hover:opacity-50 pb-0.5">Log in</Link>
          </p>
        </form>
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
