import { Header } from "@/components/header"
import { UserSidebar, UserMobileNav } from "@/components/user-sidebar"

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="flex pt-16">
        <UserSidebar />
        <main className="flex-1 lg:ml-[280px] p-5 lg:p-8 min-w-0">
          <UserMobileNav />
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
