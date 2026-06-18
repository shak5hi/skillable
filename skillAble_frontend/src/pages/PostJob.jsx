import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Search, Settings, Building, MapPin, Briefcase, Eye, Ear, Monitor, HelpCircle, X, CheckCircle } from 'lucide-react'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import api from '../api/axios'


export default function PostJob() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    industry: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: '',
    salaryMax: '',
    required_skills: [],
    is_accessibility_friendly: true,
    accessibility_features: [],
    deadline: ''
  })
  
  const [newSkill, setNewSkill] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('feat_')) {
      const featKey = name.replace('feat_', '')
      const featMap = {
        'signLanguageInterpreter': 'Sign Language Interpreter',
        'screenReaderCompatible': 'Screen Reader Compatible',
        'flexibleHours': 'Flexible Hours',
        'remoteOption': 'Remote Option',
        'accessibleOffice': 'Wheelchair Accessible Office'
      }
      setFormData(prev => ({
        ...prev,
        accessibility_features: checked 
          ? [...prev.accessibility_features, featMap[featKey]]
          : prev.accessibility_features.filter(f => f !== featMap[featKey])
      }))
    } else if (name === 'jobType') {
      const typeMap = { 'Full Time': 'FULL_TIME', 'Part Time': 'PART_TIME', 'Remote': 'REMOTE', 'Contract': 'CONTRACT' }
      setFormData(prev => ({ ...prev, [name]: typeMap[value] || value }))
    } else if (name === 'experienceLevel') {
      const expMap = { 'Entry Level': 'ENTRY', 'Mid Level': 'MID', 'Senior Level': 'SENIOR', 'Director': 'LEAD' }
      setFormData(prev => ({ ...prev, [name]: expMap[value] || value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const addSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault()
      if (!formData.required_skills.includes(newSkill.trim())) {
        setFormData(prev => ({ ...prev, required_skills: [...prev.required_skills, newSkill.trim()] }))
      }
      setNewSkill('')
    }
  }

  const removeSkill = (skill) => {
    setFormData(prev => ({ ...prev, required_skills: prev.required_skills.filter(s => s !== skill) }))
  }

  const handleNext = () => setStep(s => s + 1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step < 2) return handleNext()
    
    setLoading(true)
    setError('')
    try {
      // Send job posting data to backend
      const payload = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        industry: formData.industry,
        location: formData.location,
        job_type: formData.jobType,
        experience_level: formData.experienceLevel,
        salary_min: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salary_max: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        required_skills: formData.required_skills,
        is_accessibility_friendly: formData.is_accessibility_friendly,
        accessibility_features: formData.accessibility_features,
        deadline: formData.deadline || null
      }
      await api.post('/api/jobs/', payload)
      navigate('/employer-dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post job. Please try again.')
      console.error('Job posting error:', err)
    } finally {
      setLoading(false)
    }
  }

  const jobTypeOptions = ['Full Time', 'Part Time', 'Remote', 'Contract']
  const expOptions = ['Entry Level', 'Mid Level', 'Senior Level', 'Director']
  const accFeatures = [
    { id: 'signLanguageInterpreter', label: 'Sign Language Interpreter Available', icon: Ear },
    { id: 'screenReaderCompatible', label: 'Screen Reader Accessible Tools', icon: Monitor },
    { id: 'flexibleHours', label: 'Flexible Work Hours', icon: Briefcase },
    { id: 'remoteOption', label: '100% Remote Option', icon: MapPin },
    { id: 'accessibleOffice', label: 'Wheelchair Accessible Office', icon: Building },
  ]

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 text-gray-900">
      
      {/* Form Area */}
      <div className="flex-1 space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Post a New Job</h1>
          <p className="text-gray-600 font-sans mt-2">Create an inclusive job listing to reach thousands of talented professionals.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] p-8 border border-[var(--color-border)] shadow-sm space-y-8 relative">
          
          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}
          
          <AnimatePresence mode="wait">
             {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <h2 className="text-xl font-serif font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Briefcase className="w-5 h-5 text-[var(--color-primary)]" /> Basic Details</h2>
                    
                    <Input label="Job Title" name="title" value={formData.title} onChange={handleChange} required placeholder="E.g. Senior Frontend Developer" />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="font-sans font-medium text-gray-900">Industry</label>
                        <select name="industry" value={formData.industry} onChange={handleChange} required className="w-full px-4 py-3 min-h-[44px] rounded-xl border border-[var(--color-border)] focus:ring-[var(--color-primary)]">
                          <option value="">Select industry</option>
                          <option value="IT">Information Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                        </select>
                      </div>
                      <Input label="Location" name="location" value={formData.location} onChange={handleChange} required placeholder="E.g. Bangalore, India / Remote" />
                    </div>

                    <div className="space-y-2">
                      <label className="font-sans font-medium text-gray-900">Job Description</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} required rows={4} className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/30 resize-y" placeholder="Summarize the role, responsibilities, and team..." />
                    </div>

                    <div className="space-y-2">
                      <label className="font-sans font-medium text-gray-900">Requirements</label>
                      <textarea name="requirements" value={formData.requirements} onChange={handleChange} required rows={4} className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/30 resize-y" placeholder="Describe the ideal candidate's qualifications..." />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-xl font-serif font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Settings className="w-5 h-5 text-[var(--color-primary)]" /> Classification & Salary</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="font-sans font-medium text-gray-900">Job Type</label>
                        <select name="jobType" value={({'FULL_TIME': 'Full Time', 'PART_TIME': 'Part Time', 'REMOTE': 'Remote', 'CONTRACT': 'Contract'}[formData.jobType] || 'Full Time')} onChange={(e) => {
                          const typeMap = { 'Full Time': 'FULL_TIME', 'Part Time': 'PART_TIME', 'Remote': 'REMOTE', 'Contract': 'CONTRACT' }
                          setFormData(prev => ({ ...prev, jobType: typeMap[e.target.value] }))
                        }} className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)]">
                          {jobTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="font-sans font-medium text-gray-900">Experience Level</label>
                        <select name="experienceLevel" value={({'ENTRY': 'Entry Level', 'MID': 'Mid Level', 'SENIOR': 'Senior Level', 'LEAD': 'Director'}[formData.experienceLevel] || 'Mid Level')} onChange={(e) => {
                          const expMap = { 'Entry Level': 'ENTRY', 'Mid Level': 'MID', 'Senior Level': 'SENIOR', 'Director': 'LEAD' }
                          setFormData(prev => ({ ...prev, experienceLevel: expMap[e.target.value] }))
                        }} className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)]">
                          {expOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <Input label="Minimum Salary (₹)" name="salaryMin" type="number" value={formData.salaryMin} onChange={handleChange} placeholder="e.g. 500000" />
                      <Input label="Maximum Salary (₹)" name="salaryMax" type="number" value={formData.salaryMax} onChange={handleChange} placeholder="e.g. 1000000" />
                    </div>
                  </div>
                </motion.div>
             )}

             {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    <h2 className="text-xl font-serif font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Search className="w-5 h-5 text-[var(--color-primary)]" /> Skills & Matching</h2>
                    
                    <div className="space-y-2">
                      <label className="font-sans font-medium text-gray-900">Required Skills</label>
                      <Input 
                        placeholder="Type a skill and press Enter (e.g. React, Python)" 
                        value={newSkill} 
                        onChange={e => setNewSkill(e.target.value)} 
                        onKeyDown={addSkill}
                      />
                      <div className="flex flex-wrap gap-2 pt-2">
                        {formData.required_skills.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-sans flex items-center gap-1">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="text-gray-500 hover:text-red-500"><X className="w-3 h-3"/></button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
                      <h2 className="text-xl font-serif font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5 text-[var(--color-primary)]" /> Accessibility Accommodations</h2>
                      <div className="flex items-center gap-2">
                         <span className="font-sans text-sm font-bold text-[var(--color-primary)]">Accessibility Friendly</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="is_accessibility_friendly" checked={formData.is_accessibility_friendly} onChange={(e) => setFormData(prev => ({ ...prev, is_accessibility_friendly: e.target.checked }))} className="sr-only peer"/>
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[var(--color-primary)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                    
                    {formData.is_accessibility_friendly && (
                      <div className="grid sm:grid-cols-2 gap-4 bg-teal-50/50 p-6 rounded-2xl border border-teal-100">
                        {accFeatures.map(feat => (
                          <label key={feat.id} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-[var(--color-primary)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-primary)]">
                            <input 
                              type="checkbox" 
                              name={`feat_${feat.id}`}
                              checked={formData.accessibility_features.includes({
                                'signLanguageInterpreter': 'Sign Language Interpreter',
                                'screenReaderCompatible': 'Screen Reader Compatible',
                                'flexibleHours': 'Flexible Hours',
                                'remoteOption': 'Remote Option',
                                'accessibleOffice': 'Wheelchair Accessible Office'
                              }[feat.id])}
                              onChange={handleChange}
                              className="mt-1 w-4 h-4 text-[var(--color-primary)] rounded border-gray-300 focus:ring-[var(--color-primary)]" 
                            />
                            <div>
                               <p className="font-sans font-medium text-gray-900 flex gap-2 items-center text-sm">
                                 <feat.icon className="w-4 h-4 text-[var(--color-primary)]" /> {feat.label}
                               </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4 pt-4">
                     <Input label="Application Deadline (Optional)" type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
                  </div>
                </motion.div>
             )}
          </AnimatePresence>

          <div className="pt-6 border-t border-[var(--color-border)] flex justify-between">
             {step === 2 ? (
                <Button variant="ghost" type="button" onClick={() => setStep(1)} disabled={loading}>Back</Button>
             ) : (
                <div />
             )}
             <Button variant="primary" type="submit" isLoading={loading} className="px-10">
               {step === 1 ? 'Next Step' : 'Post Job Listing'}
             </Button>
          </div>
        </form>
      </div>

      {/* Live Preview Panel */}
      <div className="hidden lg:block w-96 shrink-0 space-y-6">
         <h2 className="text-xl font-serif font-bold border-b border-[var(--color-border)] pb-2 flex items-center gap-2"><Eye className="w-5 h-5 text-[var(--color-primary)]" /> Live Preview</h2>
         <div className="sticky top-12 bg-white rounded-[2rem] p-6 shadow-sm border border-[var(--color-border)] group">
             {formData.is_accessibility_friendly && (
               <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-[2rem] uppercase tracking-wider">
                 Accessibility Friendly
               </div>
             )}
             
             <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 mb-4">
               <Building className="w-8 h-8 text-gray-400" />
             </div>
             
             <h3 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
               {formData.title || 'Job Title Placeholder'}
             </h3>
             
             <div className="flex flex-wrap gap-4 text-sm font-sans text-gray-600 mt-2 mb-4">
               <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> Your Company</span>
               <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {formData.location || 'Location'}</span>
             </div>
             
             <div className="flex flex-wrap gap-2 mb-6">
               <Badge variant="ghost" className="bg-gray-100 text-gray-800">{{'FULL_TIME': 'Full Time', 'PART_TIME': 'Part Time', 'REMOTE': 'Remote', 'CONTRACT': 'Contract'}[formData.jobType]}</Badge>
               {(formData.salaryMin || formData.salaryMax) && (
                 <Badge variant="ghost" className="bg-green-50 text-green-800 border border-green-200">
                    ₹{formData.salaryMin || '0'} - ₹{formData.salaryMax || '0'}
                 </Badge>
               )}
             </div>
             
             {formData.required_skills.length > 0 && (
               <div className="mb-6">
                 <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Required Skills</p>
                 <div className="flex flex-wrap gap-2">
                   {formData.required_skills.map(s => <Badge key={s} variant="secondary" className="bg-white border border-gray-200">{s}</Badge>)}
                 </div>
               </div>
             )}

             <Button variant="outline" className="w-full text-sm font-bold" disabled>Check Match</Button>
             <Button variant="primary" className="w-full mt-2 text-sm" disabled>Apply Now</Button>
         </div>
         
         {step === 2 && formData.is_accessibility_friendly && formData.accessibility_features.length > 0 && (
           <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100">
               <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest mb-3">Accessibility Breakdown</p>
               <ul className="space-y-3 font-sans text-sm text-[var(--color-primary)]">
                 {formData.accessibility_features.map((f, i) => {
                   const feat = accFeatures.find(feat => {
                     const featMap = {
                       'signLanguageInterpreter': 'Sign Language Interpreter',
                       'screenReaderCompatible': 'Screen Reader Compatible',
                       'flexibleHours': 'Flexible Hours',
                       'remoteOption': 'Remote Option',
                       'accessibleOffice': 'Wheelchair Accessible Office'
                     }
                     return featMap[feat.id] === f
                   })
                   return feat ? (
                     <li key={i} className="flex gap-2 items-center"><feat.icon className="w-4 h-4 shrink-0" /> {f}</li>
                   ) : null
                 })}
               </ul>
             </div>
         )}
      </div>

    </div>
  )
}
