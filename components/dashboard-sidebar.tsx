"use client"

import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  BarChart3,
  CreditCard,
  Settings,
  FileText,
  Megaphone,
  ChevronDown,
  Plus,
  LogOut,
  User
} from "lucide-react"

const menuItems = [
  { label: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard },
  { label: "サポーター", href: "/dashboard/supporters", icon: Users },
  { label: "サロン", href: "/dashboard/salon", icon: MessageCircle },
  { label: "プラン管理", href: "/dashboard/plans", icon: CreditCard },
  { label: "活動報告", href: "/dashboard/reports", icon: FileText },
  { label: "アナリティクス", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "収益・出金", href: "/dashboard/revenue", icon: BarChart3 },
  { label: "お知らせ配信", href: "/dashboard/announcements", icon: Megaphone },
  { label: "設定", href: "/dashboard/settings", icon: Settings },
]

interface Talent {
  id: string
  name: string
  status: string
}

interface UserInfo {
  displayName: string | null
  email: string
}

interface SidebarProps {
  talents: Talent[]
  userInfo: UserInfo | null
}

export function DashboardSidebar({ talents, userInfo }: SidebarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedId = searchParams.get("talentId")
  const currentTalent =
    talents.find((t) => t.id === selectedId) ??
    talents.find((t) => t.status === "active") ??
    talents[0] ??
    null

  function selectTalent(id: string) {
    router.push(`/dashboard?talentId=${id}`)
  }

  return (
    <aside className="fixed top-0 left-0 z-30 h-screen w-64 border-r bg-card flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link href="/">
          <Logo size="sm" />
        </Link>
      </div>

      {/* Talent Selector */}
      <div className="p-4 border-b">
        {currentTalent ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {currentTalent.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{currentTalent.name}</span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {talents.map((talent) => (
                <DropdownMenuItem
                  key={talent.id}
                  className="gap-2"
                  onSelect={() => selectTalent(talent.id)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className={`text-xs ${talent.id === currentTalent?.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      {talent.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{talent.name}</span>
                  {talent.id === currentTalent?.id && (
                    <span className="ml-auto text-xs text-muted-foreground">選択中</span>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/talents/new" className="gap-2 flex items-center">
                  <Plus className="h-4 w-4" />
                  新しいタレントを作成
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <Link href="/dashboard/talents/new">
              <Plus className="h-4 w-4" />
              タレントを作成
            </Link>
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {userInfo?.displayName?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{userInfo?.displayName ?? "ユーザー"}</p>
                <p className="text-xs text-muted-foreground truncate">{userInfo?.email ?? ""}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/mypage" className="gap-2 flex items-center">
                <User className="h-4 w-4" />
                マイページ
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="gap-2 flex items-center">
                <Settings className="h-4 w-4" />
                設定
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <LogoutButton className="w-full flex items-center gap-2 text-destructive cursor-pointer">
                <LogOut className="h-4 w-4" />
                ログアウト
              </LogoutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

export function DashboardMobileHeader({ talents }: Pick<SidebarProps, "talents">) {
  const currentTalent = talents.find((t) => t.status === "active") ?? talents[0] ?? null

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 border-b bg-card flex items-center px-4 gap-4">
      <Link href="/">
        <Logo size="sm" showText={false} />
      </Link>
      {currentTalent && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {currentTalent.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[120px] text-sm">{currentTalent.name}</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {talents.map((talent) => (
              <DropdownMenuItem key={talent.id} className="gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {talent.name[0]}
                  </AvatarFallback>
                </Avatar>
                {talent.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  )
}

export function DashboardMobileNav() {
  const pathname = usePathname()
  const visibleItems = menuItems.slice(0, 5)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-card">
      <div className="flex justify-around">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-3 text-xs",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label.slice(0, 4)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
