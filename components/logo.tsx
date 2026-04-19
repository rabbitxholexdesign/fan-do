import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
  showText?: boolean
}

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 48, text: "text-3xl" },
  }
  
  const { icon, text } = sizeMap[size]
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon - Temperature Ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: icon, height: icon }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="w-full h-full"
        >
          {/* Outer gradient ring */}
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--temp-warm)" />
              <stop offset="50%" stopColor="var(--temp-hot)" />
              <stop offset="100%" stopColor="var(--temp-fire)" />
            </linearGradient>
          </defs>
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="url(#tempGradient)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="70 18"
          />
          {/* Inner "f" mark */}
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fontSize="14"
            fontWeight="600"
            fill="currentColor"
            className="text-foreground"
          >
            f
          </text>
        </svg>
      </div>
      
      {showText && (
        <span className={cn("font-semibold tracking-tight", text)}>
          fan<span style={{ color: "var(--temp-hot)" }}>℃</span>
        </span>
      )}
    </div>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-8 h-8 flex items-center justify-center", className)}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="tempGradientMark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--temp-warm)" />
            <stop offset="50%" stopColor="var(--temp-hot)" />
            <stop offset="100%" stopColor="var(--temp-fire)" />
          </linearGradient>
        </defs>
        <circle
          cx="16"
          cy="16"
          r="14"
          stroke="url(#tempGradientMark)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="70 18"
        />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="currentColor"
          className="text-foreground"
        >
          f
        </text>
      </svg>
    </div>
  )
}
