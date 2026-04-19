import Link from "next/link"
import { Logo } from "@/components/logo"

export default function TalentRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <p className="text-sm text-muted-foreground">
            タレント登録
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8 max-w-3xl">
        {children}
      </main>
    </div>
  )
}
