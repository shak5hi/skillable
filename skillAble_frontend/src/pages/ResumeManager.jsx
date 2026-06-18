import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, CheckCircle, AlertTriangle, AlertCircle, TrendingUp, HelpCircle, Download, FileUp } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { SkeletonCard } from '../components/common/SkeletonCard'
import api from '../api/axios'

export default function ResumeManager() {
  const [resumes, setResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/resumes/')
        const formattedResumes = (data.results || data || []).map(resume => ({
          id: resume.id,
          name: resume.file.split('/').pop() || 'resume',
          size: '—',
          date: new Date(resume.uploaded_at).toLocaleDateString('en-IN'),
          isPrimary: resume.is_primary,
          analysis: resume.analysis,
          fileId: resume.id
        }))
        setResumes(formattedResumes)
      } catch (err) {
        console.error('Failed to fetch resumes:', err)
        setError('Failed to load resumes')
        setResumes([])
      } finally {
        setLoading(false)
      }
    }

    fetchResumes()
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or DOCX file.")
      return
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB")
      return
    }
    
    setIsUploading(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const { data } = await api.post('/api/resumes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const newResume = {
        id: data.id,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        date: 'Just now',
        isPrimary: data.is_primary,
        analysis: data.analysis,
        fileId: data.id
      }
      
      setResumes(prev => [newResume, ...prev])
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err.response?.data?.detail || 'Failed to upload resume')
    } finally {
      setIsUploading(false)
    }
  }

  const setPrimary = async (id) => {
    try {
      await api.patch(`/api/resumes/${id}/set_primary/`)
      setResumes(resumes.map(r => ({ ...r, isPrimary: r.id === id })))
    } catch (err) {
      console.error('Failed to set primary:', err)
      setError('Failed to set resume as primary')
    }
  }

  const downloadResume = (resumeId) => {
    window.open(`/api/resumes/${resumeId}/download/`, '_blank')
  }

  // Helper to render the circular score gauge
  const renderScoreGauge = (score) => {
    let colorClass, strokeColor
    if (score >= 70) {
      colorClass = 'text-green-600'
      strokeColor = 'var(--color-primary)'
    } else if (score >= 40) {
      colorClass = 'text-amber-500'
      strokeColor = 'var(--color-accent)'
    } else {
      colorClass = 'text-red-500'
      strokeColor = '#ef4444'
    }
    
    const circumference = 351.8 // 2 * PI * r (where r = 56)
    const offset = circumference - (circumference * score) / 100

    return (
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--color-border)" strokeWidth="12" />
          <motion.circle 
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="64" cy="64" r="56" 
            fill="transparent" 
            stroke={strokeColor} 
            strokeWidth="12" 
            strokeDasharray={circumference} 
            className="drop-shadow-sm" 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-serif font-bold ${colorClass}`}>{score}</span>
          <span className="text-xs text-gray-500 font-sans">/ 100</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex justify-between items-end border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Resume Manager</h1>
          <p className="text-lg text-gray-600 font-sans mt-2">Upload your resume to get AI-powered improvements.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-800 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column - List and Upload */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Upload Zone */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-3xl p-8 text-center transition-all bg-white
              ${isDragging ? 'border-[var(--color-primary)] bg-teal-50' : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-gray-50'}
            `}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileInput}
              aria-label="Upload resume file"
            />
            
            <div className="w-16 h-16 bg-teal-50 text-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
              {isUploading ? <UploadCloud className="w-8 h-8 animate-bounce" /> : <FileUp className="w-8 h-8" />}
            </div>
            
            <h3 className="text-lg font-serif font-bold text-gray-900">
              {isUploading ? 'Analyzing...' : 'Drop your resume here'}
            </h3>
            <p className="text-sm font-sans text-gray-500 mt-2">PDF or DOCX (Max 5MB)</p>
            
            {!isUploading && (
              <Button 
                variant="outline" 
                className="mt-6 w-full font-bold focus-ring rounded-xl"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
            )}
          </div>

          {/* List of Resumes */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xl text-gray-900">Saved Resumes</h3>
            
            {loading ? (
              <SkeletonCard />
            ) : (
               <div className="space-y-3">
                 {resumes.map(resume => (
                   <div 
                     key={resume.id} 
                     className={`p-4 rounded-2xl border transition-all ${resume.isPrimary ? 'border-[var(--color-primary)] shadow-sm bg-white' : 'border-[var(--color-border)] bg-gray-50/50 hover:bg-white'}`}
                   >
                     <div className="flex items-start gap-4">
                       <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                         <FileText className="w-6 h-6" />
                       </div>
                       <div className="flex-1 truncate">
                         <h4 className="font-sans font-bold text-gray-900 truncate" title={resume.name}>{resume.name}</h4>
                         <p className="text-xs text-gray-500 font-sans mt-0.5">{resume.size} • Uploaded {resume.date}</p>
                         
                         <div className="flex gap-2 mt-3 text-xs">
                           {resume.isPrimary ? (
                             <Badge variant="primary" className="py-0.5">Primary Default</Badge>
                           ) : (
                             <button 
                               onClick={() => setPrimary(resume.id)} 
                               className="text-[var(--color-primary)] font-bold hover:underline focus-ring rounded-sm pr-2"
                             >
                               Set as Primary
                             </button>
                           )}
                           <span className="text-gray-300">|</span>
                           <button className="text-gray-600 font-medium hover:underline focus-ring rounded-sm pr-2">
                             Download
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* Right Column - AI Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
             <div className="space-y-6">
               <SkeletonCard className="h-64" />
             </div>
          ) : (
             <AnimatePresence mode="wait">
               {resumes.find(r => r.isPrimary)?.analysis ? (
                 <motion.div 
                   key="analysis-card"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="bg-white rounded-[2rem] border border-[var(--color-primary)] border-b-4 border-r-4 shadow-xl overflow-hidden"
                 >
                   {/* Top area - Score and Actions */}
                   <div className="p-8 lg:p-10 flex flex-col sm:flex-row gap-8 items-center sm:items-start justify-between border-b border-[var(--color-border)] bg-teal-50/30">
                     <div className="flex-1">
                       <h2 className="text-3xl font-serif font-bold text-gray-900 flex gap-2 items-center">
                         AI Resume Analysis
                       </h2>
                       <p className="mt-2 text-gray-600 font-sans text-lg">
                         We've analyzed <span className="font-bold">{resumes.find(r => r.isPrimary)?.name}</span> against industry standards. 
                         Here's how you can stand out.
                       </p>
                       <div className="flex gap-3 mt-6">
                         <Button variant="primary" disabled>View Improved Version</Button>
                         <Button variant="outline" onClick={async () => {
                           try {
                             const primaryResume = resumes.find(r => r.isPrimary)
                             if (primaryResume) {
                               await api.post(`/api/resumes/${primaryResume.id}/reanalyze/`)
                               // Optionally refetch to show updated analysis
                             }
                           } catch (err) {
                             setError('Failed to re-analyze resume')
                           }
                         }}>Re-analyze</Button>
                       </div>
                     </div>
                     {renderScoreGauge(resumes.find(r => r.isPrimary)?.analysis?.score)}
                   </div>
                   
                   <div className="p-8 lg:p-10 space-y-10">
                     
                     {/* Missing Skills */}
                     {resumes.find(r => r.isPrimary)?.analysis?.missing_skills?.length > 0 && (
                       <div>
                         <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 flex gap-2 items-center">
                           <AlertCircle className="w-5 h-5 text-red-500" /> Missing High-Demand Skills
                         </h3>
                         <div className="flex flex-wrap gap-2">
                           {resumes.find(r => r.isPrimary)?.analysis?.missing_skills.map(skill => (
                             <span key={skill} className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full font-sans text-sm font-medium">
                               {skill}
                             </span>
                           ))}
                         </div>
                       </div>
                     )}

                     <div className="grid md:grid-cols-2 gap-8">
                       
                       {/* Suggestions */}
                       <div>
                         <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 flex gap-2 items-center">
                           <CheckCircle className="w-5 h-5 text-[var(--color-primary)]" /> Actionable Suggestions
                         </h3>
                         <div className="space-y-6">
                           {Object.entries(resumes.find(r => r.isPrimary)?.analysis?.suggestions || {}).map(([category, items]) => (
                             <div key={category}>
                               <h4 className="font-sans font-bold text-gray-700 uppercase tracking-wider text-xs mb-2">
                                 {category}
                               </h4>
                               <ul className="space-y-3">
                                 {items.map((item, idx) => (
                                   <li key={idx} className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                     <HelpCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                     <span className="text-sm font-sans text-gray-700">{item}</span>
                                   </li>
                                 ))}
                               </ul>
                             </div>
                           ))}
                         </div>
                       </div>

                       {/* Compatibility Chart */}
                       <div>
                         <h3 className="text-xl font-serif font-bold text-gray-900 mb-4 flex gap-2 items-center">
                           <TrendingUp className="w-5 h-5 text-blue-500" /> Role Compatibility
                         </h3>
                         <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
                           {(resumes.find(r => r.isPrimary)?.analysis?.role_compatibility || []).map((role) => (
                             <div key={role.role}>
                               <div className="flex justify-between items-end mb-1">
                                 <span className="font-sans font-bold text-gray-800 text-sm">{role.role}</span>
                                 <span className="font-sans font-medium text-gray-500 text-xs">{role.match}%</span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-2">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   whileInView={{ width: `${role.match}%` }}
                                   transition={{ duration: 1, delay: 0.2 }}
                                   className={`h-2 rounded-full ${role.match >= 80 ? 'bg-[var(--color-primary)]' : role.match >= 50 ? 'bg-[var(--color-accent)]' : 'bg-red-500'}`}
                                 />
                               </div>
                             </div>
                           ))}
                         </div>
                         <p className="text-xs text-gray-500 font-sans mt-4">Based on semantic keyword matching with over 10,000 active job postings.</p>
                       </div>
                     </div>
                     
                   </div>
                 </motion.div>
               ) : (
                 <div className="bg-white rounded-[2rem] border border-[var(--color-border)] shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                   <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                     <FileText className="w-12 h-12 text-gray-300" />
                   </div>
                   <h2 className="text-2xl font-serif font-bold text-gray-900">No Analysis Available</h2>
                   <p className="text-gray-500 font-sans mt-2 max-w-sm mx-auto">Upload a resume and set it as primary to see your AI-powered analysis resume score.</p>
                 </div>
               )}
             </AnimatePresence>
          )}
        </div>
        
      </div>
    </div>
  )
}
