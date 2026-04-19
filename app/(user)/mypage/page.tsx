"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { Heart, Bell, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  display_name: string | null
  avatar_url: string | null
  prefecture: string | null
  fanc_score: number
  created_at: string
}

interface Subscription {
  id: string
  current_period_end: string
  talent: {
    id: string
    name: string
    avatar_url: string | null
  }
  plan: {
    name: string
    price: number
    billing_cycle: string
  }
}

interface FancHistory {
  id: string
  description: string | null
  points: number
  created_at: string
}

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [fancHistory, setFancHistory] = useState<FancHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const [profileRes, subsRes, historyRes] = await Promise.all([
        supabase
          .from("users")
          .select("display_name, avatar_url, prefecture, fanc_score, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("subscriptions")
          .select(`
            id, current_period_end,
            talent:talent_id ( id, name, avatar_url ),
            plan:plan_id ( name, price, billing_cycle )
          `)
          .eq("fan_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase
          .from("fanc_history")
          .select("id, description, points, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(3),
      ])

      if (profileRes.data) setProfile(profileRes.data as UserProfile)
      if (subsRes.data) setSubscriptions(subsRes.data as unknown as Subscription[])
      if (historyRes.data) setFancHistory(historyRes.data as FancHistory[])
      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div className="text-center py-20 text-muted-foreground">読み込み中...</div>
  }

  const displayName = profile?.display_name ?? "ユーザー"
  const since = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
    : ""
  const temperature = Math.min(100, profile?.fanc_score ?? 0)

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile?.avatar_url ?? ""} alt={displayName} />
          <AvatarFallback className="text-2xl">{displayName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          {profile?.prefecture && (
            <p className="text-muted-foreground text-sm mt-1">{profile.prefecture}</p>
          )}
          {since && (
            <p className="text-muted-foreground text-sm">{since}から応援中</p>
          )}
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/mypage/profile">プロフィール編集</Link>
        </Button>
      </div>

      {/* Fan Temperature */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <FanTemperatureMeter temperature={temperature} size="xl" animate />
              <p className="text-muted-foreground text-sm">総合 fan℃ スコア</p>
            </div>
            <div className="flex-1 w-full">
              <p className="text-muted-foreground text-sm font-medium mb-3">fan℃スコア: {profile?.fanc_score ?? 0} pt</p>
              {fancHistory.length > 0 ? (
                <div className="space-y-2">
                  {fancHistory.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-foreground">
                        {item.points > 0 ? "+" : ""}{item.points}℃ {item.description}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(item.created_at).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">まだ履歴がありません</p>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-muted-foreground hover:text-foreground p-0 h-auto"
                asChild
              >
                <Link href="/mypage/fanc-history">すべての履歴を見る →</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supporting Talents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            応援中のタレント
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/mypage/subscriptions">
              すべて管理 <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>

        {subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {sub.talent?.avatar_url ? (
                        <img
                          src={sub.talent.avatar_url}
                          alt={sub.talent?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🌿</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{sub.talent?.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {sub.plan?.name} ¥{sub.plan?.price.toLocaleString()}/
                        {sub.plan?.billing_cycle === "monthly" ? "月" : "年"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        次回請求: {new Date(sub.current_period_end).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/community/${sub.talent?.id}`}>サロンへ</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>まだ応援中のタレントがいません</p>
            <Button className="mt-4" asChild>
              <Link href="/talents">タレントを探す</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/mypage/billing", icon: "💳", label: "支払い履歴" },
          { href: "/mypage/fanc-history", icon: "🌡️", label: "fan℃履歴" },
          { href: "/mypage/favorites", icon: "⭐", label: "お気に入り" },
          { href: "/mypage/profile", icon: "👤", label: "プロフィール" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/30 transition-all text-center"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
