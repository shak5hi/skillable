import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, Briefcase, Filter, X, Building, CheckCircle, AlertTriangle, Volume2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Input } from '../components/common/Input'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import { SkeletonCard } from '../components/common/SkeletonCard'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

export default function BrowseJobs() {
  const { user } = useAuthStore()
  const isBlind = user?.disabilityType === 'BLIND'

  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading]   = useState(true)
  const [jobs, setJobs]         = useState([])
  const [error, setError]       = useState(null)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [voiceAnnouncement, setVoiceAnnouncement] = useState('')

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type:   [],
    experience: '',
    location: '',
    industry: '',
    accessibilityFriendly: false,
    skills: []
  })
  const [newSkill, setNewSkill] = useState('')
  const [matchStatus, setMatchStatus] = useState({})
  const announcementRef = useRef(null)

  // ── Speak helper ──
  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }, [])

  // ── Fetch jobs ──
  const fetchJobs = useCallback(async (overrideFilters = null) => {
    setLoading(true)
    setError(null)
    const f = overrideFilters || filters
    try {
      const params = new URLSearchParams()
      if (f.search) params.append('search', f.search)
      if (f.type?.length) {
        const typeMap = { 'Full Time': 'FULL_TIME', 'Part Time': 'PART_TIME', 'Contract': 'CONTRACT', 'Remote': 'REMOTE' }
        f.type.forEach(t => params.append('job_type', typeMap[t] || t))
      }
      if (f.experience) {
        const expMap = { 'Entry Level': 'ENTRY', 'Mid Level': 'MID', 'Senior Level': 'SENIOR', 'Director': 'LEAD' }
        params.append('experience_level', expMap[f.experience] || f.experience)
      }
      if (f.location) params.append('location', f.location)
      if (f.industry) params.append('industry', f.industry)
      if (f.accessibilityFriendly) params.append('is_accessibility_friendly', 'true')
      if (f.skills?.length) params.append('skills', f.skills.join(','))

      const { data } = await api.get(`/api/jobs/?${params.toString()}`)
      const list = data.results ? data.results : Array.isArray(data) ? data : []
      setJobs(list)

      if (isBlind) {
        const msg = list.length
          ? `Found ${list.length} job${list.length !== 1 ? 's' : ''}. ${list.slice(0, 3).map(j => j.title + ' at ' + (j.company_name || j.employer?.company_name || 'company')).join('. ')}.`
          : 'No jobs found for your search.'
        speak(msg)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      setError('Failed to load jobs. Please try again.')
      if (isBlind) speak('Failed to load jobs. Please check your connection.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [filters, isBlind, speak])

  useEffect(() => { fetchJobs() }, []) // eslint-disable-line

  // ── React to URL search param (voice navigation uses this) ──
  useEffect(() => {
    const searchQuery = searchParams.get('search')
    if (searchQuery) {
      const newFilters = { ...filters, search: searchQuery }
      setFilters(newFilters)
      fetchJobs(newFilters)
    }
  }, [searchParams]) // eslint-disable-line

  // ─────────────────────────────────────────────────────────────────────────
  // VOICE EVENTS — emitted by VoiceNavigationButton
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleVoiceFilter = (e) => {
      const voiceFilters = e.detail || {}
      // Map backend filter names to component state
      const newFilters = { ...filters }

      if (voiceFilters.job_type) {
        const reverseMap = {
          REMOTE: 'Remote', FULL_TIME: 'Full Time',
          PART_TIME: 'Part Time', CONTRACT: 'Contract'
        }
        newFilters.type = [reverseMap[voiceFilters.job_type] || voiceFilters.job_type]
      }
      if (voiceFilters.is_accessibility_friendly) {
        newFilters.accessibilityFriendly = true
      }
      if (voiceFilters.location) newFilters.location = voiceFilters.location
      if (voiceFilters.experience_level) newFilters.experience = voiceFilters.experience_level

      setFilters(newFilters)
      fetchJobs(newFilters)

      const ann = `Filter applied: ${Object.entries(voiceFilters).map(([k,v]) => `${k}: ${v}`).join(', ')}`
      setVoiceAnnouncement(ann)
      if (isBlind) speak(ann)
      setTimeout(() => setVoiceAnnouncement(''), 5000)
    }

    const handleVoiceSearch = (e) => {
      const { query } = e.detail || {}
      if (!query) return
      const newFilters = { ...filters, search: query }
      setFilters(newFilters)
      fetchJobs(newFilters)
      if (isBlind) speak(`Searching for ${query}`)
    }

    const handleVoiceApply = (e) => {
      const { job_title } = e.detail || {}
      if (!job_title) return
      // Find the first matching job and click its apply button
      const matchedJob = jobs.find(j =>
        j.title?.toLowerCase().includes(job_title.toLowerCase())
      )
      if (matchedJob) {
        speak(`Found ${matchedJob.title}. Navigating to job details to apply.`)
        // Let React Router navigate to detail — user can apply from there
        window.location.href = `/jobs/${matchedJob.id}`
      } else {
        const newFilters = { ...filters, search: job_title }
        setFilters(newFilters)
        fetchJobs(newFilters)
        speak(`Searching for ${job_title} jobs. Say apply for the first result once loaded.`)
      }
    }

    window.addEventListener('voice:filter_jobs', handleVoiceFilter)
    window.addEventListener('voice:search_jobs', handleVoiceSearch)
    window.addEventListener('voice:apply_job',   handleVoiceApply)
    return () => {
      window.removeEventListener('voice:filter_jobs', handleVoiceFilter)
      window.removeEventListener('voice:search_jobs', handleVoiceSearch)
      window.removeEventListener('voice:apply_job',   handleVoiceApply)
    }
  }, [filters, jobs, isBlind, speak, fetchJobs])

  // ── Filter change handler ──
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox' && name === 'type') {
      setFilters(prev => ({
        ...prev,
        type: checked ? [...prev.type, value] : prev.type.filter(t => t !== value)
      }))
    } else {
      setFilters(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const addSkill = (e) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault()
      if (!filters.skills.includes(newSkill.trim())) {
        setFilters(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }))
      }
      setNewSkill('')
    }
  }

  const removeSkill = (skill) => {
    setFilters(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const clearFilters = () => {
    setFilters({ search: '', type: [], experience: '', location: '', industry: '', accessibilityFriendly: false, skills: [] })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchJobs()
  }

  const JOB_TYPES    = ['Full Time', 'Part Time', 'Contract', 'Remote']
  const EXP_LEVELS   = ['Entry Level', 'Mid Level', 'Senior Level', 'Director']
  const INDUSTRIES   = ['Technology', 'Healthcare', 'Education', 'Finance', 'Manufacturing', 'Retail', 'Other']

  const FilterSidebar = () => (
    <form onSubmit={handleSearch} className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-sans font-semibold text-[var(--color-text-primary)] mb-2">
          Search Jobs
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Job title or keyword"
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
            aria-label="Search jobs by title or keyword"
          />
        </div>
      </div>

      {/* Job Type */}
      <div>
        <p className="text-sm font-sans font-semibold text-[var(--color-text-primary)] mb-3">Job Type</p>
        <div className="space-y-2">
          {JOB_TYPES.map(t => (
            <label key={t} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="type"
                value={t}
                checked={filters.type.includes(t)}
                onChange={handleFilterChange}
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                aria-label={`Filter by ${t}`}
              />
              <span className="text-sm font-sans text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]">{t}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-sans font-semibold text-[var(--color-text-primary)] mb-2">
          Experience Level
        </label>
        <select
          name="experience"
          value={filters.experience}
          onChange={handleFilterChange}
          className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
          aria-label="Filter by experience level"
        >
          <option value="">All Levels</option>
          {EXP_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-sans font-semibold text-[var(--color-text-primary)] mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="City or Remote"
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
            aria-label="Filter by location"
          />
        </div>
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm font-sans font-semibold text-[var(--color-text-primary)] mb-2">
          Industry
        </label>
        <select
          name="industry"
          value={filters.industry}
          onChange={handleFilterChange}
          className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
          aria-label="Filter by industry"
        >
          <option value="">All Industries</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Accessibility Friendly */}
      <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl border border-[var(--color-border)] hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          name="accessibilityFriendly"
          checked={filters.accessibilityFriendly}
          onChange={handleFilterChange}
          className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] mt-0.5"
          aria-label="Show only accessibility-friendly workplaces"
        />
        <div>
          <span className="text-sm font-sans font-semibold text-[var(--color-text-primary)] block">Accessibility Friendly</span>
          <span className="text-xs font-sans text-gray-500">Inclusive workplaces only</span>
        </div>
      </label>

      {/* Skills */}
      <div>
        <p className="text-sm font-sans font-semibold text-[var(--color-text-primary)] mb-2">Skills</p>
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={addSkill}
          placeholder="Type skill + Enter"
          className="w-full border border-[var(--color-border)] rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-white"
          aria-label="Add skill filter"
        />
        {filters.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.skills.map(s => (
              <span key={s} className="flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-sans">
                {s}
                <button onClick={() => removeSkill(s)} aria-label={`Remove ${s} skill filter`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" aria-label="Apply filters and search jobs">
        <Search className="w-4 h-4 mr-2" /> Search Jobs
      </Button>
      <button
        type="button"
        onClick={clearFilters}
        className="w-full text-sm text-gray-500 hover:text-gray-700 font-sans underline"
        aria-label="Clear all filters"
      >
        Clear All Filters
      </button>
    </form>
  )

  return (
    <div id="main-content" className="flex gap-8 p-6 max-w-7xl mx-auto w-full" aria-label="Browse Jobs page">

      {/* Voice announcement live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only" ref={announcementRef}>
        {voiceAnnouncement}
      </div>

      {/* Voice filter indicator */}
      {voiceAnnouncement && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-teal-900 text-teal-100 text-sm px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 font-sans border border-teal-600">
          <Volume2 className="w-4 h-4 text-teal-400 shrink-0" />
          {voiceAnnouncement}
        </div>
      )}

      {/* ── Sidebar filter (desktop) ── */}
      <aside className="w-72 shrink-0 hidden lg:block" aria-label="Job filters">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Filter className="w-5 h-5 text-[var(--color-primary)]" /> Filters
            </h2>
          </div>
          <FilterSidebar />
        </div>
      </aside>

      {/* ── Main job listing ── */}
      <main className="flex-1 min-w-0" aria-label="Job listings">
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[var(--color-text-primary)]">
              {loading ? 'Finding Jobs…' : `${jobs.length} Job${jobs.length !== 1 ? 's' : ''} Found`}
            </h1>
            {isBlind && (
              <p className="text-sm text-gray-500 font-sans mt-1">
                Say "read aloud" to hear all job listings, or "apply for [title]" to apply.
              </p>
            )}
          </div>
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-[var(--color-border)] rounded-xl text-sm font-sans font-medium hover:bg-gray-50 transition-colors"
            aria-label="Open filters"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {loading ? (
          <div className="space-y-4" aria-label="Loading jobs">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16" role="alert">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-[var(--color-text-secondary)] font-sans">{error}</p>
            <button onClick={() => fetchJobs()} className="mt-4 text-sm text-teal-600 underline font-sans">Try again</button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-bold text-gray-700 mb-2">No jobs match your filters</h3>
            <p className="text-gray-500 font-sans text-sm">Try adjusting your search or say "clear filters" to the voice assistant.</p>
            <button onClick={clearFilters} className="mt-4 text-sm text-teal-600 underline font-sans">Clear Filters</button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, idx) => {
              const companyName = job.company_name || job.employer?.company_name || 'Company'
              const jobType = (job.job_type || '').replace('_', ' ')
              return (
                <motion.article
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl border border-[var(--color-border)] p-6 shadow-sm hover:shadow-md transition-shadow group"
                  aria-label={`Job: ${job.title} at ${companyName}`}
                  data-readable="true"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h2 className="font-serif text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                            {job.title}
                          </h2>
                          <p className="text-[var(--color-text-secondary)] font-sans text-sm mt-0.5">
                            {companyName}
                          </p>
                        </div>
                        {job.salary_min && (
                          <span className="text-sm font-sans font-semibold text-[var(--color-primary)] shrink-0">
                            ₹{(job.salary_min/100000).toFixed(1)}–{(job.salary_max/100000).toFixed(1)}L
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-sans">
                            <MapPin className="w-3 h-3" /> {job.location}
                          </span>
                        )}
                        {jobType && <Badge variant="outline">{jobType}</Badge>}
                        {job.is_accessibility_friendly && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Accessibility Friendly
                          </Badge>
                        )}
                      </div>

                      {job.description && (
                        <p className="text-sm text-gray-600 font-sans mt-3 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
                        <div className="flex flex-wrap gap-2">
                          {(job.skills_required || []).slice(0, 4).map(s => (
                            <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-sans">
                              {s}
                            </span>
                          ))}
                        </div>
                        <Link
                          to={`/jobs/${job.id}`}
                          className="px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-sans font-bold rounded-xl hover:bg-[var(--color-primary-dark)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
                          aria-label={`View details and apply for ${job.title} at ${companyName}`}
                        >
                          View & Apply
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </main>

      {/* Mobile filter drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-label="Job filters">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl font-bold">Filters</h2>
              <button onClick={() => setIsMobileFilterOpen(false)} aria-label="Close filters">
                <X className="w-6 h-6" />
              </button>
            </div>
            <FilterSidebar />
          </div>
        </div>
      )}
    </div>
  )
}
