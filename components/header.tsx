"use client"

import Link from "next/link"
import { LogoutButton } from "@/components/logout-button"
import { useState, useEffect } from "react"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
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
import { User, LayoutDashboard, LogOut, Shield } from "lucide-react"

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

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }
      const { data } = await supabase
        .from("users")
        .select("display_name, role")
        .eq("id", user.id)
        .single()
      if (data) {
        setUserInfo({
          displayName: data.display_name,
          role: data.role as UserInfo["role"],
        })
      }
      setIsLoading(false)
    }
    fetchUser()
  }, [])

  const navigation = [
    { name: "タレントを探す", href: "/talents" },
    { name: "fan℃とは", href: "/about" },
    { name: "使い方", href: "/how-to-use" },
  ]

  const initial = userInfo?.displayName?.[0] ?? "U"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        variant === "default" && "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border",
        variant === "transparent" && "bg-transparent",
        className
      )}
    >
      <div className="container mx-auto px-4">
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
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : userInfo ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline">
                      {userInfo.displayName ?? "ユーザー"}
                    </span>
                  </Button>
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
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">ログイン</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">新規登録</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="メニューを開く">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <div className="flex flex-col gap-6 mt-8">
                {userInfo && (
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{userInfo.displayName ?? "ユーザー"}</p>
                      <p className="text-xs text-muted-foreground">
                        {userInfo.role === "talent_owner" ? "タレント運営者"
                          : userInfo.role === "admin" ? "管理者"
                          : "ファン"}
                      </p>
                    </div>
                  </div>
                )}
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium text-foreground hover:text-accent transition-colors py-2"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="border-t border-border pt-6 flex flex-col gap-3">
                  {userInfo ? (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/mypage" onClick={() => setIsOpen(false)}>
                          マイページ
                        </Link>
                      </Button>
                      {(userInfo.role === "talent_owner" || userInfo.role === "admin") && (
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                            ダッシュボード
                          </Link>
                        </Button>
                      )}
                      <LogoutButton className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium text-destructive border-destructive/30 hover:bg-destructive/10 transition-colors">
                        <LogOut className="h-4 w-4" />
                        ログアウト
                      </LogoutButton>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          ログイン
                        </Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          新規登録
                        </Link>
                      </Button>
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
