"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  User,
  Heart,
  CreditCard,
  Bell,
  Settings,
  MessageCircle,
  Trophy,
  History,
  LogOut
} from "lucide-react"
import { LogoutButton } from "@/components/logout-button"

const menuItems = [
  {
    label: "ホーム",
    href: "/mypage",
    icon: User,
  },
  {
    label: "支援中プラン",
    href: "/mypage/subscriptions",
    icon: Heart,
  },
  {
    label: "fan℃履歴",
    href: "/mypage/fanc-history",
    icon: History,
  },
  {
    label: "お気に入り",
    href: "/mypage/favorites",
    icon: Trophy,
  },
  {
    label: "通知",
    href: "/mypage/notifications",
    icon: Bell,
  },
  {
    label: "支払い履歴",
    href: "/mypage/billing",
    icon: CreditCard,
  },
  {
    label: "プロフィール",
    href: "/mypage/profile",
    icon: MessageCircle,
  },
  {
    label: "アカウント設定",
    href: "/mypage/settings",
    icon: Settings,
  },
]

export function UserSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <nav className="sticky top-24 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="sticky top-auto mt-4 pt-4 border-t">
        <LogoutButton className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full">
          <LogOut className="h-5 w-5" />
          ログアウト
        </LogoutButton>
      </div>
    </aside>
  )
}

export function UserMobileNav() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden overflow-x-auto pb-4 -mx-4 px-4">
      <div className="flex gap-2 min-w-max">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
