import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Building, MapPin, Briefcase, IndianRupee, Clock,
  CheckCircle, ThumbsUp, ChevronLeft, Volume2
} from 'lucide-react'
import { Badge }        from '../components/common/Badge'
import { Button }       from '../components/common/Button'
import { SkeletonCard } from '../components/common/SkeletonCard'
import { useAuthStore, isBlindUser, isDeafUser } from '../store/authStore'
import api from '../api/axios'

export default function JobDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const blind = isBlindUser(user)
  const deaf  = isDeafUser(user)

  const [loading,      setLoading]      = useState(true)
  const [job,          setJob]          = useState(null)
  const [matchData,    setMatchData]    = useState(null)
  const [applying,     setApplying]     = useState(false)
  const [applyMessage, setApplyMessage] = useState('')
  const [applySuccess, setApplySuccess] = useState(false)
  const [errorMsg,     setErrorMsg]     = useState('')

  // ── TTS helper ──
  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.9
    window.speechSynthesis.speak(utt)
  }, [])

  // ── Fetch job ──
  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true)
        const { data } = await api.get(`/api/jobs/${id}/`)
        setJob(data)

        if (isAuthenticated && user?.role === 'JOB_SEEKER') {
          try {
            const matchRes = await api.get(`/api/jobs/${id}/match/`)
            setMatchData(matchRes.data)
          } catch (_) {}
        }

        // Read page aloud for blind users once job loads
        if (blind) {
          const accessible = data.is_accessibility_friendly ? 'This is an accessibility-friendly workplace.' : ''
          const salary = data.salary_min
            ? `Salary range: ${data.salary_min} to ${data.salary_max}.`
            : ''
          speak(
            `Job details loaded. ${data.title} at ${data.company_name}. ` +
            `Location: ${data.location}. Job type: ${data.job_type}. ` +
            `${salary} ${accessible} ` +
            `${data.description?.slice(0, 300) || ''}. ` +
            `Say hello bandhu apply for ${data.title} to apply, or press the Apply Now button.`
          )
        }
      } catch (err) {
        setErrorMsg('Failed to load job details.')
        if (blind) speak('Failed to load job details. Please go back and try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [id]) // eslint-disable-line

  // ── Voice apply event listener ──
  useEffect(() => {
    const handleVoiceApply = (e) => {
      const title = e.detail?.job_title || ''
      if (!job) return
      // Match if the job title contains the voice command keywords
      if (job.title?.toLowerCase().includes(title.toLowerCase()) || !title) {
        handleApply()
      }
    }
    window.addEventListener('voice:apply_job', handleVoiceApply)
    return () => window.removeEventListener('voice:apply_job', handleVoiceApply)
  }, [job]) // eslint-disable-line

  const handleApply = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (applySuccess) {
      if (blind) speak('You have already applied for this job.')
      return
    }
    setApplying(true)
    setApplyMessage('')
    try {
      await api.post('/api/applications/', {
        job: job.id,
        cover_letter: 'I am interested in this position and my skills align with the requirements.',
      })
      setApplyMessage('Application submitted successfully!')
      setApplySuccess(true)
      if (blind) speak(`Application submitted for ${job.title} at ${job.company_name}. Good luck!`)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to apply. You might have already applied.'
      setApplyMessage(msg)
      if (blind) speak(msg)
    } finally {
      setApplying(false)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6" aria-busy="true" aria-label="Loading job details">
      <SkeletonCard className="h-48" />
      <SkeletonCard className="h-96" />
    </div>
  )

  if (errorMsg || !job) return (
    <div className="p-8 text-center" role="alert">
      <p className="text-red-500 font-bold font-sans">{errorMsg || 'Job not found'}</p>
      <Link to="/jobs" className="mt-4 inline-block text-teal-600 underline font-sans text-sm">
        ← Back to Jobs
      </Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6" id="main-content">

      {/* Screen-reader live region for apply status */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {applyMessage}
      </div>

      <div className="flex items-center justify-between">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline focus-ring rounded-sm"
          aria-label="Back to job listings"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Jobs
        </Link>

        {/* Quick read-aloud button for blind users */}
        {blind && (
          <button
            onClick={() => speak(
              `${job.title} at ${job.company_name}. ${job.description || ''}. ` +
              `Skills required: ${(job.required_skills || []).join(', ')}.`
            )}
            className="flex items-center gap-2 text-sm text-teal-600 font-sans font-medium hover:underline focus-ring rounded"
            aria-label="Read job details aloud"
          >
            <Volume2 className="w-4 h-4" /> Read Aloud
          </button>
        )}
      </div>

      {/* ── Header Card ── */}
      <article
        className="bg-white rounded-[2rem] p-8 border border-[var(--color-border)] shadow-sm relative overflow-hidden"
        aria-label={`Job: ${job.title} at ${job.company_name}`}
      >
        {job.is_accessibility_friendly && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl uppercase tracking-wider shadow-sm z-10">
            Highly Accessible Role
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div
            className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200 shadow-inner"
            aria-hidden="true"
          >
            <Building className="w-12 h-12 text-gray-400" />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-serif font-bold text-gray-900 leading-tight mb-2">
              {job.title}
            </h1>
            <p className="text-xl font-sans text-gray-600 mb-6">{job.company_name}</p>

            <div className="flex flex-wrap gap-4 text-sm font-sans font-medium text-gray-700">
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  {job.location}
                </span>
              )}
              {job.job_type && (
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  {job.job_type.replace('_', ' ')}
                </span>
              )}
              {job.salary_min && (
                <span className="flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  ₹{(job.salary_min / 100000).toFixed(1)}L – ₹{(job.salary_max / 100000).toFixed(1)}L
                </span>
              )}
              {job.created_at && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Apply button */}
          <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Button
              variant="primary"
              size="lg"
              className={`w-full shadow-lg hover:-translate-y-1 transition-transform ${applySuccess ? 'bg-green-600' : ''}`}
              onClick={handleApply}
              isLoading={applying}
              disabled={applySuccess}
              aria-label={applySuccess ? 'Applied successfully' : `Apply for ${job.title}`}
            >
              {applySuccess ? '✓ Applied' : 'Apply Now'}
            </Button>
            {applyMessage && (
              <p className={`text-sm font-bold text-center font-sans ${applySuccess ? 'text-green-600' : 'text-red-500'}`}>
                {applyMessage}
              </p>
            )}
            {deaf && (
              <p className="text-xs text-gray-500 font-sans text-center">
                Sign language supported in interviews
              </p>
            )}
          </div>
        </div>
      </article>

      {/* ── Body ── */}
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">

          <section
            className="bg-white rounded-[2rem] p-8 border border-[var(--color-border)] shadow-sm"
            aria-labelledby="about-role"
          >
            <h2 id="about-role" className="text-2xl font-serif font-bold text-gray-900 border-b border-[var(--color-border)] pb-4 mb-6">
              About the Role
            </h2>
            <p className="text-gray-700 font-sans leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </section>

          {job.requirements && (
            <section
              className="bg-white rounded-[2rem] p-8 border border-[var(--color-border)] shadow-sm"
              aria-labelledby="requirements"
            >
              <h2 id="requirements" className="text-2xl font-serif font-bold text-gray-900 border-b border-[var(--color-border)] pb-4 mb-6">
                Key Responsibilities & Requirements
              </h2>
              <p className="font-sans text-gray-800 leading-relaxed whitespace-pre-wrap">
                {job.requirements}
              </p>
            </section>
          )}

          <section
            className="bg-white rounded-[2rem] p-8 border border-[var(--color-border)] shadow-sm"
            aria-labelledby="skills"
          >
            <h2 id="skills" className="text-2xl font-serif font-bold text-gray-900 border-b border-[var(--color-border)] pb-4 mb-6">
              Required Skills
            </h2>
            <ul className="flex flex-wrap gap-2" aria-label="Required skills list">
              {(job.required_skills || job.skills_required || []).map(s => (
                <li key={s}>
                  <Badge variant="secondary" className="bg-gray-100 border-gray-200 text-gray-800 px-4 py-2">
                    {s}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Sidebar ── */}
        <aside className="space-y-6" aria-label="Job sidebar">

          {/* Match Score */}
          {matchData && (
            <div
              className="bg-[#FAF8F4] rounded-[2rem] p-8 border border-[var(--color-border)] shadow-sm text-center"
              aria-label={`Your match score is ${matchData.match_score} percent`}
            >
              <h3 className="font-serif font-bold text-gray-900 mb-6">SkillAble Match</h3>
              <div className="relative w-32 h-32 mx-auto mb-6" aria-hidden="true">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--color-border)" strokeWidth="12" />
                  <motion.circle
                    initial={{ strokeDashoffset: 351.8 }}
                    animate={{ strokeDashoffset: 351.8 - (351.8 * matchData.match_score) / 100 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    cx="64" cy="64" r="56"
                    fill="transparent"
                    stroke="var(--color-primary)"
                    strokeWidth="12"
                    strokeDasharray={351.8}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-serif font-bold text-[var(--color-primary)]">
                    {matchData.match_score}
                  </span>
                </div>
              </div>
              <p className="text-sm font-sans font-bold text-gray-800 flex items-center justify-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-600" aria-hidden="true" />
                {matchData.message}
              </p>
            </div>
          )}

          {/* Accessibility Features */}
          {job.is_accessibility_friendly && (
            <div
              className="bg-teal-50 rounded-[2rem] p-8 border border-teal-100 shadow-sm"
              aria-labelledby="inclusivity"
            >
              <h3 id="inclusivity" className="font-serif font-bold text-gray-900 mb-6 flex gap-2 items-center text-xl">
                <CheckCircle className="w-6 h-6 text-[var(--color-primary)]" aria-hidden="true" />
                Inclusivity Features
              </h3>
              <ul className="space-y-4" aria-label="Accessibility features list">
                {(job.accessibility_features || []).map((f, i) => (
                  <li key={i} className="flex gap-3 bg-white p-4 rounded-xl shadow-sm border border-teal-50">
                    <span className="text-sm font-sans font-medium text-gray-800 leading-tight">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company card */}
          <div className="bg-white rounded-[2rem] p-8 border border-[var(--color-border)] shadow-sm">
            <h3 className="font-serif font-bold text-gray-900 mb-2">{job.company_name}</h3>
            {job.company_website && (
              <a
                href={job.company_website}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--color-primary)] font-bold mb-6 block border-b pb-4 hover:underline"
                aria-label={`Visit ${job.company_name} website (opens in new tab)`}
              >
                Visit Website ↗
              </a>
            )}
          </div>

        </aside>
      </div>
    </div>
  )
}
