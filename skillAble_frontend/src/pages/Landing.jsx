import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, Monitor, Keyboard, Type, 
  Eye, Captions, Palette, ChevronDown, BookOpen, Briefcase, 
  Target, TrendingUp, Search, UserCheck
} from 'lucide-react'

// -----------------------------------------------------------------------------
// Isolated Landing Navbar
// -----------------------------------------------------------------------------
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold tracking-tight text-[#111827]">
            SkillAble
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-[#475569] hover:text-[#111827]">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-[#475569] hover:text-[#111827]">How It Works</a>
            <a href="#stories" className="text-sm font-medium text-[#475569] hover:text-[#111827]">Success Stories</a>
            <a href="#accessibility" className="text-sm font-medium text-[#475569] hover:text-[#111827]">Accessibility</a>
            <a href="#contact" className="text-sm font-medium text-[#475569] hover:text-[#111827]">Contact</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden sm:block text-sm font-medium text-[#475569] hover:text-[#111827]">
            Login
          </Link>
          <Link to="/signup">
            <button className="bg-[#1E293B] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#111827] transition-colors">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}

// -----------------------------------------------------------------------------
// Isolated Landing Footer
// -----------------------------------------------------------------------------
function LandingFooter() {
  return (
    <footer id="contact" className="bg-white border-t border-[#E5E7EB] pt-16 pb-8 px-6 sm:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 space-y-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-[#111827]">
            SkillAble
          </Link>
          <p className="text-[#475569] text-sm max-w-xs leading-relaxed">
            Empowering abilities into opportunities. Designed for everyone.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-[#111827] mb-4">Product</h4>
          <ul className="space-y-3">
            <li><Link to="/jobs" className="text-sm text-[#475569] hover:text-[#111827]">Find Jobs</Link></li>
            <li><Link to="/employers" className="text-sm text-[#475569] hover:text-[#111827]">For Employers</Link></li>
            <li><a href="#features" className="text-sm text-[#475569] hover:text-[#111827]">Features</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-[#111827] mb-4">Resources</h4>
          <ul className="space-y-3">
            <li><Link to="/resources" className="text-sm text-[#475569] hover:text-[#111827]">Blog</Link></li>
            <li><a href="#accessibility" className="text-sm text-[#475569] hover:text-[#111827]">Accessibility</a></li>
            <li><a href="#faq" className="text-sm text-[#475569] hover:text-[#111827]">FAQ</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-[#111827] mb-4">Company</h4>
          <ul className="space-y-3">
            <li><Link to="/about" className="text-sm text-[#475569] hover:text-[#111827]">About Us</Link></li>
            <li><a href="#contact" className="text-sm text-[#475569] hover:text-[#111827]">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-[#E5E7EB] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[#475569] text-sm">© {new Date().getFullYear()} SkillAble. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="text-[#475569] text-sm hover:text-[#111827]">Privacy</Link>
          <Link to="/terms" className="text-[#475569] text-sm hover:text-[#111827]">Terms</Link>
        </div>
      </div>
    </footer>
  )
}

// -----------------------------------------------------------------------------
// Landing Page Main Component
// -----------------------------------------------------------------------------
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111827] font-sans selection:bg-[#3B82F6] selection:text-white" style={{ fontFamily: '"Inter", sans-serif' }}>
      <LandingNavbar />

      <main className="pt-32 pb-16 overflow-hidden">
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 sm:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-block px-3 py-1 bg-white border border-[#E5E7EB] rounded-full text-xs font-semibold text-[#475569] tracking-wide uppercase">
              Accessible Learning & Careers
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight">
              Empowering <span className="text-[#3B82F6]">Abilities</span> Into Opportunities.
            </h1>
            
            <p className="text-lg md:text-xl text-[#475569] max-w-lg leading-relaxed">
              SkillAble helps differently abled individuals discover skills, learn at their own pace, connect with mentors and unlock meaningful employment opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/signup">
                <button className="w-full sm:w-auto bg-[#1E293B] text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-[#111827] transition-colors flex items-center justify-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <button className="w-full sm:w-auto bg-white border border-[#E5E7EB] text-[#111827] px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-[#111827] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-[#111827] rounded-sm translate-x-[1px]" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }} />
                </div>
                Watch Demo
              </button>
            </div>
            
            <div className="pt-8 max-w-sm">
              <div className="flex gap-1 text-[#111827] mb-3">
                {[1,2,3,4,5].map(i => <StarIcon key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-sm text-[#475569] font-medium leading-relaxed">
                Trusted by students, educators, NGOs and organizations.
              </p>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end min-h-[500px]">
            {/* The main portrait in a soft arch shape */}
            <div className="relative z-10 w-[340px] md:w-[400px] h-[480px] md:h-[560px] bg-[#DBEAFE] overflow-hidden shadow-sm border border-[#E5E7EB]" style={{ borderRadius: '200px 200px 40px 40px' }}>
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                alt="Confident professional smiling"
                className="w-full h-full object-cover mix-blend-multiply opacity-90"
              />
            </div>
            
            {/* Floating Callouts - Left side */}
            <div className="absolute top-[20%] -left-4 md:-left-12 z-20 bg-white border border-[#E5E7EB] rounded-2xl p-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-full bg-[#FAFAF8] flex items-center justify-center border border-[#E5E7EB]">
                <BookOpen className="w-4 h-4 text-[#475569]" />
              </div>
              <span className="text-sm font-medium text-[#111827]">Skill Matching</span>
            </div>
            
            <div className="absolute bottom-[25%] -left-8 md:left-4 z-20 bg-white border border-[#E5E7EB] rounded-2xl p-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-full bg-[#FAFAF8] flex items-center justify-center border border-[#E5E7EB]">
                <Target className="w-4 h-4 text-[#475569]" />
              </div>
              <span className="text-sm font-medium text-[#111827]">Mentor Guidance</span>
            </div>

            {/* Floating Callouts - Right side */}
            <div className="absolute top-[35%] -right-4 md:-right-8 z-20 bg-white border border-[#E5E7EB] rounded-2xl p-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-full bg-[#FAFAF8] flex items-center justify-center border border-[#E5E7EB]">
                <Briefcase className="w-4 h-4 text-[#475569]" />
              </div>
              <span className="text-sm font-medium text-[#111827]">Job Recommendations</span>
            </div>
            
            <div className="absolute bottom-[10%] -right-2 md:right-12 z-20 bg-white border border-[#E5E7EB] rounded-2xl p-3 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <div className="w-8 h-8 rounded-full bg-[#FAFAF8] flex items-center justify-center border border-[#E5E7EB]">
                <TrendingUp className="w-4 h-4 text-[#475569]" />
              </div>
              <span className="text-sm font-medium text-[#111827]">Progress Tracking</span>
            </div>
            
            {/* Elegant curved connecting lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none hidden md:block">
              {/* Connect Skill Matching to Image */}
              <path d="M 0 150 Q 80 150 150 220" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Connect Mentor Guidance to Image */}
              <path d="M 50 380 Q 120 380 180 320" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Connect Job Recommendations to Image */}
              <path d="M 450 250 Q 380 250 320 200" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* Connect Progress Tracking to Image */}
              <path d="M 400 450 Q 350 450 280 400" fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
          </div>
        </section>

        {/* TRUST SECTION */}
        <section className="max-w-7xl mx-auto px-6 sm:px-12 mt-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { val: '50K+', label: 'Learners empowered' },
              { val: '10K+', label: 'Job opportunities' },
              { val: '5K+', label: 'Mentors' },
              { val: '95%', label: 'User satisfaction' },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-[24px] p-8 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="text-3xl md:text-4xl font-bold text-[#111827] mb-2 tracking-tight">{stat.val}</div>
                <div className="text-sm font-medium text-[#475569]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 sm:px-12 mt-40">
          <div className="mb-16 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight mb-4">How It Works</h2>
            <p className="text-lg text-[#475569] leading-relaxed">Four simple steps towards unlocking your full potential in an inclusive environment.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full">
              <div className="w-12 h-12 bg-[#FAFAF8] rounded-2xl flex items-center justify-center border border-[#E5E7EB] mb-8">
                <Search className="w-5 h-5 text-[#111827]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Discover Your Strengths</h3>
              <p className="text-[#475569] text-sm leading-relaxed">Personalized assessments identify interests and abilities.</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full">
              <div className="w-12 h-12 bg-[#FAFAF8] rounded-2xl flex items-center justify-center border border-[#E5E7EB] mb-8">
                <BookOpen className="w-5 h-5 text-[#111827]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Learn At Your Pace</h3>
              <p className="text-[#475569] text-sm leading-relaxed">Accessible courses designed for everyone.</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full">
              <div className="w-12 h-12 bg-[#FAFAF8] rounded-2xl flex items-center justify-center border border-[#E5E7EB] mb-8">
                <UserCheck className="w-5 h-5 text-[#111827]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Connect With Mentors</h3>
              <p className="text-[#475569] text-sm leading-relaxed">Industry experts and supportive communities.</p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[28px] p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col h-full">
              <div className="w-12 h-12 bg-[#FAFAF8] rounded-2xl flex items-center justify-center border border-[#E5E7EB] mb-8">
                <Briefcase className="w-5 h-5 text-[#111827]" />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-3">Get Opportunities</h3>
              <p className="text-[#475569] text-sm leading-relaxed">Find jobs, internships, and projects.</p>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="max-w-7xl mx-auto px-6 sm:px-12 mt-40 space-y-32">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-white border border-[#E5E7EB] rounded-[32px] p-8 aspect-square flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="relative w-full h-full bg-[#FAFAF8] rounded-[20px] overflow-hidden border border-[#E5E7EB] flex items-center justify-center">
                 <div className="absolute inset-x-8 top-12 h-14 bg-white rounded-xl border border-[#E5E7EB] shadow-sm flex items-center px-4 gap-4">
                   <div className="w-8 h-8 bg-[#F8FAFC] rounded-full border border-[#E5E7EB] flex items-center justify-center">
                     <Target className="w-4 h-4 text-[#475569]"/>
                   </div>
                   <div className="flex-1 h-3 bg-[#E5E7EB] rounded-full" />
                 </div>
                 <div className="absolute inset-x-8 top-32 h-32 bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 space-y-4">
                   <div className="w-3/4 h-3 bg-[#E5E7EB] rounded-full" />
                   <div className="w-1/2 h-3 bg-[#E5E7EB] rounded-full" />
                   <div className="w-full h-3 bg-[#E5E7EB] rounded-full mt-6" />
                 </div>
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">AI-assisted Skill Matching</h3>
              <p className="text-lg text-[#475569] leading-relaxed">
                Our personalized recommendations align your unique abilities with the right courses and career paths, completely redefining the discovery process.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">Fully Accessible Learning</h3>
              <p className="text-lg text-[#475569] leading-relaxed">
                Built from the ground up to be screen-reader friendly, fully keyboard navigable, and perfectly optimized for high contrast and adjustable text sizes.
              </p>
            </div>
            <div className="bg-white border border-[#E5E7EB] rounded-[32px] p-8 aspect-square flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="relative w-full h-full bg-[#FAFAF8] rounded-[20px] overflow-hidden border border-[#E5E7EB] flex flex-col items-center justify-center gap-6 p-8">
                 <div className="flex w-full justify-between items-center bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm">
                   <span className="text-[#111827] font-medium">Keyboard Navigation</span>
                   <div className="w-12 h-6 bg-[#16A34A] rounded-full flex items-center px-1 justify-end"><div className="w-4 h-4 bg-white rounded-full"/></div>
                 </div>
                 <div className="flex w-full justify-between items-center bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm">
                   <span className="text-[#111827] font-medium">Screen Reader</span>
                   <div className="w-12 h-6 bg-[#16A34A] rounded-full flex items-center px-1 justify-end"><div className="w-4 h-4 bg-white rounded-full"/></div>
                 </div>
                 <div className="flex w-full justify-between items-center bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm">
                   <span className="text-[#111827] font-medium">High Contrast</span>
                   <div className="w-12 h-6 bg-[#E5E7EB] rounded-full flex items-center px-1 justify-start"><div className="w-4 h-4 bg-white rounded-full"/></div>
                 </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-white border border-[#E5E7EB] rounded-[32px] p-8 aspect-square flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="w-full h-full bg-[#FAFAF8] rounded-[20px] border border-[#E5E7EB] p-8 grid grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-[#F8FAFC] rounded-full border border-[#E5E7EB]" />
                    <div className="w-16 h-2 bg-[#E5E7EB] rounded-full" />
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 md:order-2 space-y-6">
              <h3 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">Inclusive Job Board</h3>
              <p className="text-lg text-[#475569] leading-relaxed">
                Connect exclusively with employers who are deeply committed to diversity, equity, and providing the necessary accommodations for your success.
              </p>
            </div>
          </div>
        </section>

        {/* ACCESSIBILITY SECTION (Primary Focus) */}
        <section id="accessibility" className="max-w-7xl mx-auto px-6 sm:px-12 mt-40">
          <div className="bg-[#F8FAFC] rounded-[40px] p-12 lg:p-24 border border-[#E5E7EB]">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight mb-6">Accessibility First</h2>
              <p className="text-lg text-[#475569] leading-relaxed">This is the heart of SkillAble. We've built every interaction with inclusion in mind from day one.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Monitor, label: 'Screen Reader Support', desc: 'Semantic HTML and clear aria-labels.' },
                { icon: Keyboard, label: 'Keyboard Navigation', desc: 'Seamless tabbing and focus rings.' },
                { icon: Type, label: 'Adjustable Font Size', desc: 'Scale text without breaking layouts.' },
                { icon: Eye, label: 'High Contrast Mode', desc: 'WCAG AAA compliant visual modes.' },
                { icon: Captions, label: 'Captioned Videos', desc: 'Transcripts and closed captions.' },
                { icon: Palette, label: 'Colorblind-Friendly', desc: 'Distinct shapes and patterns.' },
              ].map((acc, i) => (
                <div key={i} className="bg-white rounded-[24px] p-8 border border-[#E5E7EB] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="w-12 h-12 rounded-xl bg-[#FAFAF8] border border-[#E5E7EB] flex items-center justify-center mb-6">
                    <acc.icon className="w-5 h-5 text-[#111827]" />
                  </div>
                  <h4 className="font-semibold text-[#111827] mb-2">{acc.label}</h4>
                  <p className="text-sm text-[#475569]">{acc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUCCESS STORIES */}
        <section id="stories" className="max-w-7xl mx-auto px-6 sm:px-12 mt-40">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight mb-4">Success Stories</h2>
            <p className="text-lg text-[#475569]">Real impact on real careers.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Applied to five jobs, got two interviews, and secured a job quickly. The accessibility features made all the difference.",
                name: "Michael Chen",
                role: "Product Designer",
                company: "Tech Solutions",
                img: "https://i.pravatar.cc/150?u=michael"
              },
              {
                quote: "The screen reader compatibility is flawless. Navigating and applying to jobs has never been this seamless for me.",
                name: "Sarah Jenkins",
                role: "Data Analyst",
                company: "DataCorp",
                img: "https://i.pravatar.cc/150?u=sarah"
              },
              {
                quote: "SkillAble didn't just find me a job; it gave me the independence to excel in interviews using the live sign language to text feature.",
                name: "Priya Nair",
                role: "Software Engineer",
                company: "Innovate Inc",
                img: "https://i.pravatar.cc/150?u=priya"
              }
            ].map((story, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-[28px] p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="flex gap-1 text-[#111827] mb-8">
                  {[1,2,3,4,5].map(star => <StarIcon key={star} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-[#111827] font-medium leading-relaxed text-lg mb-12 flex-1">
                  "{story.quote}"
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-[#E5E7EB]">
                  <img src={story.img} alt={story.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-[#111827]">{story.name}</div>
                    <div className="text-sm text-[#475569]">{story.role} at {story.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="max-w-3xl mx-auto px-6 sm:px-12 mt-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Is SkillAble completely free for job seekers?", a: "Yes, SkillAble is 100% free for differently abled individuals seeking courses, mentorship, and employment." },
              { q: "How do I request specific accommodations for an interview?", a: "Your profile contains an accessibility preferences section that is securely shared with employers when you schedule an interview." },
              { q: "Are all employers on the platform vetted?", a: "Absolutely. We verify every employer's commitment to diversity and inclusive workplace practices before they can post jobs." },
              { q: "Can I use my own screen reader?", a: "Yes, our platform is built with strict semantic HTML to perfectly support native screen readers like NVDA, JAWS, and VoiceOver." },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-[#E5E7EB] rounded-[20px] [&_summary::-webkit-details-marker]:hidden shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-medium text-[#111827]">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-[#475569] transition duration-300 group-open:-rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-[#475569] leading-relaxed border-t border-[#E5E7EB] pt-4 mt-2 hidden group-open:block">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="max-w-7xl mx-auto px-6 sm:px-12 mt-40">
          <div className="bg-[#1E293B] rounded-[40px] p-12 lg:p-24 text-center border border-[#E5E7EB]">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-8">
              Ready to unlock your potential?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup">
                <button className="w-full sm:w-auto bg-white text-[#111827] px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-100 transition-colors">
                  Join SkillAble
                </button>
              </Link>
              <button className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-white/10 transition-colors">
                Book a Demo
              </button>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </div>
  )
}

function StarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}
