import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface HeroSectionProps {
  title: string
  subtitle?: string
  description?: string
  primaryCTA?: { label: string; href: string }
  secondaryCTA?: { label: string; href: string }
  badge?: string
  stats?: Array<{ value: string; label: string }>
  variant?: 'default' | 'gradient' | 'dark'
}

export default function HeroSection({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  stats,
  variant = 'default',
}: HeroSectionProps) {
  const bgClass =
    variant === 'dark'
      ? 'bg-gray-900 text-white'
      : variant === 'gradient'
      ? 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white'
      : 'bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white'

  return (
    <section className={`relative overflow-hidden ${bgClass}`}>
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          {badge && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              {badge}
            </div>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-200">
              {subtitle}
            </p>
          )}

          {/* Title */}
          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              {primaryCTA && (
                <Link
                  to={primaryCTA.href}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all duration-200 hover:bg-blue-50 hover:shadow-xl"
                >
                  {primaryCTA.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              )}
              {secondaryCTA && (
                <Link
                  to={secondaryCTA.href}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/70 hover:bg-white/20"
                >
                  {secondaryCTA.label}
                </Link>
              )}
            </div>
          )}

          {/* Stats */}
          {stats && stats.length > 0 && (
            <div className="mt-16 grid grid-cols-2 gap-8 border-t border-white/20 pt-10 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-extrabold text-white sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-blue-200">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
