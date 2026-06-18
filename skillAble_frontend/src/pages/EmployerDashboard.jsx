import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Briefcase, Video, UserCheck, PlusCircle, Building, ChevronDown, Eye, MoreHorizontal, Search, Bookmark } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
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

const MOCK_ACTIVE_JOBS = [
  { id: 'j1', title: 'Senior UX Designer', location: 'London, UK', salary: '$120k-$150k', is_active: true, match: 98, created_at: new Date().toISOString() },
  { id: 'j2', title: 'Frontend Developer', location: 'Remote, US', salary: '$110k-$140k', is_active: true, match: 94, created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'j3', title: 'Product Manager', location: 'San Francisco, CA', salary: '$130k-$160k', is_active: false, match: 92, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
]

const MOCK_RECENT_APPS = [
  { id: 'a1', applicant_name: 'Amanda Doe', job_title: 'Senior UX Designer', status: 'INTERVIEW_SCHEDULED', interview_room_id: 'demo-room', applied_at: new Date().toISOString() },
  { id: 'a2', applicant_name: 'David Chen', job_title: 'Frontend Developer', status: 'UNDER_REVIEW', applied_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'a3', applicant_name: 'Sarah Jenkins', job_title: 'Product Manager', status: 'APPLIED', applied_at: new Date(Date.now() - 86400000 * 2).toISOString() },
]

export default function EmployerDashboard() {
  const { user } = useAuthStore()

  const [activeJobs, setActiveJobs] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/api/jobs/my_jobs/'),
          api.get('/api/applications/')
        ])

        let jobs = []
        if (jobsRes.data && Array.isArray(jobsRes.data)) {
           jobs = jobsRes.data
        } else if (jobsRes.data && jobsRes.data.results) {
           jobs = jobsRes.data.results
        }
        
        let apps = []
        if (appsRes.data && Array.isArray(appsRes.data)) {
          apps = appsRes.data
        } else if (appsRes.data && appsRes.data.results) {
          apps = appsRes.data.results
        }

        setActiveJobs(jobs.length > 0 ? jobs.slice(0, 3) : MOCK_ACTIVE_JOBS)
        setRecentApplications(apps.length > 0 ? apps.slice(0, 3) : MOCK_RECENT_APPS)

      } catch (error) {
        console.error('Error fetching employer dashboard data:', error)
        setActiveJobs(MOCK_ACTIVE_JOBS)
        setRecentApplications(MOCK_RECENT_APPS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statJobs = activeJobs.filter(j => j.is_active).length || 2
  const statApps = recentApplications.length || 15
  const statInterviews = recentApplications.filter(a => a.status === 'INTERVIEW_SCHEDULED' || a.status === 'INTERVIEW').length || 4
  const statHires = recentApplications.filter(a => a.status === 'OFFER_SENT' || a.status === 'ACCEPTED').length || 1

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1200px] mx-auto space-y-3 pb-8 font-sans text-gray-900"
    >
      
      {/* ── Top Navbar ── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between mb-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight mb-0.5 text-[#111827]">Welcome, {user?.full_name?.split(' ')[0] || 'Recruiter'}</h1>
          <p className="text-gray-500 text-xs font-medium">Here's an overview of your inclusive hiring pipeline.</p>
        </div>
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          <Link to="/employer/jobs/new">
            <button className="bg-white text-[#111827] px-4 py-1.5 rounded-lg font-bold text-[11px] shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-[#4F7DFF]" /> Post Job
            </button>
          </Link>
          <div className="flex items-center gap-2 bg-white pl-1 pr-3 py-1 rounded-full shadow-sm border border-gray-100 cursor-pointer ml-1 hover:shadow-md transition-shadow">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 overflow-hidden ring-1 ring-white shadow-inner">
              <Building className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#111827] leading-none">{user?.full_name || 'Acme Corp'}</span>
              <span className="text-[9px] text-gray-500 leading-none mt-0.5 truncate max-w-[100px]">Employer Account</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Premium Hero Banner (Identical to Seeker) ── */}
      <motion.div variants={itemVariants} className="relative w-full h-[180px] rounded-2xl mb-10 overflow-visible shadow-sm group">
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[#111827] shadow-inner">
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" 
            className="w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827] via-[#111827]/70 to-transparent"></div>
        </div>
        
        <div className="relative h-full px-8 md:px-12 flex flex-col justify-center pb-6">
          <h2 className="text-white text-2xl md:text-3xl font-extrabold leading-[1.1] max-w-md tracking-tight">
            Build diverse, high-performing teams
          </h2>
          <p className="text-gray-300 mt-2 text-xs font-medium max-w-sm">
            Search our pool of incredibly talented professionals instantly.
          </p>
        </div>

        {/* Floating Glassmorphism Search Bar */}
        <div className="absolute -bottom-6 left-6 right-6 md:left-12 md:right-12 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-1.5 flex items-center border border-white">
          <div className="flex-1 px-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#4F7DFF] shrink-0" />
            <input 
              type="text" 
              placeholder="Search by skill, role, or candidate name..." 
              className="w-full outline-none text-[#111827] text-sm font-semibold placeholder:text-gray-400 placeholder:font-medium bg-transparent border-0 focus:ring-0" 
            />
          </div>
          <div className="hidden md:block w-[1px] h-6 bg-gray-200"></div>
          <div className="hidden md:flex px-4 text-gray-500 text-xs font-semibold items-center gap-1.5 cursor-pointer hover:text-[#111827] whitespace-nowrap transition-colors">
            Role: All <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <button className="bg-[#4F7DFF] text-white px-6 py-2 rounded-lg font-bold text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all shrink-0">
            Search
          </button>
        </div>
      </motion.div>

      {/* ── Stats Grid (Identical to Seeker) ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-[#111827] rounded-2xl p-5 text-white shadow-md relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-gray-800">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#4F7DFF]/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <Briefcase className="w-3.5 h-3.5 text-white" />
          </div>
          <p className="text-gray-300 text-xs font-semibold mb-1">Active Jobs</p>
          <p className="text-3xl font-bold mb-2 tracking-tight">{isLoading ? '–' : statJobs}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-semibold whitespace-nowrap">
            <span className="bg-[#4F7DFF]/20 px-1.5 py-0.5 rounded font-bold text-[#4F7DFF]">+2</span> from last week
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#4F7DFF]/10 group-hover:text-[#4F7DFF] transition-colors duration-300">
            <Users className="w-3.5 h-3.5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">{isLoading ? '–' : statApps}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold whitespace-nowrap">
            <span className="bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">+15%</span> from last week
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#4F7DFF]/10 group-hover:text-[#4F7DFF] transition-colors duration-300">
            <Video className="w-3.5 h-3.5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Interviews Scheduled</p>
          <p className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">{isLoading ? '–' : statInterviews}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold whitespace-nowrap">
            <span className="bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded">+4</span> this week
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-gray-100 relative group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors duration-300">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <p className="text-gray-500 text-xs font-semibold mb-1">Hires Made</p>
          <p className="text-3xl font-bold text-[#111827] mb-2 tracking-tight">{isLoading ? '–' : statHires}</p>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold whitespace-nowrap">
            <span className="bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">+0</span> from last month
          </div>
        </div>
      </motion.div>

      {/* ── Main Content Grid (Identical Layout to Seeker) ── */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-4">

        {/* Left Column - Application Pipeline (Mirroring "Job Activity") */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-[#111827]">Application Pipeline</h2>
              <Link to="/employer/applications" className="text-[#4F7DFF] hover:text-[#3B66DF] text-[11px] font-bold flex items-center gap-1 group">
                View all <ChevronDown className="w-3 h-3 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <div className="text-gray-400 text-xs font-medium">Loading pipeline...</div>
              ) : (
                recentApplications.map((app) => (
                  <div key={app.id} className="relative group cursor-pointer border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#F8FAFC] border border-gray-100 flex items-center justify-center shrink-0">
                          <span className="text-[#475569] font-bold text-[10px]">{(app.applicant_name || 'C')[0]}</span>
                        </div>
                        <h3 className="font-bold text-[#111827] text-xs group-hover:text-[#4F7DFF] transition-colors">{app.applicant_name}</h3>
                      </div>
                      <button className="text-gray-400 hover:text-[#111827] transition-colors">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Progress Bar styled identical to Seeker */}
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
                      <span>{app.job_title}</span>
                      {app.status === 'INTERVIEW_SCHEDULED' && app.interview_room_id ? (
                        <Link to={`/interview/${app.interview_room_id}`}>
                          <button className="bg-[#4F7DFF] text-white px-3 py-1 rounded shadow-sm hover:shadow-md transition-all uppercase tracking-widest text-[8px] font-bold">Join Room</button>
                        </Link>
                      ) : (
                        <span className="text-[#111827]">{app.status.replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Manage Jobs (Mirroring "Recommended Jobs") */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-bold text-[#111827]">Active Job Postings</h2>
              <Link to="/employer/jobs" className="text-[#4F7DFF] hover:text-[#3B66DF] text-[11px] font-bold flex items-center gap-1 group">
                Manage all <ChevronDown className="w-3 h-3 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="text-gray-400 py-4 text-xs font-medium">Loading...</div>
              ) : (
                activeJobs.map((job) => (
                  <div key={job.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all duration-300 group relative bg-gray-50/50 hover:bg-white cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm group-hover:-translate-y-0.5 transition-transform">
                        <Briefcase className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-[13px] font-bold text-[#111827] group-hover:text-[#4F7DFF] transition-colors">{job.title}</h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${job.is_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                            {job.is_active ? 'Active' : 'Closed'}
                          </span>
                        </div>
                        <p className="text-[#475569] text-[11px] font-medium max-w-sm leading-relaxed mb-3 line-clamp-1">
                          Looking for talented candidates to join our team in this role.
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <p className="text-gray-400 text-[10px] font-bold tracking-wide uppercase">{job.salary || '$100k-$120k'} <span className="mx-1 font-normal">·</span> {job.location || 'Remote'}</p>
                          <div className="flex items-center gap-2">
                            <button className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#111827] hover:bg-gray-100 transition-colors">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                            <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-[#111827] text-[11px] font-bold hover:bg-gray-100 transition-colors">
                              Edit Job
                            </button>
                            <button className="px-4 py-1.5 rounded-lg bg-[#111827] text-white text-[11px] font-bold hover:bg-gray-900 transition-all">
                              View Candidates
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
