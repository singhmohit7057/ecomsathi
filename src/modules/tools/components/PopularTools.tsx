import { Zap } from 'lucide-react'
import FeaturedToolCard from './FeaturedToolCard'
import { POPULAR_TOOLS } from '../data/toolCategories'

export default function PopularTools() {
  return (
    <section className="bg-[#F8FAFC] py-14" aria-labelledby="popular-tools-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#EFF6FF]">
            <Zap size={17} className="text-[#2563EB]" />
          </div>
          <div>
            <h2 id="popular-tools-heading" className="text-xl font-bold text-[#0F172A] md:text-2xl">
              Popular Tools
            </h2>
            <p className="text-sm text-[#64748B]">Most used by ecommerce sellers</p>
          </div>
          <span className="ml-1 rounded-full bg-[#EFF6FF] px-3 py-0.5 text-xs font-bold text-[#2563EB]">
            {POPULAR_TOOLS.length} tools
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_TOOLS.map((tool) => (
            <FeaturedToolCard key={tool.path + tool.name} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  )
}
