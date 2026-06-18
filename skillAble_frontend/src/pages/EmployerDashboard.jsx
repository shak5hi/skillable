import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, Briefcase, Video, UserCheck, PlusCircle, Building } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Badge } from '../components/common/Badge'
import { Button } from '../components/common/Button'
import api from '../api/axios'

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

        if (jobsRes.data && Array.isArray(jobsRes.data)) {
           setActiveJobs(jobsRes.data.slice(0, 5))
        } else if (jobsRes.data && jobsRes.data.results) {
           setActiveJobs(jobsRes.data.results.slice(0, 5))
        }

        if (appsRes.data && Array.isArray(appsRes.data)) {
          setRecentApplications(appsRes.data)
        } else if (appsRes.data && appsRes.data.results) {
          setRecentApplications(appsRes.data.results)
        }
      } catch (error) {
        console.error('Error fetching employer dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await api.patch(`/api/applications/${id}/update_status/`, { status: newStatus })
      setRecentApplications(apps => apps.map(app =>
        app.id === id ? { ...app, ...data } : app
      ))
    } catch (e) {
      alert("Failed to update status")
    }
  }

  const statJobs = activeJobs.length || 0
  const statApps = recentApplications.length || 0
  const statInterviews = recentApplications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length || 0
  const statHires = recentApplications.filter(a => a.status === 'OFFER_SENT' || a.status === 'ACCEPTED').length || 0

  const stats = [
    { label: 'Active Jobs', value: statJobs, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Applications', value: statApps, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Interviews Scheduled', value: statInterviews, icon: Video, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Hires Made', value: statHires, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2rem] shadow-sm border border-[var(--color-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
            <Building className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Welcome back, {user?.full_name || 'Employer'}
            </h1>
            <p className="mt-2 text-lg text-gray-600 font-sans">
              Here is an overview of your inclusive hiring pipeline.
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <Link to="/employer/jobs/new">
            <Button className="flex items-center gap-2">
               <PlusCircle className="w-5 h-5" /> Post New Job
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-[var(--color-border)] shadow-sm flex flex-col gap-4 text-center items-center hover:-translate-y-1 transition-transform"
          >
            <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-serif font-bold text-gray-900">{isLoading ? '-' : stat.value}</p>
              <p className="text-sm font-sans font-medium text-gray-500 mt-1">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Column - Recent Applications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Recent Applications</h2>
            <Button variant="ghost" size="sm">View All Candidates</Button>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-[var(--color-border)] shadow-sm overflow-hidden overflow-x-auto min-h-[150px]">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Loading tracking data...</div>
            ) : recentApplications.length === 0 ? (
               <div className="p-8 text-center text-gray-500">No applications received yet.</div>
            ) : (
            <table className="w-full text-left font-sans min-w-[700px]">
               <thead className="bg-gray-50 text-gray-500 font-medium text-sm">
                 <tr>
                   <th className="px-6 py-4 font-normal">Candidate</th>
                   <th className="px-6 py-4 font-normal">Job Applied For</th>
                   <th className="px-6 py-4 font-normal">Status</th>
                   <th className="px-6 py-4 font-normal text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {recentApplications.map((app) => (
                   <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                     <td className="px-6 py-4">
                       <p className="font-bold text-gray-900">{app.applicant_name || 'Applicant'}</p>
                       <p className="text-xs text-gray-500 mt-1">{new Date(app.applied_at).toLocaleDateString()}</p>
                     </td>
                     <td className="px-6 py-4">
                        <p className="text-gray-800 font-medium text-sm">{app.job_title}</p>
                     </td>
                     <td className="px-6 py-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className={`text-sm font-medium rounded-full px-3 py-1 outline-none border transition-colors cursor-pointer ${
                            app.status === 'APPLIED' ? 'bg-gray-100 border-gray-200 text-gray-700' :
                            app.status === 'UNDER_REVIEW' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            app.status === 'INTERVIEW_SCHEDULED' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                            'bg-green-50 border-green-200 text-green-700'
                          }`}
                        >
                          <option value="APPLIED">Applied</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="INTERVIEW_SCHEDULED">Interview</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="OFFER_SENT">Offer Sent</option>
                          <option value="ACCEPTED">Accepted</option>
                        </select>
                     </td>
                     <td className="px-6 py-4 text-right">
                        {app.status === 'INTERVIEW_SCHEDULED' && app.interview_room_id ? (
                           <Link to={`/interview/${app.interview_room_id}`}>
                             <Button size="sm" variant="accent">Join Room</Button>
                           </Link>
                        ) : app.status === 'INTERVIEW_SCHEDULED' ? (
                          <span className="text-xs text-gray-500 font-sans">Create interview room first</span>
                        ) : (
                          <Button size="sm" variant="ghost">Profile</Button>
                        )}
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Side Column - Active Jobs */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Active Jobs</h2>
            <Link to="/employer/jobs" className="text-sm font-bold text-[var(--color-primary)] hover:underline">Manage All</Link>
          </div>

          <div className="bg-white rounded-[2rem] border border-[var(--color-border)] shadow-sm p-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-gray-500 py-4">Loading active jobs...</div>
              ) : activeJobs.length === 0 ? (
                <div className="text-center text-gray-500 py-4">You have no active jobs.</div>
              ) : activeJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">{job.title}</h3>
                    <Badge variant={job.is_active ? 'success' : 'warning'} className="text-[10px] px-2">{job.is_active ? 'Active' : 'Closed'}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm font-sans">
                     <span className="text-gray-500">Posted on {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                     <Button size="sm" variant="outline" className="flex-1 py-1.5 min-h-0 text-xs">Edit</Button>
                     <Button size="sm" variant="ghost" className="flex-1 py-1.5 min-h-0 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">Close</Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/employer/jobs/new">
               <button className="w-full mt-4 p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-sans font-bold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:bg-teal-50 focus-ring transition-colors flex items-center justify-center gap-2">
                 <PlusCircle className="w-5 h-5" /> Post Another Job
               </button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
