"use client"

import { cn } from "@/lib/utils"

interface FanTemperatureMeterProps {
  temperature: number // 0-100
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  showLabel?: boolean
  animate?: boolean
  className?: string
}

export function FanTemperatureMeter({
  temperature,
  size = "md",
  showLabel = true,
  animate = true,
  className,
}: FanTemperatureMeterProps) {
  // Clamp temperature between 0 and 100
  const clampedTemp = Math.max(0, Math.min(100, temperature))
  
  // Calculate the stroke dasharray for the progress
  const sizeMap = {
    xs: { container: 32, stroke: 3, radius: 12, text: "text-[10px]" },
    sm: { container: 48, stroke: 4, radius: 20, text: "text-xs" },
    md: { container: 80, stroke: 6, radius: 34, text: "text-sm" },
    lg: { container: 120, stroke: 8, radius: 52, text: "text-lg" },
    xl: { container: 160, stroke: 10, radius: 70, text: "text-2xl" },
  }
  
  const { container, stroke, radius, text } = sizeMap[size]
  const circumference = 2 * Math.PI * radius
  const progress = (clampedTemp / 100) * circumference
  const offset = circumference - progress
  
  // Get color based on temperature
  const getTemperatureColor = (temp: number) => {
    if (temp < 20) return "var(--temp-cold)"
    if (temp < 40) return "var(--temp-cool)"
    if (temp < 60) return "var(--temp-warm)"
    if (temp < 80) return "var(--temp-hot)"
    return "var(--temp-fire)"
  }
  
  const tempColor = getTemperatureColor(clampedTemp)
  
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        animate && "animate-breathe",
        className
      )}
      style={{ width: container, height: container }}
    >
      {/* Background circle */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={container}
        height={container}
        viewBox={`0 0 ${container} ${container}`}
      >
        <circle
          cx={container / 2}
          cy={container / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={container / 2}
          cy={container / 2}
          r={radius}
          fill="none"
          stroke={tempColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-700 ease-out",
            animate && "animate-glow-pulse"
          )}
          style={{
            filter: `drop-shadow(0 0 ${stroke}px ${tempColor})`,
          }}
        />
      </svg>
      
      {/* Center content */}
      {showLabel && (
        <div className="relative flex flex-col items-center justify-center">
          <span
            className={cn("font-bold tabular-nums", text)}
            style={{ color: tempColor }}
          >
            {clampedTemp}
          </span>
          <span className="text-muted-foreground" style={{ fontSize: size === "sm" ? "8px" : "10px" }}>
            fan℃
          </span>
        </div>
      )}
    </div>
  )
}

// Compact inline version
interface FanTemperatureBadgeProps {
  temperature: number
  className?: string
}

export function FanTemperatureBadge({ temperature, className }: FanTemperatureBadgeProps) {
  const clampedTemp = Math.max(0, Math.min(100, temperature))
  
  const getTemperatureColor = (temp: number) => {
    if (temp < 20) return "var(--temp-cold)"
    if (temp < 40) return "var(--temp-cool)"
    if (temp < 60) return "var(--temp-warm)"
    if (temp < 80) return "var(--temp-hot)"
    return "var(--temp-fire)"
  }
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        className
      )}
      style={{
        backgroundColor: `color-mix(in oklch, ${getTemperatureColor(clampedTemp)} 15%, transparent)`,
        color: getTemperatureColor(clampedTemp),
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: getTemperatureColor(clampedTemp) }} />
      {clampedTemp}℃
    </span>
  )
}
