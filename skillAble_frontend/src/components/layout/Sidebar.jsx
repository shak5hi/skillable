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
    { icon: User, label: 'My Profile', path: '/profile' },
    { icon: Briefcase, label: 'Browse Jobs', path: '/jobs' },
    { icon: CheckSquare, label: 'My Applications', path: '/applications' },
    { icon: FileText, label: 'My Resumes', path: '/resumes' },
    { icon: Video, label: 'Interview Rooms', path: '/interviews' },
    { icon: BookOpen, label: 'Resources', path: '/resources' },
    { icon: Settings, label: 'Accessibility Settings', path: '/accessibility' },
  ]

  const employerLinks = [
    { icon: Home, label: 'Dashboard', path: '/employer/dashboard' },
    { icon: Briefcase, label: 'Post Job', path: '/employer/jobs/new' },
    { icon: Briefcase, label: 'My Jobs', path: '/employer/jobs' },
    { icon: CheckSquare, label: 'Applications Received', path: '/employer/applications' },
    { icon: Video, label: 'Interview Rooms', path: '/interviews' }, // Shared view theoretically
    { icon: User, label: 'Company Profile', path: '/employer/profile' },
  ]

  const links = role === 'EMPLOYER' ? employerLinks : seekerLinks

  return (
    <aside className="w-64 bg-white border-r border-[var(--color-border)] h-screen sticky top-0 flex flex-col pt-6 pb-4 shrink-0 overflow-y-auto">
      <div className="px-6 mb-8">
        <Link to="/" className="text-2xl font-serif text-[var(--color-primary)] font-bold focus-ring rounded-md inline-block">
          SkillAble
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.path)
          return (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium transition-all focus-ring",
                isActive 
                  ? "bg-teal-50 text-[var(--color-primary)] shadow-sm"
                  : "text-gray-600 hover:bg-[var(--color-surface-hover)] hover:text-gray-900"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <link.icon className={cn("w-5 h-5", isActive ? "text-[var(--color-primary)]" : "text-gray-400")} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 mt-6 pt-6 border-t border-[var(--color-border)]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all focus-ring"
        >
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  )
}
