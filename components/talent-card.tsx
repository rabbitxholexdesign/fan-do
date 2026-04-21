"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { FanTemperatureMeter, FanTemperatureBadge } from "@/components/fan-temperature-meter"

export interface TalentData {
  id: string
  name: string
  tagline: string
  category: string
  location: string
  imageUrl: string
  fanCount: number
  temperature: number
  tags?: string[]
  isNew?: boolean
}

interface TalentCardProps {
  talent: TalentData
  variant?: "default" | "featured" | "compact"
  className?: string
}

export function TalentCard({ talent, variant = "default", className }: TalentCardProps) {
  if (variant === "featured") {
    return (
      <Link href={`/talents/${talent.id}`} className="block group">
        <div className={cn(
          "overflow-hidden rounded-2xl bg-white border border-slate-100",
          "shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60",
          "transition-all duration-300 hover:-translate-y-1",
          className
        )}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-slate-100">
              {talent.imageUrl ? (
                <img
                  src={talent.imageUrl}
                  alt={talent.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">🌿</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex gap-2">
                {talent.isNew && (
                  <span className="bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full">NEW</span>
                )}
                <span className="bg-white/85 backdrop-blur-sm text-slate-700 text-xs font-medium px-3 py-1 rounded-full">
                  {talent.category}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-sky-600 transition-colors">
                    {talent.name}
                  </h3>
                  <p className="text-slate-500 flex items-center gap-1.5 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {talent.location}
                  </p>
                </div>
                <FanTemperatureMeter temperature={talent.temperature} size="md" animate={true} />
              </div>

              <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                {talent.tagline}
              </p>

              {talent.tags && talent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {talent.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">{talent.fanCount.toLocaleString()}</span> ファン
                </span>
                <span className="text-sm font-medium text-sky-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  詳細を見る
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "compact") {
    return (
      <Link href={`/talents/${talent.id}`} className="block group">
        <div className={cn(
          "flex gap-4 p-4 rounded-xl bg-white border border-slate-100",
          "hover:bg-slate-50 hover:border-sky-200 hover:shadow-sm transition-all duration-200",
          className
        )}>
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
            {talent.imageUrl ? (
              <img src={talent.imageUrl} alt={talent.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
                  {talent.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">{talent.location}</p>
              </div>
              <FanTemperatureBadge temperature={talent.temperature} />
            </div>
            <p className="text-sm text-slate-500 mt-1 line-clamp-1">
              {talent.tagline}
            </p>
          </div>
        </div>
      </Link>
    )
  }

  // Default variant
  return (
    <Link href={`/talents/${talent.id}`} className="block group">
      <div className={cn(
        "overflow-hidden rounded-2xl bg-white border border-slate-100",
        "shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60",
        "transition-all duration-300 hover:-translate-y-1",
        className
      )}>
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {talent.imageUrl ? (
            <img
              src={talent.imageUrl}
              alt={talent.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🌿</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {talent.isNew && (
              <span className="bg-sky-500 text-white text-xs font-semibold px-3 py-1 rounded-full">NEW</span>
            )}
          </div>

          {/* Temperature Meter */}
          <div className="absolute bottom-3 right-3">
            <FanTemperatureMeter
              temperature={talent.temperature}
              size="sm"
              animate={false}
              className="bg-white/85 backdrop-blur-sm rounded-full p-1"
            />
          </div>

          {/* Category */}
          <div className="absolute bottom-3 left-3">
            <span className="bg-white/85 backdrop-blur-sm text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {talent.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-2">
            <h3 className="font-semibold text-lg text-slate-800 group-hover:text-sky-600 transition-colors line-clamp-1">
              {talent.name}
            </h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {talent.location}
            </p>
          </div>

          <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {talent.tagline}
          </p>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">
              <span className="font-semibold text-slate-700">{talent.fanCount.toLocaleString()}</span> ファン
            </span>
            <span className="text-sky-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
              詳細 →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Grid container for talent cards
interface TalentGridProps {
  children: React.ReactNode
  className?: string
}

export function TalentGrid({ children, className }: TalentGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}>
      {children}
    </div>
  )
}
