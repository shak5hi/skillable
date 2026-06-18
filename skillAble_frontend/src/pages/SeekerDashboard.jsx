import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Briefcase, Video, TrendingUp, Volume2 } from 'lucide-react'
import { useAuthStore, isBlindUser, isDeafUser } from '../store/authStore'
import { Badge }  from '../components/common/Badge'
import { Button } from '../components/common/Button'
import api from '../api/axios'

export default function SeekerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const blind = isBlindUser(user)
  const deaf  = isDeafUser(user)

  const [statsData, setStatsData] = useState({ sent: 0, review: 0, interviews: 0, matched: 0 })
  const [recentApps, setRecentApps]       = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [resumeData, setResumeData]       = useState(null)
  const [isLoading, setIsLoading]         = useState(true)

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.9
    window.speechSynthesis.speak(utt)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsRes, resumesRes, jobsRes] = await Promise.all([
          api.get('/api/applications/'),
          api.get('/api/resumes/'),
          api.get('/api/jobs/'),
        ])

        const apps  = appsRes.data?.results  || []
        const jobs  = jobsRes.data?.results  || []
        const resumes = resumesRes.data?.results || []

        const sent       = apps.length
        const review     = apps.filter(a => ['UNDER_REVIEW', 'REVIEWING'].includes(a.status)).length
        const interviews = apps.filter(a => a.status === 'INTERVIEW_SCHEDULED').length

        setStatsData({ sent, review, interviews, matched: jobs.length })
        setResumeData(resumes.length > 0 ? resumes[0] : null)

        setRecentApps(apps.slice(0, 3).map(app => ({
          id: app.id,
          company: app.company_name,
          role: app.job_title,
          status: (app.status || '').replace(/_/g, ' '),
          badge: app.status === 'INTERVIEW_SCHEDULED' ? 'primary'
               : app.status === 'UNDER_REVIEW' ? 'warning' : 'secondary',
          rawStatus: app.status,
          interviewRoomId: app.interview_room_id || null,
          date: new Date(app.applied_at).toLocaleDateString(),
        })))

        setRecommendedJobs(jobs.slice(0, 3).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company_name || job.employer?.company_name || 'Company',
          match: job.match_score || 85,
        })))

        // Read dashboard summary aloud for blind users
        if (blind) {
          const firstName = user?.full_name?.split(' ')[0] || 'there'
          speak(
            `Dashboard loaded. Welcome back, ${firstName}. ` +
            `You have ${sent} application${sent !== 1 ? 's' : ''} sent. ` +
            `${review} under review. ` +
            `${interviews} interview${interviews !== 1 ? 's' : ''} scheduled. ` +
            (interviews > 0 ? 'Say hello bandhu join interview to enter your interview room.' : '') +
            ' Say hello bandhu browse jobs to find new opportunities.'
          )
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        if (blind) speak('Failed to load dashboard data. Please check your connection and try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, []) // eslint-disable-line

  // ── Voice event: "join interview" → navigate to most recent interview room ──
  useEffect(() => {
    const handleVoiceNav = (e) => {
      const route = e.detail?.route || ''
      if (route.includes('interview')) {
        const interviewApp = recentApps.find(a => a.rawStatus === 'INTERVIEW_SCHEDULED' && a.interviewRoomId)
        if (interviewApp) {
          speak(`Joining interview room for ${interviewApp.role}.`)
          navigate(`/interview/${interviewApp.interviewRoomId}`)
        } else {
          speak('No scheduled interviews found.')
        }
      }
    }
    window.addEventListener('voice:navigate_interview', handleVoiceNav)
    return () => window.removeEventListener('voice:navigate_interview', handleVoiceNav)
  }, [recentApps, navigate, speak])

  const firstName = user?.full_name?.split(' ')[0] || 'there'

  const resumeScore = resumeData?.analysis?.score || 0
  const circumference = 2 * Math.PI * 56
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (circumference * resumeScore) / 100

  const stats = [
    { label: 'Applications Sent',    value: statsData.sent,       icon: Briefcase, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Under Review',         value: statsData.review,     icon: FileText,  color: 'text-amber-600',  bg: 'bg-amber-50' },
    { label: 'Interviews Scheduled', value: statsData.interviews, icon: Video,     color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Jobs Matched',         value: statsData.matched,    icon: TrendingUp,color: 'text-green-600',  bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-10" id="main-content">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-gray-600 font-sans mt-2">
            Here's your activity summary.
            {blind && ' Say "read aloud" to hear full details.'}
          </p>

          {/* Accessibility status bar */}
          {(blind || deaf) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {blind && (
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-sans flex items-center gap-1.5">
                  <Volume2 className="w-3 h-3" /> Voice Navigation Active — say "Hello Bandhu"
                </span>
              )}
              {deaf && (
                <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-sans">
                  🤟 Sign language support active in interviews
                </span>
              )}
            </div>
          )}
        </div>

        {blind && (
          <button
            onClick={() => speak(
              `Dashboard summary. Applications sent: ${statsData.sent}. ` +
              `Under review: ${statsData.review}. ` +
              `Interviews scheduled: ${statsData.interviews}. ` +
              `Jobs matched: ${statsData.matched}.`
            )}
            className="flex items-center gap-2 text-sm text-teal-600 font-sans font-medium border border-teal-200 bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100 transition-colors focus-ring"
            aria-label="Read dashboard summary aloud"
          >
            <Volume2 className="w-4 h-4" /> Read Summary
          </button>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Application statistics">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            role="listitem"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-6 border border-[var(--color-border)] shadow-sm flex items-center gap-5"
            aria-label={`${stat.label}: ${isLoading ? 'loading' : stat.value}`}
          >
            <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`} aria-hidden="true">
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-gray-900">
                {isLoading ? '–' : stat.value}
              </p>
              <p className="text-sm font-sans font-medium text-gray-500 mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Recent applications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Recent Applications</h2>
            <Link to="/applications">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden min-h-[150px]">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500 font-sans" aria-busy="true">Loading applications…</div>
            ) : recentApps.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-sans">
                You haven't applied to any jobs yet.{' '}
                <Link to="/jobs" className="text-teal-600 underline">Browse jobs</Link>
              </div>
            ) : (
              recentApps.map((app, index) => (
                <div
                  key={app.id}
                  className={`p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition-colors ${
                    index !== recentApps.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                  }`}
                  aria-label={`${app.role} at ${app.company} — ${app.status}`}
                >
                  <div>
                    <h3 className="text-lg font-serif font-bold text-gray-900">{app.role || 'Unknown Job'}</h3>
                    <div className="flex gap-2 items-center text-sm font-sans text-gray-600 mt-1 flex-wrap">
                      <span className="font-medium">{app.company || 'Unknown Company'}</span>
                      <span>•</span>
                      <span>Applied {app.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0 justify-between">
                    <Badge variant={app.badge} className="capitalize">{app.status}</Badge>
                    {app.rawStatus === 'INTERVIEW_SCHEDULED' && app.interviewRoomId && (
                      <Link to={`/interview/${app.interviewRoomId}`}>
                        <Button size="sm" variant="accent" className="font-bold">
                          {deaf ? '🤟 Join Room' : 'Join Room'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">

          {/* Resume score */}
          <div className="bg-white p-8 rounded-[2rem] border border-[var(--color-border)] shadow-sm flex flex-col items-center text-center"
            aria-label={`Resume strength score: ${resumeData ? resumeScore + ' out of 100' : 'not uploaded'}`}
          >
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 w-full text-left">Resume Strength</h2>
            <div className="relative w-32 h-32 flex items-center justify-center" aria-hidden="true">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="transparent" stroke="var(--color-border)" strokeWidth="12" />
                <circle
                  cx="64" cy="64" r="56"
                  fill="transparent"
                  stroke={resumeData ? 'var(--color-primary)' : 'var(--color-border)'}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-serif font-bold text-[var(--color-primary)]">
                  {resumeData ? resumeScore : 'N/A'}
                </span>
                {resumeData && <span className="text-xs text-gray-500 font-sans">/ 100</span>}
              </div>
            </div>
            <p className="mt-6 mb-4 text-sm font-sans text-gray-600">
              {resumeData
                ? 'Your resume is strong. Adding more relevant skills could improve your match rate.'
                : "You haven't uploaded a resume yet."}
            </p>
            <Link to="/resumes" className="w-full">
              <Button variant="outline" className="w-full">
                {resumeData ? 'Improve Resume' : 'Upload Resume'}
              </Button>
            </Link>
          </div>

          {/* Recommended jobs */}
          <div className="bg-white rounded-[2rem] border border-[var(--color-border)] shadow-sm p-6">
            <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Recommended Jobs</h2>
            <div className="space-y-4 min-h-[100px]">
              {isLoading ? (
                <p className="text-center text-gray-500 py-4 font-sans" aria-busy="true">Loading…</p>
              ) : recommendedJobs.length === 0 ? (
                <p className="text-center text-gray-500 py-4 font-sans">No jobs matched yet.</p>
              ) : (
                recommendedJobs.map(job => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors group"
                    aria-label={`${job.title} at ${job.company}, ${job.match}% match`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors text-sm">
                        {job.title}
                      </h3>
                      <Badge variant="success" className="bg-green-100 text-green-800 text-[10px] px-2 shrink-0">
                        {job.match}% Match
                      </Badge>
                    </div>
                    <p className="text-sm font-sans text-gray-500 mb-3">{job.company}</p>
                    <Link to={`/jobs/${job.id}`}>
                      <Button size="sm" variant="ghost" className="w-full justify-center bg-gray-50 border border-gray-100 hover:bg-[var(--color-surface-hover)]">
                        View Job
                      </Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
