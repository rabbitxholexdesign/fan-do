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
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sky-50 text-sky-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-sky-500" : "text-slate-400")} />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />
                )}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 pb-3 border-t border-slate-100 mt-1 pt-3">
          <LogoutButton className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full">
            <LogOut className="h-4 w-4 shrink-0" />
            ログアウト
          </LogoutButton>
        </div>
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
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
                isActive
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-sky-200 hover:text-sky-600"
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
