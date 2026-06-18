import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, User, Briefcase, FileText, Video, BookOpen, Settings, LogOut, CheckSquare } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../common/Button'

export function Sidebar({ role = 'JOB_SEEKER' }) {
  const location = useLocation()
  const logout = useAuthStore(s => s.logout)

  const seekerLinks = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Briefcase, label: 'Search jobs', path: '/jobs' },
    { icon: FileText, label: 'My jobs', path: '/applications' },
    { icon: Video, label: 'Interviews', path: '/interviews' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: CheckSquare, label: 'Resumes', path: '/resumes' },
    { icon: BookOpen, label: 'Resources', path: '/resources' },
    { icon: Settings, label: 'Settings', path: '/accessibility' },
  ]

  const employerLinks = [
    { icon: Home, label: 'Dashboard', path: '/employer/dashboard' },
    { icon: Briefcase, label: 'Post Job', path: '/employer/jobs/new' },
    { icon: FileText, label: 'My Jobs', path: '/employer/jobs' },
    { icon: CheckSquare, label: 'Applications', path: '/employer/applications' },
    { icon: Video, label: 'Interviews', path: '/interviews' }, 
    { icon: User, label: 'Profile', path: '/employer/profile' },
  ]

  const links = role === 'EMPLOYER' ? employerLinks : seekerLinks

  return (
    <aside className="w-64 bg-[#1e2029] h-screen sticky top-0 flex flex-col pt-8 pb-4 shrink-0 overflow-y-auto font-sans">
      <div className="px-8 mb-10 flex items-center gap-3">
        <Link to="/" style={{ fontFamily: 'var(--font-serif)' }} className="text-[26px] font-bold tracking-tight text-white focus-ring inline-block hover:opacity-80 transition-opacity">
          SkillAble.
        </Link>
      </div>

      <div className="px-8 mb-4">
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">Main Menu</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path)
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all focus-ring text-[14px] font-medium",
                isActive 
                  ? "bg-[#4F7DFF] text-white shadow-lg shadow-[#4F7DFF]/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <link.icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-8 mt-12 pt-8">
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 py-2 font-sans text-[14px] font-medium text-gray-400 hover:text-white transition-all focus-ring"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  )
}
