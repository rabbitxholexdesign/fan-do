"use client"

import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LayoutDashboard, LogOut, Shield, Menu } from "lucide-react"

interface UserInfo {
  displayName: string | null
  role: "fan" | "talent_owner" | "admin"
}

interface HeaderProps {
  variant?: "default" | "transparent"
  className?: string
}

export function Header({ variant = "default", className }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }
      const { data } = await supabase
        .from("users")
        .select("display_name, role")
        .eq("id", user.id)
        .single()
      if (data) {
        setUserInfo({ displayName: data.display_name, role: data.role as UserInfo["role"] })
      }
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navigation = [
    { name: "タレントを探す", href: "/talents" },
    { name: "地域から探す", href: "/region" },
    { name: "fan℃とは", href: "/about" },
    { name: "使い方", href: "/how-to-use" },
  ]

  const initial = userInfo?.displayName?.[0] ?? "U"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        variant === "default" && scrolled
          ? "bg-white/95 backdrop-blur shadow-sm border-b border-slate-100"
          : variant === "default"
          ? "bg-white/80 backdrop-blur border-b border-transparent"
          : "bg-transparent",
        className
      )}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : userInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-sky-50 transition-colors">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-sky-100 text-sky-600 text-sm font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                      {userInfo.displayName ?? "ユーザー"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/mypage" className="gap-2 flex items-center">
                      <User className="h-4 w-4" />
                      マイページ
                    </Link>
                  </DropdownMenuItem>
                  {(userInfo.role === "talent_owner" || userInfo.role === "admin") && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="gap-2 flex items-center">
                        <LayoutDashboard className="h-4 w-4" />
                        ダッシュボード
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {userInfo.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="gap-2 flex items-center">
                        <Shield className="h-4 w-4" />
                        管理画面
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LogoutButton className="w-full flex items-center gap-2 text-destructive cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      ログアウト
                    </LogoutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-sky-600 transition-colors px-4 py-2"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  className="bg-sky-500 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-sky-600 transition-all duration-200 shadow-sm shadow-sky-500/20"
                >
                  新規登録
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="メニューを開く"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <div className="flex flex-col gap-6 mt-8">
                {userInfo && (
                  <div className="flex items-center gap-3 pb-5 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-sky-100 text-sky-600 font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{userInfo.displayName ?? "ユーザー"}</p>
                      <p className="text-xs text-slate-500">
                        {userInfo.role === "talent_owner" ? "タレント運営者"
                          : userInfo.role === "admin" ? "管理者"
                          : "ファン"}
                      </p>
                    </div>
                  </div>
                )}
                <nav className="flex flex-col gap-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-sky-50 transition-colors py-2.5 px-3 rounded-lg"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="border-t pt-5 flex flex-col gap-3">
                  {userInfo ? (
                    <>
                      <Link
                        href="/mypage"
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-full hover:bg-slate-50 transition-colors"
                      >
                        マイページ
                      </Link>
                      {(userInfo.role === "talent_owner" || userInfo.role === "admin") && (
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="w-full text-center border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-full hover:bg-slate-50 transition-colors"
                        >
                          ダッシュボード
                        </Link>
                      )}
                      <LogoutButton className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-full border border-red-200 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="h-4 w-4" />
                        ログアウト
                      </LogoutButton>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-full hover:bg-slate-50 transition-colors"
                      >
                        ログイン
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsOpen(false)}
                        className="w-full text-center bg-sky-500 text-white text-sm font-medium px-4 py-2.5 rounded-full hover:bg-sky-600 transition-colors"
                      >
                        新規登録
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
