import Link from "next/link"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/">
            <Logo size="lg" className="text-background" />
          </Link>
          
          <div className="max-w-md">
            <blockquote className="text-2xl font-medium leading-relaxed mb-6">
              &ldquo;地域の魅力を発信し続けて3年。fan℃のおかげで、全国にファンができました。&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center">
                <span className="text-lg font-medium">佐</span>
              </div>
              <div>
                <p className="font-medium">佐藤 太郎</p>
                <p className="text-sm text-background/70">みちのく農園 / 山形県</p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-background/50">
            &copy; {new Date().getFullYear()} fan℃ All rights reserved.
          </p>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-border">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>
        
        <div className={cn(
          "flex-1 flex items-center justify-center p-6 md:p-12",
          className
        )}>
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
