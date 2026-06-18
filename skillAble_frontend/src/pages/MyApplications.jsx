import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Briefcase, Building, MapPin, Calendar, Clock,
  Video, CheckCircle, XCircle, Search, Volume2
} from 'lucide-react'
import { Badge }        from '../components/common/Badge'
import { Button }       from '../components/common/Button'
import { SkeletonCard } from '../components/common/SkeletonCard'
import { useAuthStore, isBlindUser, isDeafUser } from '../store/authStore'
import api from '../api/axios'

const STATUS_MAP = {
  APPLIED:              { display: 'Under Review',        icon: Clock,        color: 'text-blue-600',   bg: 'bg-blue-100' },
  UNDER_REVIEW:         { display: 'Under Review',        icon: Clock,        color: 'text-blue-600',   bg: 'bg-blue-100' },
  REVIEWING:            { display: 'Under Review',        icon: Clock,        color: 'text-blue-600',   bg: 'bg-blue-100' },
  INTERVIEW_SCHEDULED:  { display: 'Interview Scheduled', icon: Video,        color: 'text-purple-600', bg: 'bg-purple-100' },
  INTERVIEW_COMPLETED:  { display: 'Interview Completed', icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-100' },
  OFFER_SENT:           { display: 'Offer Sent',          icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-100' },
  ACCEPTED:             { display: 'Accepted',            icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-100' },
  REJECTED:             { display: 'Rejected',            icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-100' },
}

export default function MyApplications() {
  const { user } = useAuthStore()
  const blind = isBlindUser(user)
  const deaf  = isDeafUser(user)

  const [loading,      setLoading]      = useState(true)
  const [applications, setApplications] = useState([])
  const [error,        setError]        = useState(null)
  const [activeTab,    setActiveTab]    = useState('All')

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }, [])

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get('/api/applications/')
        const list = data.results || data || []

        const formatted = list.map(app => {
          const si = STATUS_MAP[app.status] || { display: app.status, icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' }
          return {
            id:              app.id,
            jobId:           app.job,
            title:           app.job_title      || 'Unknown Position',
            company:         app.company_name   || 'Unknown Company',
            location:        app.location       || 'N/A',
            appliedDate:     new Date(app.applied_at).toLocaleDateString('en-IN'),
            status:          si.display,
            statusIcon:      si.icon,
            statusColor:     si.color,
            statusBg:        si.bg,
            rawStatus:       app.status,
            // Backend should return interview_room_id when status = INTERVIEW_SCHEDULED
            interviewRoomId: app.interview_room_id || app.room_id || null,
          }
        })

        setApplications(formatted)

        // Read summary aloud for blind users
        if (blind) {
          const interviews = formatted.filter(a => a.rawStatus === 'INTERVIEW_SCHEDULED')
          speak(
            `My Applications loaded. You have ${formatted.length} application${formatted.length !== 1 ? 's' : ''}. ` +
            (interviews.length > 0
              ? `${interviews.length} interview${interviews.length !== 1 ? 's' : ''} scheduled. ` +
                `The first is for ${interviews[0].title} at ${interviews[0].company}.`
              : 'No interviews scheduled yet.')
          )
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err)
        setError('Failed to load applications. Please try again.')
        if (blind) speak('Failed to load applications. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, []) // eslint-disable-line

  const TABS = ['All', 'Under Review', 'Interview Scheduled', 'Accepted', 'Rejected']

  const filteredApps = applications.filter(app => {
    if (activeTab === 'All') return true
    return app.status === activeTab
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8" id="main-content">

      {/* SR live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {error}
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--color-border)] pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">My Applications</h1>
          <p className="text-lg text-gray-600 font-sans mt-2">
            Track the status of all your submitted job applications.
            {blind && ' Say "read aloud" to hear the full list.'}
          </p>
        </div>
        {blind && (
          <button
            onClick={() => speak(
              filteredApps.length === 0
                ? 'No applications found.'
                : filteredApps.map(a => `${a.title} at ${a.company} — ${a.status}`).join('. ')
            )}
            className="flex items-center gap-2 text-sm text-teal-600 font-sans font-medium border border-teal-200 bg-teal-50 px-4 py-2 rounded-xl hover:bg-teal-100 transition-colors focus-ring shrink-0"
            aria-label="Read all applications aloud"
          >
            <Volume2 className="w-4 h-4" /> Read Aloud
          </button>
        )}
      </div>

      {/* Tab filter */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filter applications by status">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => {
              setActiveTab(tab)
              if (blind) speak(`Showing ${tab} applications.`)
            }}
            className={`px-5 py-2.5 rounded-full font-sans font-bold whitespace-nowrap transition-colors focus-ring ${
              activeTab === tab
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab} {tab === 'All' && `(${applications.length})`}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-red-800 text-sm font-medium font-sans" role="alert">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading applications">
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-48" />
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-[3rem] border border-[var(--color-border)] shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6" aria-hidden="true">
            <Search className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">No applications found</h2>
          <p className="text-gray-500 font-sans mt-2 max-w-sm mx-auto">
            {activeTab === 'All'
              ? "You haven't applied to any jobs yet."
              : `No applications with status "${activeTab}".`}
          </p>
          <Link to="/jobs">
            <Button variant="primary" className="mt-8">Browse Active Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6" role="list" aria-label={`${activeTab} applications`}>
          {filteredApps.map((app, i) => (
            <motion.article
              key={app.id}
              role="listitem"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-[2rem] p-6 lg:p-8 border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)] transition-colors group"
              aria-label={`${app.title} at ${app.company} — ${app.status}`}
            >
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <Link to={`/jobs/${app.jobId}`}>
                      <h2 className="text-2xl font-serif font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                        {app.title}
                      </h2>
                    </Link>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 font-sans text-sm text-gray-600 font-medium">
                      <span className="flex items-center gap-1.5"><Building className="w-4 h-4 text-gray-400" aria-hidden="true" /> {app.company}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" /> {app.location}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" /> Applied: {app.appliedDate}</span>
                    </div>
                  </div>

                  <Badge
                    variant="ghost"
                    className={`${app.statusBg} ${app.statusColor} shrink-0 px-4 py-1.5 text-xs flex items-center gap-1.5`}
                  >
                    <app.statusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {app.status}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Next Step</p>
                    <p className="font-sans font-medium text-gray-900">
                      {app.rawStatus === 'INTERVIEW_SCHEDULED'
                        ? 'Your interview room is ready'
                        : app.rawStatus === 'ACCEPTED'
                        ? 'Congratulations — offer accepted!'
                        : app.rawStatus === 'REJECTED'
                        ? 'Keep applying — new opportunities await'
                        : 'Application under review by employer'}
                    </p>
                  </div>

                  {app.rawStatus === 'INTERVIEW_SCHEDULED' && app.interviewRoomId && (
                    <Link to={`/interview/${app.interviewRoomId}`}>
                      <Button
                        variant="primary"
                        className="shrink-0 w-full sm:w-auto shadow-lg shadow-teal-500/20 px-8"
                        aria-label={`Join interview room for ${app.title}`}
                      >
                        {deaf ? '🤟 ' : ''} Join Interview
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
