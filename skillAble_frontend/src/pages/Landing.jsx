import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SectionDivider } from '../components/common/SectionDivider'

// Minimalist icons
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="10 8 16 12 10 16 10 8"></polygon>
  </svg>
)

const AppleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 20.592c-2.316 0-4.632-1.34-5.83-1.34-1.22 0-3.355 1.306-5.264 1.306-2.528 0-4.85-1.464-6.14-3.714-2.613-4.526-.67-11.233 1.88-14.887 1.256-1.802 3.124-2.943 5.143-2.977 1.836-.034 3.565 1.235 4.698 1.235 1.133 0 3.14-1.503 5.316-1.27 2.274.244 4.34 1.127 5.516 2.853-4.708 2.894-3.957 9.537.747 11.455-1.126 2.766-3.214 5.34-5.32 5.34H12zM15.545 3.393c.96-1.16 1.606-2.775 1.43-4.393-1.396.056-3.076.93-4.07 2.057-.89.997-1.666 2.653-1.455 4.237 1.558.12 3.136-.738 4.095-1.902z" transform="translate(4, 0)" />
  </svg>
)

export default function Landing() {
  const [activeSection, setActiveSection] = useState('01 Overview')

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.id === 'overview') setActiveSection('01 Overview')
          if (entry.target.id === 'platform-focus') setActiveSection('02 Platform Focus')
          if (entry.target.id === 'mission') setActiveSection('03 Our Mission')
          if (entry.target.id === 'impact') setActiveSection('04 Impact')
          if (entry.target.id === 'connect') setActiveSection('05 Connect')
        }
      })
    }, { threshold: 0.3 })

    document.querySelectorAll('section, footer').forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <div 
      className="min-h-screen bg-[#FFFFFF] text-[#111827] selection:bg-[#4F7DFF] selection:text-white pb-32 overflow-x-hidden" 
      style={{ fontFamily: '"Inter", sans-serif' }}
    >
      
      {/* --------------------------------------------------------------------------
          HEADER (Editorial Minimalist with Scroll Spy)
          -------------------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 w-full z-50 py-5 px-6 lg:px-12 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-[#E5E7EB] transition-all duration-300">
        <div className="flex-1 hidden md:flex items-center gap-8">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#475569] font-bold transition-all duration-500">
            {activeSection}
          </span>
        </div>
        <div className="flex-1 flex justify-start md:justify-center">
          <Link to="/" style={{ color: '#111827', textDecoration: 'none' }} className="text-[28px] font-bold tracking-tight">
            <span style={{ fontFamily: 'var(--font-serif)' }}>SkillAble.</span>
          </Link>
        </div>
        <div className="flex-1 flex justify-end gap-6 items-center">
          <Link to="/login" style={{ color: '#111827', textDecoration: 'none' }} className="text-[11px] font-bold tracking-widest uppercase hover:opacity-50 transition-opacity hidden sm:block">
            Log In
          </Link>
          <Link to="/signup" style={{ background: '#111827', color: '#FFFFFF', textDecoration: 'none', border: 'none' }} className="px-6 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-transform hover:scale-105 hover:shadow-lg rounded-full">
            Get Started
          </Link>
        </div>
      </header>

      {/* --------------------------------------------------------------------------
          HERO SECTION (No entry animations, just static with hover)
          -------------------------------------------------------------------------- */}
      <section id="overview" className="relative h-[100dvh] min-h-[650px] w-full max-w-[1440px] mx-auto px-6 lg:px-12 pt-[100px] pb-12 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden bg-[#FAFAF8]">
        
        {/* Left Column */}
        <div className="w-full lg:w-[45%] z-10 flex flex-col justify-center h-full">
          <div className="flex items-center gap-4 mb-4 lg:mb-6">
            <div className="w-2 h-2 bg-[#111827]"></div>
            <div className="w-12 h-[1px] bg-[#111827]"></div>
            <span className="text-[#111827] font-bold text-[10px] uppercase tracking-widest">Accessible learning platform</span>
          </div>
          
          <h1 className="text-[48px] sm:text-[56px] lg:text-[72px] xl:text-[84px] leading-[1.05] tracking-tight text-[#111827] mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            Empowering<br />
            <span style={{ color: '#4F7DFF' }}>Abilities</span> Into<br />
            Opportunities.
          </h1>
          
          <p className="text-[16px] lg:text-[18px] text-[#475569] leading-[1.6] max-w-[480px] mb-10 font-light">
            SkillAble helps differently abled individuals discover skills, learn at their own pace, connect with mentors and unlock meaningful employment opportunities.
          </p>
          
          <div className="flex flex-wrap items-center gap-6 mt-2">
            <Link 
              to="/signup" 
              style={{ textDecoration: 'none', outline: 'none' }} 
              className="px-8 py-3.5 border border-[#111827] bg-transparent text-[#111827] hover:bg-[#111827] hover:text-white hover:shadow-lg hover:-translate-y-0.5 text-[12px] uppercase tracking-widest font-bold transition-all duration-300 whitespace-nowrap rounded-full"
            >
              Get Started
            </Link>
            <button 
              style={{ backgroundColor: 'transparent', color: '#111827', border: 'none', outline: 'none', textDecoration: 'none' }} 
              className="flex items-center gap-2 text-[12px] uppercase tracking-widest font-bold hover:text-[#4F7DFF] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer whitespace-nowrap group"
            >
              <PlayIcon />
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* Right Column (Arch & Floating Cards) */}
        <div className="w-full lg:w-[55%] relative h-[60vh] lg:h-[90%] flex items-end justify-center lg:justify-end pr-0 lg:pr-12">
          
          {/* Main Arch Shape */}
          <div className="relative w-[85%] max-w-[450px] h-[95%] bg-[#FAFAF8] z-0 overflow-hidden shadow-xl" style={{ borderRadius: '300px 300px 20px 20px' }}>
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
              alt="Professional portrait" 
              className="w-full h-[105%] object-cover object-top scale-[1.05] origin-top"
            />
          </div>

          {/* Floating Card 1: Bottom Left (Pushed out for breathing room) */}
          <div className="absolute bottom-[10%] -left-[5%] md:left-[5%] lg:left-[-10%] z-20 flex items-center group cursor-pointer">
            <div className="bg-white rounded-[24px] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 w-[200px] lg:w-[240px] relative z-10 border border-[#E5E7EB]">
              <h3 className="text-[13px] font-semibold text-[#111827] mb-1">Skill Matching</h3>
              <p className="text-[28px] font-bold text-[#111827] mb-1">98.5%</p>
              <p className="text-[11px] text-[#16A34A] font-medium mb-4">+12.5% Success</p>
              <svg width="100%" height="40" viewBox="0 0 100 40" className="overflow-visible">
                <path d="M0,30 L20,25 L40,35 L60,15 L80,20 L100,5" fill="none" stroke="#4F7DFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="60" cy="15" r="4" fill="#111827" className="group-hover:fill-[#4F7DFF] transition-colors duration-300" />
              </svg>
              <div className="flex justify-between mt-4 text-[10px] text-[#475569] font-medium">
                <span>1D</span><span>1W</span><span>1M</span><span>6M</span><span className="text-[#111827] font-bold">1Y</span>
              </div>
            </div>
            {/* Connection Line */}
            <svg className="w-20 h-10 -ml-4 pointer-events-none opacity-50 hidden lg:block" viewBox="0 0 80 40">
              <path d="M 0 20 Q 40 20 70 35" fill="none" stroke="#111827" strokeWidth="1.5" strokeDasharray="4 4" />
              <circle cx="70" cy="35" r="3" fill="#111827" />
            </svg>
          </div>

          {/* Floating Card 2: Top Right (Pushed right) */}
          <div className="absolute top-[20%] right-[-5%] lg:-right-[5%] z-20 flex items-center group cursor-pointer hover:-translate-y-1 transition-all duration-300">
            <svg className="w-16 h-4 mr-3 pointer-events-none overflow-visible opacity-50 hidden lg:block" viewBox="0 0 64 16">
              <circle cx="2" cy="8" r="3" fill="#111827" />
              <line x1="2" y1="8" x2="64" y2="8" stroke="#111827" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
            <div className="flex flex-col items-start">
              <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-white mb-2 ml-4 shadow-md group-hover:bg-[#4F7DFF] group-hover:shadow-lg transition-all duration-300">
                <AppleIcon />
              </div>
              <div className="bg-[#4F7DFF] rounded-full text-white px-6 py-3 shadow-md group-hover:shadow-[0_8px_20px_rgba(79,125,255,0.25)] text-[14px] font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-300">
                Job Recommendations
              </div>
            </div>
          </div>

          {/* Floating Card 3: Mentor Support */}
          <div className="absolute top-[65%] -right-[5%] lg:-right-[8%] z-20 flex items-center group cursor-pointer hover:-translate-y-1 transition-all duration-300">
            <svg className="w-12 h-4 mr-3 pointer-events-none overflow-visible opacity-50 hidden lg:block" viewBox="0 0 48 16">
              <circle cx="2" cy="8" r="3" fill="#111827" />
              <line x1="2" y1="8" x2="48" y2="8" stroke="#111827" strokeWidth="1.5" strokeDasharray="4 4" />
            </svg>
            <div className="bg-white rounded-full p-2 pr-6 flex items-center gap-4 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.1)] border border-[#E5E7EB] transition-all duration-300">
              <div className="flex items-center -space-x-3">
                <div className="w-12 h-12 rounded-full border-[3px] border-white overflow-hidden z-10 shadow-sm">
                  <img src="https://i.pravatar.cc/150?u=a1" alt="Mentor" className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 rounded-full border-[3px] border-white overflow-hidden z-0 bg-gray-100 shadow-sm">
                  <img src="https://i.pravatar.cc/150?u=a2" alt="Mentor" className="w-full h-full object-cover opacity-80" />
                </div>
              </div>
              <span className="text-[14px] font-bold text-[#111827]">Mentor Support</span>
            </div>
          </div>

        </div>
      </section>

      {/* --------------------------------------------------------------------------
          EDITORIAL SECTIONS
          -------------------------------------------------------------------------- */}
      <main className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-32 space-y-40">

        {/* FEATURES GRID SECTION */}
        <section id="platform-focus">
          <SectionDivider number="02" title="Platform Focus" />
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-20">
            <h2 className="lg:w-[60%] text-[40px] md:text-[56px] leading-[1.1] tracking-tight text-[#111827]" style={{ fontFamily: 'var(--font-serif)' }}>
              We provide Access,<br/>Learning, and Opportunity<br/>for everyone
            </h2>
            <div className="lg:w-[40%] flex flex-col justify-end">
              <p className="text-[16px] leading-[1.8] text-[#475569] font-light">
                Welcome to SkillAble, your inclusive platform designed to bridge the gap between talented differently-abled individuals and forward-thinking employers. From smart matching algorithms to fully accessible interview rooms, we ensure your career journey is completely barrier-free.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { title: "Accessible Interview Rooms", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80", desc: "Built-in voice navigation and sign-language support ensure you can present your best self in every single interview." },
              { title: "AI Resume Analysis", img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80", desc: "Our platform evaluates your profile and suggests targeted improvements to boost your match rate with inclusive employers." },
              { title: "Tailored Job Matching", img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80", desc: "Connect instantly with verified companies dedicated to diversity, with job recommendations perfectly aligned to your unique strengths." }
            ].map((item, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="w-full aspect-[4/3] overflow-hidden mb-8 bg-gray-100 rounded-xl shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="text-[20px] font-bold text-[#111827] mb-3 leading-snug group-hover:text-[#4F7DFF] transition-colors duration-300">{item.title}</h3>
                <p className="text-[14px] text-[#475569] leading-relaxed font-light mb-6">
                  {item.desc}
                </p>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#111827] border-b border-[#111827] pb-1 group-hover:border-[#4F7DFF] group-hover:text-[#4F7DFF] transition-colors duration-300">Explore Feature</span>
              </div>
            ))}
          </div>
        </section>

        {/* VALUES SECTION */}
        <section id="mission">
          <SectionDivider number="03" title="Our Mission" />
          
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            <div className="lg:w-[45%] flex flex-col items-start pt-12">
              <div className="w-[85%] aspect-[3/4] overflow-hidden mb-8 rounded-2xl shadow-lg group cursor-pointer">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80" alt="Empowerment" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="text-[22px] font-bold text-[#111827] mb-3">Empowerment</h3>
              <p className="text-[15px] text-[#475569] font-light max-w-[320px]">Dedicated to giving you the tools, mentors, and opportunities to take full control of your career path.</p>
            </div>

            <div className="lg:w-[55%] flex flex-col">
              <h2 className="text-[40px] md:text-[52px] leading-[1.1] tracking-tight text-[#111827] mb-8" style={{ fontFamily: 'var(--font-serif)' }}>
                Our Core: Accessibility,<br/>Inclusion, and Empowerment
              </h2>
              <p className="text-[16px] leading-[1.8] text-[#475569] font-light max-w-[500px] mb-24">
                SkillAble was built from the ground up to redefine the modern hiring process. We believe that true talent knows no physical boundaries, and our underlying architecture reflects that commitment in every feature we deploy.
              </p>

              <div className="flex gap-16 items-start">
                <div className="w-[45%] group cursor-pointer">
                  <div className="aspect-square overflow-hidden mb-6 rounded-2xl shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                    <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80" alt="Accessibility First" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#111827] mb-2">Accessibility First</h3>
                  <p className="text-[14px] text-[#475569] font-light">Deep integration with screen readers, voice controls, and keyboard navigation systems.</p>
                </div>

                <div className="w-[50%] mt-32 group cursor-pointer">
                  <h3 className="text-[18px] font-bold text-[#111827] mb-2">Inclusive Hiring</h3>
                  <p className="text-[14px] text-[#475569] font-light mb-6">We only partner with vetted employers who celebrate diversity and foster inclusive workplaces.</p>
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                    <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=80" alt="Inclusive Hiring" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RESTORED IMPACT SECTION */}
        <section id="impact">
          <SectionDivider number="04" title="Impact" />

          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
            
            {/* Left Image Column */}
            <div className="lg:w-[45%] group cursor-pointer">
              <h2 className="text-[40px] md:text-[52px] leading-[1.1] tracking-tight text-[#111827] mb-12" style={{ fontFamily: 'var(--font-serif)' }}>
                Redefining the Hiring<br/>Process, One<br/>Match at a Time
              </h2>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl shadow-md group-hover:shadow-xl transition-shadow duration-300">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" alt="Success" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {/* Dark Gradient Overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-10">
                  <span className="text-white text-[80px] font-bold leading-none mb-2 font-serif group-hover:-translate-y-1 transition-transform duration-300">100%</span>
                  <p className="text-white/80 text-[14px] font-light max-w-[200px]">Commitment to WCAG accessibility standards across all features.</p>
                </div>
              </div>
            </div>

            {/* Right List Column */}
            <div className="lg:w-[55%] flex flex-col pt-4">
              <p className="text-[16px] leading-[1.8] text-[#475569] font-light mb-16">
                We take pride in the positive impact we're building. Instead of focusing on vanity metrics, we focus entirely on the features that guarantee an inclusive experience for every user on our platform.
              </p>

              <div className="w-full">
                <div className="flex justify-between items-end border-b border-[#111827] pb-4 mb-2">
                  <h3 className="text-[20px] font-bold text-[#111827]">Platform Capabilities</h3>
                  <span className="text-[12px] font-bold uppercase tracking-widest text-[#111827]">Discover Tools</span>
                </div>
                
                {/* List Items */}
                {[
                  { stat: "Integrated Voice Navigation", detail: "For Blind Users" },
                  { stat: "Live Sign Language Support", detail: "In Interview Rooms" },
                  { stat: "AI Smart Resume Scoring", detail: "Algorithm Powered" },
                  { stat: "Verified Inclusive Partners", detail: "Employer Network" },
                  { stat: "High-Contrast UI Overrides", detail: "Accessibility Settings" }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-6 border-b border-[#E5E7EB] group cursor-pointer hover:bg-gray-50/50 transition-colors duration-300">
                    <span className="text-[18px] text-[#111827] font-medium group-hover:pl-4 group-hover:text-[#4F7DFF] transition-all duration-300">{item.stat}</span>
                    <div className="flex items-center gap-12 text-[#475569] text-[13px] font-light">
                      <span>{item.detail}</span>
                      <span className="uppercase tracking-widest text-[10px] font-bold hidden sm:block border-b border-[#475569] group-hover:border-[#4F7DFF] group-hover:text-[#4F7DFF] transition-colors duration-300">Learn More</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

      </main>

      {/* --------------------------------------------------------------------------
          EDITORIAL FOOTER
          -------------------------------------------------------------------------- */}
      <footer id="connect" className="max-w-[1280px] mx-auto px-6 lg:px-12 mt-40">
        <SectionDivider number="05" title="Connect" />
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-24">
          <h2 className="text-[40px] leading-[1.1] text-[#111827]" style={{ fontFamily: 'var(--font-serif)' }}>
            Start your career<br/>journey with us.
          </h2>
          <div className="flex gap-16">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#111827] mb-2">Social</span>
              <a href="#" style={{ color: '#475569', textDecoration: 'none' }} className="text-[14px] font-light hover:text-[#4F7DFF] hover:translate-x-1 transition-all duration-300">Instagram</a>
              <a href="#" style={{ color: '#475569', textDecoration: 'none' }} className="text-[14px] font-light hover:text-[#4F7DFF] hover:translate-x-1 transition-all duration-300">LinkedIn</a>
              <a href="#" style={{ color: '#475569', textDecoration: 'none' }} className="text-[14px] font-light hover:text-[#4F7DFF] hover:translate-x-1 transition-all duration-300">Twitter</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#111827] mb-2">Contact</span>
              <a href="#" style={{ color: '#475569', textDecoration: 'none' }} className="text-[14px] font-light hover:text-[#4F7DFF] transition-colors">hello@skillable.com</a>
              <a href="#" style={{ color: '#475569', textDecoration: 'none' }} className="text-[14px] font-light hover:text-[#4F7DFF] transition-colors">+1 (555) 000-0000</a>
            </div>
          </div>
        </div>
      </footer>
      
    </div>
  )
}
