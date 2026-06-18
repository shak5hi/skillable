import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Video, TrendingUp, Search, ChevronDown, Bookmark, Bell, Eye, MoreHorizontal } from 'lucide-react'
import { useAuthStore, isBlindUser, isDeafUser } from '../store/authStore'
import api from '../api/axios'

// Premium animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

const MOCK_APPS = [
  { id: 'm1', company: 'Google', role: 'Senior UX Designer', status: 'INTERVIEW SCHEDULED', interview_room_id: 'demo-room', date: 'Today' },
  { id: 'm2', company: 'Discord', role: 'REVIEWING', status: 'REVIEWING', date: 'Yesterday' },
  { id: 'm3', company: 'Spotify', role: 'Frontend Engineer', status: 'APPLIED', date: '3 days ago' }
]

const MOCK_JOBS = [
  { id: 'j1', company: 'Figma', title: 'Senior Product Designer', match: 98, salary: '$120k-$150k', location: 'Remote, US' },
  { id: 'j2', company: 'Stripe', title: 'Frontend Developer', match: 94, salary: '$110k-$140k', location: 'London, UK' },
  { id: 'j3', company: 'Airbnb', title: 'Accessibility Engineer', match: 92, salary: '$130k-$160k', location: 'San Francisco, CA' }
]

export default function SeekerDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const blind = isBlindUser(user)
  const deaf  = isDeafUser(user)

  const [statsData, setStatsData] = useState({ sent: 0, review: 0, interviews: 0, matched: 0 })
  const [recentApps, setRecentApps]       = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
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
        const [appsRes, jobsRes] = await Promise.all([
          api.get('/api/applications/'),
          api.get('/api/jobs/'),
        ])

        const apps  = appsRes.data?.results  || []
        const jobs  = jobsRes.data?.results  || []

        const sent       = apps.length
        const review     = apps.filter(a => ['UNDER_REVIEW', 'REVIEWING'].includes(a.status)).length
        const interviews = apps.filter(a => a.status === 'INTERVIEW_SCHEDULED').length

        setStatsData({ 
          sent: sent || 12, 
          review: review || 4, 
          interviews: interviews || 2, 
          matched: jobs.length || 24 
        })

        const mappedApps = apps.slice(0, 3).map(app => ({
          id: app.id,
          company: app.company_name,
          role: app.job_title,
          status: (app.status || '').replace(/_/g, ' '),
          rawStatus: app.status,
          interviewRoomId: app.interview_room_id || null,
          date: new Date(app.applied_at).toLocaleDateString(),
        }))

        const mappedJobs = jobs.slice(0, 3).map(job => ({
          id: job.id,
          title: job.title,
          company: job.company_name || job.employer?.company_name || 'Company',
          match: job.match_score || 85,
          salary: '$8k-$10k',
          location: 'London, UK'
        }))

        setRecentApps(mappedApps.length > 0 ? mappedApps : MOCK_APPS)
        setRecommendedJobs(mappedJobs.length > 0 ? mappedJobs : MOCK_JOBS)

        if (blind) {
          const firstName = user?.full_name?.split(' ')[0] || 'there'
          speak(`Welcome back ${firstName}. You have ${sent || 12} applications sent.`)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to mock on error
        setStatsData({ sent: 12, review: 4, interviews: 2, matched: 24 })
        setRecentApps(MOCK_APPS)
        setRecommendedJobs(MOCK_JOBS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, []) // eslint-disable-line

  const firstName = user?.full_name?.split(' ')[0] || 'Amanda'

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1200px] mx-auto space-y-3 pb-8 font-sans text-gray-900" 
      id="main-content"
    >
      
      {/* ── Top Navbar ── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight mb-0.5 text-[#111827]">Hello, {firstName}</h1>
          <p className="text-gray-500 text-xs font-medium">Here's what's happening with your job search today.</p>
        </div>
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <button className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#4F7DFF] hover:bg-[#F8FAFC] transition-all">
            <Bookmark className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 rounded-lg bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#4F7DFF] hover:bg-[#F8FAFC] transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2 bg-white pl-1 pr-3 py-1 rounded-full shadow-sm border border-gray-100 cursor-pointer ml-1 hover:shadow-md transition-shadow">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-white shadow-inner">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#111827] leading-none">{user?.full_name || 'Amanda Doe'}</span>
              <span className="text-[9px] text-gray-500 leading-none mt-0.5 truncate max-w-[100px]">{user?.email || 'amanda@example.com'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {(blind || deaf) && (
        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-3">
          {blind && <span className="bg-[#F8FAFC] text-[#4F7DFF] border border-[#E5E7EB] text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">Voice Nav Active</span>}
          {deaf && <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">Sign Language Ready</span>}
        </motion.div>
      )}

      {/* ── Premium Hero Banner ── */}
      <motion.div variants={itemVariants} className="relative w-full h-[180px] rounded-2xl mb-10 overflow-visible shadow-sm group">
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[#111827] shadow-inner">
          <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/70 to-transparent"></div>
        </div>
        
        <div className="relative h-full px-8 md:px-12 flex flex-col justify-center pb-6">
          <h2 className="text-white text-2xl md:text-3xl font-extrabold leading-[1.1] max-w-md tracking-tight">
            Find your perfect job in just a few clicks
          </h2>
          <p className="text-gray-300 mt-2 text-xs font-medium max-w-sm">
            Let smart matching connect you with the best jobs instantly.
          </p>
        </div>

        {/* Floating Glassmorphism Search Bar */}
        <div className="absolute -bottom-6 left-6 right-6 md:left-12 md:right-12 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-1.5 flex items-center border border-white">
          <div className="flex-1 px-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#4F7DFF] shrink-0" />
            <input 
              type="text" 
              placeholder="Job title, keywords, or company..." 
              className="w-full outline-none text-[#111827] text-sm font-semibold placeholder:text-gray-400 placeholder:font-medium bg-transparent border-0 focus:ring-0" 
            />
          </div>
          <div className="hidden md:block w-[1px] h-6 bg-gray-200"></div>
          <div className="hidden md:flex px-4 text-gray-500 text-xs font-semibold items-center gap-1.5 cursor-pointer hover:text-[#111827] whitespace-nowrap transition-colors">
            Location: All <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <button className="bg-[#4F7DFF] text-white px-6 py-2 rounded-lg font-bold text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all shrink-0">
            Search
          </button>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Landing Page Connected Stat Card (Dark) */}
        <div className="bg-[#111827] rounded-2xl p-5 text-white shadow-md relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-gray-800">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4F7DFF]/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-gray-300 text-xs font-semibold mb-1">Today's profile views</p>
          <p className="text-3xl font-bold mb-2 tracking-tight">{isLoading ? '–' : 134}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-semibold whitespace-nowrap">
            <span className="bg-[#4F7DFF]/20 px-1.5 py-0.5 rounded font-bold text-[#4F7DFF]">+12%</span> from last month
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#4F7DFF]/10 group-hover:text-[#4F7DFF] transition-colors duration-300">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">New recruiter views</p>
          <p className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">{isLoading ? '–' : 112}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold whitespace-nowrap">
            <span className="bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">+6%</span> from last month
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#4F7DFF]/10 group-hover:text-[#4F7DFF] transition-colors duration-300">
            <Eye className="w-3.5 h-3.5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Search appearances</p>
          <p className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">{isLoading ? '–' : 311}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold whitespace-nowrap">
            <span className="bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">+8%</span> from last month
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors duration-300">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Applications sent</p>
          <p className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">{isLoading ? '–' : statsData.sent}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold whitespace-nowrap">
            <span className="bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">+4%</span> from last month
          </div>
        </div>
      </motion.div>

      {/* ── Main Content Grid ── */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-4">

        {/* Left Column - Job Activity */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-[#111827]">Job Activity</h2>
              <Link to="/applications" className="text-[#4F7DFF] hover:text-[#3B66DF] text-[11px] font-bold flex items-center gap-1 group">
                View all <ChevronDown className="w-3 h-3 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-gray-400 text-xs font-medium">Loading activity...</div>
              ) : (
                recentApps.map((app) => (
                  <div key={app.id} className="relative group cursor-pointer border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#F8FAFC] border border-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-[#475569] font-bold text-[10px]">{app.company[0]}</span>
                        </div>
                        <h3 className="font-bold text-[#111827] text-xs group-hover:text-[#4F7DFF] transition-colors">{app.role}</h3>
                      </div>
                      <button className="text-gray-400 hover:text-[#111827] transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="w-full relative mt-2 mb-2">
                      <div className="h-[3px] bg-gray-100 rounded-full w-full absolute top-[3.5px] z-0"></div>
                      <div className="h-[3px] bg-[#4F7DFF] rounded-full w-[60%] absolute top-[3.5px] z-0"></div>
                      <div className="flex justify-between relative z-10 px-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4F7DFF] border-2 border-white shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4F7DFF] border-2 border-white shadow-sm"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4F7DFF] border-2 border-white"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200 border-2 border-white shadow-sm"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>Step 3</span>
                      {app.interview_room_id ? (
                        <Link to={`/interview/${app.interview_room_id}`}>
                          <button className="bg-[#4F7DFF] text-white px-3 py-1 rounded shadow-sm hover:shadow-md transition-all uppercase tracking-widest text-[8px] font-bold">Join Room</button>
                        </Link>
                      ) : (
                        <span className="text-[#111827]">{app.status}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Recommended */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-[#111827]">Recommended Jobs</h2>
              <Link to="/jobs" className="text-[#4F7DFF] hover:text-[#3B66DF] text-[11px] font-bold flex items-center gap-1 group">
                View all <ChevronDown className="w-3 h-3 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-gray-400 py-4 text-xs font-medium">Loading...</div>
              ) : (
                recommendedJobs.map((job) => (
                  <div key={job.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all duration-300 group relative bg-gray-50/50 hover:bg-white cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm group-hover:-translate-y-0.5 transition-transform">
                        <span className="font-bold text-[#475569] text-sm">{job.company[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[13px] font-bold text-[#111827] group-hover:text-[#4F7DFF] transition-colors">{job.title}</h3>
                          <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                            {job.match}% Match
                          </span>
                        </div>
                        <p className="text-[#475569] text-[11px] font-medium max-w-sm leading-relaxed mb-3 line-clamp-1">
                          We're looking for a creative professional to join {job.company}.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-gray-400 text-[10px] font-bold tracking-wide uppercase">{job.salary} <span className="mx-1 font-normal">·</span> {job.location}</p>
                          <div className="flex items-center gap-2">
                            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#111827] hover:bg-gray-100 transition-colors">
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-[#111827] text-[11px] font-bold hover:bg-gray-100 transition-colors">
                              Details
                            </button>
                            <button className="px-4 py-1.5 rounded-lg bg-[#111827] text-white text-[11px] font-bold hover:bg-gray-900 transition-all">
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </motion.div>

    </motion.div>
  )
}
