import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Briefcase, Users, Star, ArrowRight, Ear, Eye, CheckCircle, HandMetal, Volume2 } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'

export default function Landing() {
  const stats = [
    { label: "Inclusive Jobs", value: "2,400+", icon: Briefcase },
    { label: "Verified Employers", value: "340+", icon: Star },
    { label: "PWD Professionals", value: "18,000+", icon: Users },
  ]

  const howItWorks = [
    { title: "Sign Up & Share Your Needs", desc: "Build a profile that highlights your skills and details your accessibility accommodations." },
    { title: "Match with Inclusive Employers", desc: "Our AI matches your profile with verified employers who prioritize an accessible workplace." },
    { title: "Interview & Get Hired", desc: "Interview confidently with built-in sign language and screen-reader support, then land the job." },
  ]

  const testimonials = [
    { name: "Priya Nair", role: "Software Engineer", disability: "Deaf Professional", quote: "SkillAble didn't just find me a job; it gave me the independence to excel in interviews using the live sign language to text feature. My employer knew exactly what I needed from day one." },
    { name: "Rahul Sharma", role: "Financial Analyst", disability: "Visually Impaired", quote: "The screen reader compatibility makes navigating jobs effortless. The voice commands allowed me to apply to 10 jobs without struggling with difficult forms." },
    { name: "Ananya Desai", role: "Graphic Designer", disability: "Hard of Hearing", quote: "I love the warm aesthetic! This platform feels completely geared toward my success rather than treating my disability as an afterthought." }
  ]

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--color-background)] px-6 sm:px-12 pt-20 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[600px] h-[600px] bg-amber-100 rounded-full blur-[120px] opacity-40 mix-blend-multiply pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100 rounded-full blur-[120px] opacity-50 mix-blend-multiply pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 space-y-8 text-center lg:text-left z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="success" className="mb-6 rounded-full px-4 py-1.5 text-sm gap-2">
                <CheckCircle className="w-4 h-4" />
                WCAG AA Compliant
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-serif text-[var(--color-foreground)] leading-[1.1]">
                Your skills define you. <br />
                <span className="text-[var(--color-primary)]">Not your disability.</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 font-sans max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Connect with inclusive employers who value your abilities. Find opportunities where you can thrive with dignity, independence, and the right accommodations.
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link to="/jobs">
                <Button size="lg" ariaLabel="Search for Jobs">Find Jobs</Button>
              </Link>
              <Link to="/signup/employer">
                <Button variant="outline" size="lg" ariaLabel="Post a Job">Post a Job</Button>
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex-1 w-full max-w-lg lg:max-w-none shadow-2xl rounded-2xl overflow-hidden glass-panel border-4 border-white z-10 hidden md:block"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Abstract visual representing an inclusive workspace */}
            <div className="bg-[#FAF8F4] w-full h-80 flex items-center justify-center p-8 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/10 to-[var(--color-accent)]/10" />
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-80 rounded-lg absolute inset-0"
                alt="A professional smiling while working at a modern desk."
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border-l-4 border-[var(--color-primary)] flex justify-between items-center text-left">
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-lg">Senior Developer</h3>
                  <p className="text-sm font-sans text-gray-500">TechCorp India</p>
                </div>
                <Badge variant="success">95% Match</Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-[var(--color-border)] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between divide-y-2 md:divide-y-0 md:divide-x-2 divide-[var(--color-border)]">
          {stats.map((stat, i) => (
            <div key={i} className="flex-1 px-8 py-6 md:py-0 text-center flex flex-col items-center">
              <div className="p-3 bg-teal-50 text-[var(--color-primary)] rounded-2xl mb-4">
                <stat.icon className="w-8 h-8" />
              </div>
              <p className="text-4xl font-serif font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-500 font-sans mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 sm:px-12 bg-[#FAF8F4]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[var(--color-foreground)]">How You Get Hired</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Three simple steps to connect with inclusive workplaces.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 z-0" />
            
            {howItWorks.map((step, i) => (
              <motion.div 
                key={i} 
                className="relative z-10 flex flex-col items-center text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="w-24 h-24 bg-white rounded-full shadow-lg border-4 border-[var(--color-background)] flex items-center justify-center text-3xl font-serif font-bold text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors duration-300">
                  {i + 1}
                </div>
                <h3 className="mt-8 text-2xl font-serif font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{step.title}</h3>
                <p className="mt-4 text-gray-600 font-sans leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Disability Support Cards */}
      <section className="py-24 px-6 sm:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-[var(--color-foreground)]">Built for Your Needs</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">Specialized tools to ensure an accessible job hunt.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-[#fcf0ec] rounded-[2rem] p-10 lg:p-14 border border-[var(--color-coral)]/30 shadow-sm hover:-translate-y-2 transition-transform duration-300"
              whileHover={{ y: -8 }}
            >
              <div className="bg-[var(--color-coral)] text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-md">
                <HandMetal className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">For Deaf & HoH Users</h3>
              <ul className="space-y-4 font-sans text-gray-700 text-lg">
                <li className="flex gap-3"><CheckCircle className="w-6 h-6 text-[var(--color-coral)] flex-shrink-0" /> Live Sign Language-to-Text translation during interviews.</li>
                <li className="flex gap-3"><CheckCircle className="w-6 h-6 text-[var(--color-coral)] flex-shrink-0" /> Visual alerts replacing all audio cues.</li>
                <li className="flex gap-3"><CheckCircle className="w-6 h-6 text-[var(--color-coral)] flex-shrink-0" /> 100% video captions.</li>
              </ul>
            </motion.div>

            <motion.div 
              className="bg-[#ebf5f3] rounded-[2rem] p-10 lg:p-14 border border-[var(--color-primary)]/20 shadow-sm hover:-translate-y-2 transition-transform duration-300"
              whileHover={{ y: -8 }}
            >
              <div className="bg-[var(--color-primary)] text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-md">
                <Volume2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">For Visually Impaired Users</h3>
              <ul className="space-y-4 font-sans text-gray-700 text-lg">
                <li className="flex gap-3"><CheckCircle className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0" /> Seamless Voice Navigation with "Hello Bandhu".</li>
                <li className="flex gap-3"><CheckCircle className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0" /> Strict semantic HTML and aria-labels for proper screen reader flow.</li>
                <li className="flex gap-3"><CheckCircle className="w-6 h-6 text-[var(--color-primary)] flex-shrink-0" /> High contrast modes built-in natively.</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 sm:px-12 bg-[#FAF8F4] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif text-center text-[var(--color-foreground)] mb-16">Stories of Empowerment</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <motion.div 
                key={i} 
                className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-[var(--color-primary)] relative"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="absolute top-8 right-8 text-gray-200">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="text-gray-700 font-sans italic relative z-10 leading-relaxed min-h-[100px]">"{test.quote}"</p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${test.name.replace(' ','')}`} alt={`Portrait of ${test.name}, ${test.disability}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 font-sans">{test.name}</h4>
                    <p className="text-sm text-gray-500 font-sans">{test.role}</p>
                    <Badge variant="ghost" className="px-0 py-0 text-xs mt-1 text-[var(--color-accent)]">{test.disability}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action Wrapper */}
      <section className="bg-[var(--color-primary)] text-white py-20 px-6 sm:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif">Ready to take the next step?</h2>
          <p className="text-xl font-sans text-teal-100">Join thousands of professionals breaking barriers in the workplace today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/signup/seeker">
              <Button size="lg" variant="accent" className="w-full sm:w-auto shadow-lg shadow-amber-500/30">Join as Job Seeker</Button>
            </Link>
            <Link to="/signup/employer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10">Become an Employer</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
