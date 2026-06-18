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
      <div className="px-8 mb-12">
        <Link to="/" className="text-[22px] tracking-tight text-[var(--color-primary)] font-bold focus-ring inline-block" style={{ fontFamily: 'var(--font-serif)' }}>
          SkillAble.
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
                "flex items-center gap-4 px-8 py-3.5 font-sans transition-all focus-ring text-[13px] uppercase tracking-widest font-bold",
                isActive 
                  ? "border-r-2 border-[#111827] text-[#111827]"
                  : "text-[#475569] hover:text-[#111827]"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <link.icon className={cn("w-[18px] h-[18px]", isActive ? "text-[#111827]" : "text-[#475569]")} strokeWidth={isActive ? 2.5 : 1.5} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-8 mt-12 pt-8 border-t border-[var(--color-border)]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-4 py-2 font-sans text-[12px] uppercase tracking-widest font-bold text-[#475569] hover:text-[#111827] transition-all focus-ring"
        >
          <LogOut className="w-[18px] h-[18px] text-[#475569] group-hover:text-[#111827]" strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </aside>
  )
}
