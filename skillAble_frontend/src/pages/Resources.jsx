import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, HandMetal, PlayCircle, BookOpen, Monitor } from 'lucide-react'
import { Badge } from '../components/common/Badge'
import { SkeletonCard } from '../components/common/SkeletonCard'

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [filters, setFilters] = useState({
    forBlind: false,
    forDeaf: false,
    hasSignLanguage: false
  })
  
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)

  const categories = ['All', 'Articles', 'Videos', 'Webinars', 'Guides', 'Checklists']

  useEffect(() => {
    // Simulate Fetch
    setTimeout(() => {
      setResources([
        {
          id: 1,
          type: 'Guides',
          title: 'Navigating Technical Interviews with Screen Readers',
          desc: 'A comprehensive guide to managing code editors, browser environments, and communication platforms simultaneously.',
          hasScreenReaderOptimized: true,
          hasSignLanguage: false,
          color: 'bg-blue-100 text-blue-800',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 2,
          type: 'Videos',
          title: 'Mastering the SkillAble Interview Room',
          desc: 'Learn how to enable the sign-to-text live translation right inside our native interview rooms.',
          hasScreenReaderOptimized: true,
          hasSignLanguage: true,
          color: 'bg-purple-100 text-purple-800',
          image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 3,
          type: 'Articles',
          title: 'Advocating for Accommodations on Day One',
          desc: 'How to communicate your needs clearly to HR and your new manager to ensure you start your role successfully.',
          hasScreenReaderOptimized: true,
          hasSignLanguage: false,
          color: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'
        },
        {
          id: 4,
          type: 'Webinars',
          title: 'The Future of Inclusive Tech Architectures',
          desc: 'A recorded webinar discussing how companies are transitioning to fully accessible ecosystems.',
          hasScreenReaderOptimized: true,
          hasSignLanguage: true,
          color: 'bg-amber-100 text-amber-800',
          image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const filteredResources = resources.filter(res => {
    if (activeCategory !== 'All' && res.type !== activeCategory) return false
    if (filters.forBlind && !res.hasScreenReaderOptimized) return false
    // Since we don't have a rigid 'forDeaf' flag, we assume video/webinars w/ sign language apply to Deaf specific 
    // or everything applies since they are text and text is deaf-accessible natively.
    if (filters.hasSignLanguage && !res.hasSignLanguage) return false
    return true
  })

  return (
    <div className="bg-[#FAF8F4] min-h-screen">
      
      {/* Hero */}
      <section className="bg-[var(--color-primary)] py-20 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none" />
        <div className="relative max-w-4xl mx-auto space-y-6 z-10">
          <Badge variant="ghost" className="bg-white/10 text-white border border-white/20 px-4 py-1.5 backdrop-blur-sm">
            Knowledge Base
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white">Empower Your Career Journey</h1>
          <p className="text-xl font-sans text-teal-50 max-w-2xl mx-auto leading-relaxed">
            Curated resources, guides, and tutorials designed explicitly for professionals with disabilities.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 py-12 space-y-12 relative -top-8 bg-white rounded-3xl shadow-sm border border-[var(--color-border)] z-20">
        
        {/* Filters Top */}
        <div className="flex flex-col xl:flex-row justify-between gap-8 pb-8 border-b border-[var(--color-border)]">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full font-sans font-medium transition-colors focus-ring ${
                  activeCategory === cat 
                    ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Accessibility Filters */}
          <div className="flex flex-wrap gap-4 items-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
            <span className="font-sans font-bold text-gray-700 px-3 text-sm hidden sm:block">Specialized format:</span>
            
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-primary)] group">
              <input 
                type="checkbox" 
                checked={filters.forBlind} 
                onChange={(e) => setFilters({...filters, forBlind: e.target.checked})} 
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
              />
              <span className="text-sm font-sans font-medium text-gray-700 group-hover:text-[var(--color-primary)] flex items-center gap-1.5">
                <Monitor className="w-4 h-4" /> Screen Reader Optimized
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[var(--color-primary)] transition-colors focus-within:ring-2 focus-within:ring-[var(--color-primary)] group">
              <input 
                type="checkbox" 
                checked={filters.hasSignLanguage} 
                onChange={(e) => setFilters({...filters, hasSignLanguage: e.target.checked})} 
                className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" 
              />
              <span className="text-sm font-sans font-medium text-gray-700 group-hover:text-[var(--color-primary)] flex items-center gap-1.5">
                <HandMetal className="w-4 h-4" /> Sign Language Video
              </span>
            </label>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} className="h-96" />)
          ) : filteredResources.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 font-sans text-lg">
              No resources match your selected filters. Try broadening your criteria.
            </div>
          ) : (
            filteredResources.map((res, i) => (
              <motion.article 
                key={res.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white group rounded-[2rem] border border-[var(--color-border)] shadow-sm hover:shadow-lg hover:border-[var(--color-primary)] overflow-hidden transition-all flex flex-col h-full"
              >
                <div className="h-48 relative overflow-hidden bg-gray-100 shrink-0">
                   {res.image ? (
                     <img src={res.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full bg-gradient-to-tr from-teal-100 to-amber-100" />
                   )}
                   <Badge variant="ghost" className={`absolute top-4 left-4 ${res.color}`}>
                     {res.type}
                   </Badge>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-serif font-bold text-gray-900 leading-tight mb-3 group-hover:text-[var(--color-primary)] transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-gray-600 font-sans line-clamp-3 mb-6 flex-1">
                    {res.desc}
                  </p>
                  
                  <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
                     <div className="flex gap-2">
                       {res.hasScreenReaderOptimized && (
                         <div className="p-2 bg-teal-50 text-[var(--color-primary)] rounded-lg" title="Screen Reader Optimized" aria-label="Screen Reader Optimized">
                           <Monitor className="w-4 h-4" />
                         </div>
                       )}
                       {res.hasSignLanguage && (
                         <div className="p-2 bg-coral-50 text-coral-600 rounded-lg" title="Sign Language Included" aria-label="Sign Language Included">
                           <HandMetal className="w-4 h-4" />
                         </div>
                       )}
                     </div>
                     
                     <Link to={`/resources/${res.id}`} className="font-sans font-bold text-[var(--color-primary)] hover:underline focus-ring rounded-sm inline-flex items-center gap-2">
                       {res.type === 'Videos' || res.type === 'Webinars' ? (
                         <><PlayCircle className="w-4 h-4" /> Watch</>
                       ) : (
                         <><BookOpen className="w-4 h-4" /> Read More</>
                       )}
                     </Link>
                  </div>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </section>

    </div>
  )
}
