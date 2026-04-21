import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { UserSidebar, UserMobileNav } from "@/components/user-sidebar"

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
        <UserMobileNav />
        <div className="flex gap-8">
          <UserSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
