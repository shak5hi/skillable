import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Layout }           from './components/layout/Layout'
import { DashboardLayout }  from './components/layout/DashboardLayout'
import { ProtectedRoute }   from './components/layout/ProtectedRoute'
import { VoiceNavigationButton } from './components/accessibility/VoiceNavigationButton'
import Landing          from './pages/Landing'
import SignupRole       from './pages/SignupRole'
import SignupSeeker     from './pages/SignupSeeker'
import SignupEmployer   from './pages/SignupEmployer'
import Login            from './pages/Login'
import SeekerDashboard  from './pages/SeekerDashboard'
import BrowseJobs       from './pages/BrowseJobs'
import InterviewRoom    from './pages/InterviewRoom'
import ResumeManager    from './pages/ResumeManager'
import Resources        from './pages/Resources'
import AccessibilitySettings from './pages/AccessibilitySettings'
import JobDetail        from './pages/JobDetail'
import MyApplications   from './pages/MyApplications'
import EmployerDashboard from './pages/EmployerDashboard'
import PostJob          from './pages/PostJob'
import { useAuthStore, isBlindUser, isDeafUser } from './store/authStore'
import { useAccessibilityStore } from './store/accessibilityStore'

// ─────────────────────────────────────────────────────────────────────────────
// AccessibilitySync
// Reads disability_type from user.seeker_profile.disability_type (the correct
// nested path returned by the Django UserSerializer) and auto-enables features.
// Also applies high-contrast CSS class and font-size CSS var to :root.
// ─────────────────────────────────────────────────────────────────────────────
function AccessibilitySync() {
  const { user } = useAuthStore()
  const { settings, updateSettings } = useAccessibilityStore()

  // High contrast
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', !!settings.highContrast)
  }, [settings.highContrast])

  // Font size
  useEffect(() => {
    const sizeMap = { small: '14px', medium: '16px', large: '19px' }
    document.documentElement.style.fontSize = sizeMap[settings.fontSize] || '16px'
  }, [settings.fontSize])

  // Disability-aware preference sync on login
  useEffect(() => {
    if (!user) return
    const blind = isBlindUser(user)
    const deaf  = isDeafUser(user)
    const acc   = user.accessibility || {}

    updateSettings({
      screenReader:        blind || acc.screen_reader        || false,
      voiceNavigation:     blind || acc.voice_navigation     || false,
      signLanguageSupport: deaf  || acc.sign_language_support || false,
    })

    if (blind && window.speechSynthesis) {
      setTimeout(() => {
        const utt = new SpeechSynthesisUtterance(
          'Welcome to SkillAble. Voice navigation is active. ' +
          'Say hello bandhu to give a command, or say read aloud to hear the current page.'
        )
        utt.rate = 0.9
        window.speechSynthesis.speak(utt)
      }, 1200)
    }
  }, [user?.id]) // eslint-disable-line

  return null
}

// ─────────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AccessibilitySync />
      {/* VoiceNavigationButton always mounted — wake word always listening */}
      <VoiceNavigationButton />

      <Routes>
        {/* Auth */}
        <Route path="/login"           element={<Login />} />
        <Route path="/signup"          element={<SignupRole />} />
        <Route path="/signup/seeker"   element={<SignupSeeker />} />
        <Route path="/signup/employer" element={<SignupEmployer />} />

        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/resources" element={<Resources />} />
        </Route>

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/interview/:roomId" element={<InterviewRoom />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"           element={<SeekerDashboard />} />
            <Route path="/jobs"                element={<BrowseJobs />} />
            <Route path="/jobs/:id"            element={<JobDetail />} />
            <Route path="/applications"        element={<MyApplications />} />
            <Route path="/resumes"             element={<ResumeManager />} />
            <Route path="/accessibility"       element={<AccessibilitySettings />} />
            <Route path="/employer/dashboard"  element={<EmployerDashboard />} />
            <Route path="/employer/jobs/new"   element={<PostJob />} />
            <Route path="/profile"               element={<SeekerDashboard />} />
            <Route path="/employer/profile"      element={<EmployerDashboard />} />
            <Route path="/employer/jobs"         element={<EmployerDashboard />} />
            <Route path="/employer/applications" element={<EmployerDashboard />} />
            <Route path="/interviews"            element={<SeekerDashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
