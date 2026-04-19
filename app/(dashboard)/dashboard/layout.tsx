import { DashboardSidebar, DashboardMobileHeader, DashboardMobileNav } from "@/components/dashboard-sidebar"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let talents: { id: string; name: string; status: string }[] = []
  let userInfo: { displayName: string | null; email: string } | null = null

  if (user) {
    const [{ data: talentData }, { data: userData }] = await Promise.all([
      supabase
        .from("talents")
        .select("id, name, status")
        .eq("operator_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("users")
        .select("display_name")
        .eq("id", user.id)
        .single(),
    ])

    if (talentData) talents = talentData
    if (userData) {
      userInfo = {
        displayName: userData.display_name,
        email: user.email ?? "",
      }
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar talents={talents} userInfo={userInfo} />
      </div>

      {/* Mobile Header */}
      <DashboardMobileHeader talents={talents} />

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <DashboardMobileNav />
    </div>
  )
}
