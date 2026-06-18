import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Briefcase, Video, TrendingUp, Volume2, ArrowRight } from 'lucide-react'
import { useAuthStore, isBlindUser, isDeafUser } from '../store/authStore'
import { SectionDivider } from '../components/common/SectionDivider'
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
    { label: 'Applications Sent',    value: statsData.sent,       icon: Briefcase },
    { label: 'Under Review',         value: statsData.review,     icon: FileText },
    { label: 'Interviews Scheduled', value: statsData.interviews, icon: Video },
    { label: 'Jobs Matched',         value: statsData.matched,    icon: TrendingUp },
  ]

  return (
    <div className="space-y-12 pb-24" id="main-content">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap mt-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-[1px] bg-[#111827]"></div>
            <span className="text-[#111827] font-bold text-[10px] uppercase tracking-widest">Dashboard</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#111827] mb-2 tracking-tight">
            Welcome back, {firstName}.
          </h1>
          <p className="text-[#475569] font-light text-[14px]">
            Here's your activity summary.
            {blind && ' Say "read aloud" to hear full details.'}
          </p>

          {/* Accessibility status bar */}
          {(blind || deaf) && (
            <div className="flex flex-wrap gap-3 mt-6">
              {blind && (
                <span className="text-[10px] font-bold uppercase tracking-widest border border-[#111827] text-[#111827] bg-[#FAFAF8] px-4 py-2 flex items-center gap-2 rounded-full">
                  <Volume2 className="w-3.5 h-3.5" /> Voice Navigation Active
                </span>
              )}
              {deaf && (
                <span className="text-[10px] font-bold uppercase tracking-widest border border-[#111827] text-[#111827] bg-[#FAFAF8] px-4 py-2 flex items-center gap-2 rounded-full">
                  🤟 Sign language support active
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
            className="flex items-center gap-2 border border-[#111827] bg-[#111827] text-white px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#475569] transition-colors focus-ring"
            aria-label="Read dashboard summary aloud"
          >
            <Volume2 className="w-4 h-4" /> Read Summary
          </button>
        )}
      </div>

      <SectionDivider number="01" title="Overview" />

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="list" aria-label="Application statistics">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            role="listitem"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-[24px] p-6 border border-[#E5E7EB] shadow-sm flex flex-col items-start gap-4 hover:border-[#111827] transition-all group"
            aria-label={`${stat.label}: ${isLoading ? 'loading' : stat.value}`}
          >
            <div className="p-3 border border-[#E5E7EB] bg-[#FAFAF8] rounded-full group-hover:bg-[#111827] group-hover:border-[#111827] transition-colors" aria-hidden="true">
              <stat.icon className="w-5 h-5 text-[#111827] group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-[#111827]">
                {isLoading ? '–' : stat.value}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#475569] mt-2">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 pt-8">

        {/* Recent applications */}
        <div className="lg:col-span-2 space-y-6">
          <SectionDivider number="02" title="Recent Activity" align="left" />

          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden min-h-[150px]">
            {isLoading ? (
              <div className="p-8 text-center text-[#475569] font-light text-[13px]" aria-busy="true">Loading applications…</div>
            ) : recentApps.length === 0 ? (
              <div className="p-12 text-center text-[#475569] font-light text-[14px]">
                You haven't applied to any jobs yet.{' '}
                <Link to="/jobs" className="text-[#111827] font-semibold border-b border-[#111827] pb-0.5 hover:opacity-50 transition-opacity">Browse jobs</Link>
              </div>
            ) : (
              recentApps.map((app, index) => (
                <div
                  key={app.id}
                  className={`p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-[#FAFAF8] transition-colors ${
                    index !== recentApps.length - 1 ? 'border-b border-[#E5E7EB]' : ''
                  }`}
                  aria-label={`${app.role} at ${app.company} — ${app.status}`}
                >
                  <div>
                    <h3 className="text-[16px] font-serif font-bold text-[#111827] mb-1">{app.role || 'Unknown Job'}</h3>
                    <div className="flex gap-2 items-center text-[11px] uppercase tracking-widest font-bold text-[#475569] flex-wrap">
                      <span>{app.company || 'Unknown Company'}</span>
                      <span className="text-[#E5E7EB]">•</span>
                      <span>Applied {app.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest border border-[#E5E7EB] bg-white text-[#111827] px-3 py-1.5 rounded-full">
                      {app.status}
                    </span>
                    {app.rawStatus === 'INTERVIEW_SCHEDULED' && app.interviewRoomId && (
                      <Link to={`/interview/${app.interviewRoomId}`}>
                        <button className="flex items-center gap-2 border border-[#111827] bg-[#111827] text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-[#475569] hover:border-[#475569] transition-colors">
                          <Video className="w-3.5 h-3.5" />
                          {deaf ? '🤟 Join Room' : 'Join Room'}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {recentApps.length > 0 && (
              <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAF8] flex justify-center">
                <Link to="/applications" className="text-[11px] font-bold uppercase tracking-widest text-[#111827] flex items-center gap-2 hover:opacity-50 transition-opacity">
                  View All Activity <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <SectionDivider number="03" title="Profile Match" align="left" />

          {/* Resume score */}
          <div className="bg-white p-8 rounded-[24px] border border-[#E5E7EB] shadow-sm flex flex-col items-center text-center group hover:border-[#111827] transition-all"
            aria-label={`Resume strength score: ${resumeData ? resumeScore + ' out of 100' : 'not uploaded'}`}
          >
            <div className="w-full flex justify-between items-center mb-8">
               <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#111827]">Resume Strength</h2>
               <FileText className="w-4 h-4 text-[#475569]" />
            </div>
            
            <div className="relative w-40 h-40 flex items-center justify-center" aria-hidden="true">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="80" cy="80" r="70"
                  fill="transparent"
                  stroke={resumeData ? '#111827' : '#E5E7EB'}
                  strokeWidth="8"
                  strokeDasharray={Math.PI * 2 * 70}
                  strokeDashoffset={(Math.PI * 2 * 70) - ((Math.PI * 2 * 70) * resumeScore) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-serif font-bold text-[#111827]">
                  {resumeData ? resumeScore : '–'}
                </span>
                {resumeData && <span className="text-[10px] font-bold uppercase tracking-widest text-[#475569] mt-1">out of 100</span>}
              </div>
            </div>
            <p className="mt-8 mb-6 text-[12px] font-light text-[#475569] leading-relaxed">
              {resumeData
                ? 'Your profile is strong. Adding more skills could improve your match rate further.'
                : "Upload a resume to unlock personalized job recommendations."}
            </p>
            <Link to="/resumes" className="w-full">
              <button className="w-full border border-[#E5E7EB] bg-[#FAFAF8] text-[#111827] py-3.5 text-[11px] uppercase tracking-widest font-bold hover:border-[#111827] hover:bg-white transition-colors rounded-full shadow-sm">
                {resumeData ? 'Improve Resume' : 'Upload Resume'}
              </button>
            </Link>
          </div>

          {/* Recommended jobs */}
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E5E7EB] bg-[#FAFAF8] flex justify-between items-center">
              <h2 className="text-[13px] font-bold uppercase tracking-widest text-[#111827]">Recommended Roles</h2>
              <TrendingUp className="w-4 h-4 text-[#475569]" />
            </div>
            
            <div className="min-h-[100px]">
              {isLoading ? (
                <p className="text-center text-[#475569] font-light text-[12px] py-8" aria-busy="true">Loading…</p>
              ) : recommendedJobs.length === 0 ? (
                <p className="text-center text-[#475569] font-light text-[12px] py-8">No roles matched yet.</p>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {recommendedJobs.map(job => (
                    <div
                      key={job.id}
                      className="p-6 hover:bg-[#FAFAF8] transition-colors group cursor-pointer"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      aria-label={`${job.title} at ${job.company}, ${job.match}% match`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-serif font-bold text-[#111827] text-[15px] group-hover:text-[#475569] transition-colors">
                          {job.title}
                        </h3>
                        <span className="text-[9px] font-bold uppercase tracking-widest border border-[#111827] text-[#111827] px-2 py-1 rounded-full shrink-0">
                          {job.match}% Match
                        </span>
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#475569]">{job.company}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
