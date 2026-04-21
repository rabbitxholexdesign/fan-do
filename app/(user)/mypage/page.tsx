"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Bell, ChevronRight, CreditCard, Thermometer, Star, User } from "lucide-react"
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
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  const displayName = profile?.display_name ?? "ユーザー"
  const since = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
    : ""
  const temperature = Math.min(100, profile?.fanc_score ?? 0)

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-20 w-20 ring-4 ring-sky-100">
            <AvatarImage src={profile?.avatar_url ?? ""} alt={displayName} />
            <AvatarFallback className="text-2xl bg-sky-100 text-sky-600 font-bold">{displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">{displayName}</h1>
            {profile?.prefecture && (
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.prefecture}
              </p>
            )}
            {since && (
              <p className="text-slate-400 text-sm mt-0.5">{since}から応援中</p>
            )}
          </div>
          <Link
            href="/mypage/profile"
            className="shrink-0 border border-slate-200 text-slate-600 text-sm font-medium px-5 py-2 rounded-full hover:bg-slate-50 transition-colors"
          >
            プロフィール編集
          </Link>
        </div>
      </div>

      {/* Fan Temperature Card */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 shadow-lg shadow-slate-200/50 p-6">
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-4">あなたの fan℃</p>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <FanTemperatureMeter temperature={temperature} size="xl" animate />
            <p className="text-slate-500 text-sm">総合 fan℃ スコア</p>
          </div>
          <div className="flex-1 w-full">
            <p className="text-slate-600 text-sm font-semibold mb-3">
              <span className="text-2xl font-bold text-slate-800">{(profile?.fanc_score ?? 0).toLocaleString()}</span>
              <span className="text-slate-500 ml-1">pt</span>
            </p>
            {fancHistory.length > 0 ? (
              <div className="space-y-2">
                {fancHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700">
                      <span className="font-semibold text-sky-600">{item.points > 0 ? "+" : ""}{item.points}℃</span>
                      {item.description && <span className="ml-2 text-slate-500">{item.description}</span>}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">まだ履歴がありません</p>
            )}
            <Link
              href="/mypage/fanc-history"
              className="inline-flex items-center gap-1 mt-3 text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors"
            >
              すべての履歴を見る
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Supporting Talents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Heart className="h-5 w-5 text-sky-500" />
            応援中のタレント
          </h2>
          <Link
            href="/mypage/subscriptions"
            className="text-sm text-sky-500 hover:text-sky-600 font-medium flex items-center gap-1 transition-colors"
          >
            すべて管理
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {subscriptions.length > 0 ? (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-4 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
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
                    <p className="font-semibold text-slate-800 truncate">{sub.talent?.name}</p>
                    <p className="text-sm text-slate-500 truncate">
                      {sub.plan?.name} ¥{sub.plan?.price.toLocaleString()}/
                      {sub.plan?.billing_cycle === "monthly" ? "月" : "年"}
                    </p>
                    <p className="text-xs text-slate-400">
                      次回請求: {new Date(sub.current_period_end).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <Link
                    href={`/community/${sub.talent?.id}`}
                    className="shrink-0 bg-sky-500 text-white text-sm font-medium px-4 py-1.5 rounded-full hover:bg-sky-600 transition-colors"
                  >
                    サロンへ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 py-12 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-slate-200" />
            <p className="text-slate-500 mb-4">まだ応援中のタレントがいません</p>
            <Link
              href="/talents"
              className="bg-sky-500 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-sky-600 transition-colors inline-block"
            >
              タレントを探す
            </Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/mypage/billing", icon: CreditCard, label: "支払い履歴", color: "text-emerald-500 bg-emerald-50" },
          { href: "/mypage/fanc-history", icon: Thermometer, label: "fan℃履歴", color: "text-sky-500 bg-sky-50" },
          { href: "/mypage/favorites", icon: Star, label: "お気に入り", color: "text-amber-500 bg-amber-50" },
          { href: "/mypage/profile", icon: User, label: "プロフィール", color: "text-violet-500 bg-violet-50" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
