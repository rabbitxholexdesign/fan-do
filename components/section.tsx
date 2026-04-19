import { cn } from "@/lib/utils"

interface SectionProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  id?: string
}

export function Section({ children, className, containerClassName, id }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-24", className)}>
      <div className={cn("container mx-auto px-4", containerClassName)}>
        {children}
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  title: string
  subtitle?: string
  align?: "left" | "center"
  className?: string
  action?: React.ReactNode
}

export function SectionHeader({ title, subtitle, align = "center", className, action }: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center",
        className
      )}
    >
      <div className={cn("flex items-center gap-4", align === "center" ? "justify-center" : "justify-between")}>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
          {title}
        </h2>
        {action && align !== "center" && action}
      </div>
      {subtitle && (
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl text-pretty mx-auto">
          {subtitle}
        </p>
      )}
      {action && align === "center" && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Hero section component
interface HeroSectionProps {
  children: React.ReactNode
  className?: string
  backgroundImage?: string
  overlay?: boolean
}

export function HeroSection({ children, className, backgroundImage, overlay = true }: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative min-h-[80vh] flex items-center justify-center overflow-hidden",
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
    >
      {overlay && backgroundImage && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      )}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {children}
      </div>
    </section>
  )
}

// Feature card for landing page
interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  className?: string
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn("p-6 rounded-xl bg-card border border-border", className)}>
      <div className="w-12 h-12 rounded-lg bg-fan-warm-100 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-fan-warm-500" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  )
}

// Stats display
interface StatItemProps {
  value: string | number
  label: string
  suffix?: string
}

export function StatItem({ value, label, suffix }: StatItemProps) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix && <span className="text-accent">{suffix}</span>}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

// StatCard component
interface StatCardProps {
  value: string | number
  label: string
  className?: string
}

export function StatCard({ value, label, className }: StatCardProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-3xl md:text-4xl font-bold temperature-gradient-text">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  )
}

interface StatsGridProps {
  children: React.ReactNode
  className?: string
}

export function StatsGrid({ children, className }: StatsGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-muted/50",
      className
    )}>
      {children}
    </div>
  )
}
