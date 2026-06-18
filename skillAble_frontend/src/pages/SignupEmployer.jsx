import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Info, ArrowLeft } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
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
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)]">
      {/* Top Bar Simple */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-border)] bg-white sticky top-0 z-30">
        <Link to="/" className="text-2xl font-serif text-[var(--color-primary)] font-bold focus-ring rounded-md">SkillAble</Link>
        <Link to="/signup">
          <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
            <ArrowLeft className="w-4 h-4" /> Change Role
          </Button>
        </Link>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 py-12 w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-sm border border-[var(--color-border)] p-8 sm:p-12"
        >
          <div className="mb-8 flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">Register as an Employer</h1>
              <p className="mt-2 text-lg text-gray-600 font-sans">Join hundreds of inclusive companies hiring exceptional talent.</p>
            </div>
          </div>

          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 mb-8">
            <Info className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="font-sans text-sm font-medium">Your account will be reviewed by our team before you can post jobs. This ensures the quality and safety of opportunities for our users.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm font-medium" role="alert">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold border-b border-[var(--color-border)] pb-2 text-gray-800">Account Details</h3>
                <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
                <Input label="Work Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-serif font-bold border-b border-[var(--color-border)] pb-2 text-gray-800">Company Details</h3>
                <Input label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required />
                <Input label="Website" name="companyWebsite" type="url" value={formData.companyWebsite} onChange={handleChange} placeholder="https://" required />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="industry" className="text-base font-sans font-medium text-[var(--color-foreground)]">Industry</label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base font-sans outline-none focus:ring-4 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] hover:border-gray-400 transition-colors"
                    >
                      <option value="">Select industry...</option>
                      <option value="IT">Information Technology</option>
                      <option value="FINANCE">Finance</option>
                      <option value="HEALTHCARE">Healthcare</option>
                      <option value="RETAIL">Retail</option>
                      <option value="EDUCATION">Education</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <Input label="Location" name="location" value={formData.location} onChange={handleChange} required placeholder="City, State" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-4">
              <label htmlFor="companyDescription" className="text-base font-sans font-medium text-[var(--color-foreground)]">Company Description</label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                value={formData.companyDescription}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base font-sans outline-none focus:ring-4 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] hover:border-gray-400 transition-colors resize-y"
                placeholder="Tell us about your company and your commitment to an inclusive workplace..."
              />
            </div>

            <div className="pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-500 order-last sm:order-first">
                Already have an account? <Link to="/login" className="text-[var(--color-primary)] font-bold hover:underline focus-ring rounded-sm">Log in</Link>
              </p>
              <Button type="submit" size="lg" isLoading={loading} className="w-full sm:w-auto px-12">
                Register as Employer
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
