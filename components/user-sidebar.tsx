"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import {
  Home,
  Heart,
  History,
  Star,
  Bell,
  CreditCard,
  User,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Search,
  Command,
  Headphones,
} from "lucide-react"
import { LogoutButton } from "@/components/logout-button"
import { createClient } from "@/lib/supabase/client"

const menuItems = [
  { icon: Home,       label: "ホーム",         href: "/mypage" },
  { icon: Heart,      label: "支援中プラン",    href: "/mypage/subscriptions", expandable: true },
  { icon: History,    label: "fan℃履歴",       href: "/mypage/fanc-history" },
  { icon: Star,       label: "お気に入り",      href: "/mypage/favorites",     expandable: true },
  { icon: Bell,       label: "通知",            href: "/mypage/notifications" },
  { icon: CreditCard, label: "支払い履歴",      href: "/mypage/billing",       expandable: true },
  { icon: User,       label: "プロフィール",    href: "/mypage/profile" },
  { icon: Settings,   label: "アカウント設定",  href: "/mypage/settings",      expandable: true },
]

interface UserInfo {
  displayName: string | null
  email: string | null
  activeSubCount: number
}

export function UserSidebar() {
  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, subsRes] = await Promise.all([
        supabase.from("users").select("display_name").eq("id", user.id).single(),
        supabase.from("subscriptions").select("id", { count: "exact" }).eq("fan_id", user.id).eq("status", "active"),
      ])

      setUserInfo({
        displayName: profileRes.data?.display_name ?? null,
        email: user.email ?? null,
        activeSubCount: subsRes.count ?? 0,
      })
    }
    fetchUser()
  }, [])

  const initial = userInfo?.displayName?.[0] ?? "U"

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-[280px] bg-white border-r border-[#E4E7EC] hidden lg:flex lg:flex-col z-40">
      {/* 検索バー */}
      <div className="p-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D0D5DD] rounded-lg text-[#667085] hover:border-[#98A2B3] transition-colors cursor-pointer">
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-sm">検索</span>
          <div className="flex items-center gap-0.5 text-xs bg-[#F2F4F7] px-1.5 py-0.5 rounded border border-[#E4E7EC]">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-4 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150",
                isActive
                  ? "bg-[#F9FAFB] text-[#101828] font-medium"
                  : "text-[#475467] hover:bg-[#F9FAFB] hover:text-[#101828]"
              )}
            >
              <item.icon className="w-5 h-5 text-[#667085] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.label === "支援中プラン" && userInfo && userInfo.activeSubCount > 0 && (
                <span className="bg-[#F2F4F7] text-[#344054] text-xs font-medium px-2 py-0.5 rounded-full border border-[#E4E7EC]">
                  {userInfo.activeSubCount}
                </span>
              )}
              {item.expandable && (
                <ChevronDown className="w-4 h-4 text-[#98A2B3]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* 下部セクション */}
      <div className="px-4 py-3 space-y-0.5 border-t border-[#E4E7EC]">
        <Link
          href="/mypage/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#475467] hover:bg-[#F9FAFB] hover:text-[#101828] transition-all duration-150"
        >
          <Settings className="w-5 h-5 text-[#667085]" />
          <span>設定</span>
        </Link>
        <a
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#475467] hover:bg-[#F9FAFB] hover:text-[#101828] transition-all duration-150"
        >
          <Headphones className="w-5 h-5 text-[#667085]" />
          <span>サポート</span>
          <span className="ml-auto flex items-center gap-1 text-xs text-[#027A48]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
            Online
          </span>
        </a>
        <LogoutButton className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-[#475467] hover:bg-[#F9FAFB] hover:text-[#101828] transition-all duration-150 w-full">
          <LogOut className="w-5 h-5 text-[#667085]" />
          <span>ログアウト</span>
        </LogoutButton>
      </div>

      {/* ユーザープロフィール */}
      <div className="p-4 border-t border-[#E4E7EC]">
        <Link href="/mypage/profile" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-sky-600 font-semibold text-sm shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#101828] truncate">{userInfo?.displayName ?? "ユーザー"}</p>
            <p className="text-xs text-[#475467] truncate">{userInfo?.email ?? ""}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#98A2B3] shrink-0" />
        </Link>
      </div>
    </aside>
  )
}

export function UserMobileNav() {
  const pathname = usePathname()

  return (
    <div className="lg:hidden overflow-x-auto pb-4 -mx-5 px-5 mb-4">
      <div className="flex gap-2 min-w-max">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 border",
                isActive
                  ? "bg-[#F9FAFB] text-[#101828] border-[#E4E7EC]"
                  : "bg-white text-[#475467] border-[#E4E7EC] hover:bg-[#F9FAFB] hover:text-[#101828]"
              )}
            >
              <item.icon className="h-4 w-4 text-[#667085]" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
