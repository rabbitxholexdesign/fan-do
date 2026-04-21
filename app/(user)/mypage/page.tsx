"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Heart,
  ChevronRight,
  CreditCard,
  History,
  Star,
  User,
  Edit3,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  Search,
  Command,
  ChevronDown,
  Trash2,
  Pencil,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface UserProfile {
  display_name: string | null
  fanc_score: number
  created_at: string
}

interface Subscription {
  id: string
  created_at: string
  current_period_end: string | null
  talent: { id: string; name: string; cover_image_url: string | null } | null
  plan: { name: string; price: number; billing_cycle: string } | null
  status: string
}

const quickActions = [
  { icon: CreditCard, label: "支払い履歴", href: "/mypage/billing" },
  { icon: History,    label: "fan℃履歴",   href: "/mypage/fanc-history" },
  { icon: Star,       label: "お気に入り",  href: "/mypage/favorites" },
  { icon: User,       label: "プロフィール",href: "/mypage/profile" },
]

const CYCLE_LABELS: Record<string, string> = {
  monthly: "月", quarterly: "3ヶ月", biannual: "半年", yearly: "年",
}

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("12ヶ月")

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const [profileRes, subsRes] = await Promise.all([
        supabase
          .from("users")
          .select("display_name, fanc_score, created_at")
          .eq("id", user.id)
          .single(),
        supabase
          .from("subscriptions")
          .select(`
            id, created_at, current_period_end, status,
            talent:talent_id(id, name, cover_image_url),
            plan:plan_id(name, price, billing_cycle)
          `)
          .eq("fan_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false }),
      ])

      if (profileRes.data) setProfile(profileRes.data as UserProfile)
      if (subsRes.data) setSubscriptions(subsRes.data as unknown as Subscription[])
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const toMonthly = (price: number, cycle: string) => {
    if (cycle === "yearly") return Math.round(price / 12)
    if (cycle === "quarterly") return Math.round(price / 3)
    if (cycle === "biannual") return Math.round(price / 6)
    return price
  }

  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum + toMonthly(s.plan?.price ?? 0, s.plan?.billing_cycle ?? "monthly"),
    0
  )

  const displayName = profile?.display_name ?? "ユーザー"
  const initial = displayName[0]

  return (
    <div className="space-y-6">
      {/* ブレッドクラム */}
      <div className="flex items-center gap-2 text-sm">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-sky-600 font-semibold text-xs shrink-0">
          {initial}
        </div>
        <span className="text-[#475467]">{displayName}</span>
        <ChevronRight className="w-4 h-4 text-[#D0D5DD]" />
        <span className="text-[#101828] font-medium">マイページ</span>
      </div>

      {/* ページタイトル + アクションボタン */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-[#101828]">マイページ</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/mypage/notifications"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            お知らせ
          </Link>
          <Link
            href="/mypage/profile"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D0D5DD] rounded-lg text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors shadow-sm"
          >
            <Edit3 className="w-4 h-4" />
            プロフィール編集
          </Link>
          <Link
            href="/talents"
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 border border-sky-500 rounded-lg text-sm font-medium text-white hover:bg-sky-600 transition-colors shadow-sm"
          >
            タレントを探す
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* fan℃スコア */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg border border-[#E4E7EC] bg-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#667085]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#475467]">fan℃スコア</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-semibold text-[#101828]">
                  {isLoading ? "—" : (profile?.fanc_score ?? 0).toLocaleString()}
                </p>
                <span className="text-sm text-[#475467]">pt</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-[#ECFDF3] rounded-full shrink-0">
              <TrendingUp className="w-3 h-3 text-[#027A48]" />
              <span className="text-xs font-medium text-[#027A48]">Up</span>
            </div>
          </div>
        </div>

        {/* 応援中のタレント */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg border border-[#E4E7EC] bg-white flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-[#667085]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#475467]">応援中のタレント</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-semibold text-[#101828]">
                  {isLoading ? "—" : subscriptions.length}
                </p>
                <span className="text-sm text-[#475467]">人</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-[#ECFDF3] rounded-full shrink-0">
              <TrendingUp className="w-3 h-3 text-[#027A48]" />
              <span className="text-xs font-medium text-[#027A48]">Active</span>
            </div>
          </div>
        </div>

        {/* 月額合計 */}
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg border border-[#E4E7EC] bg-white flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-[#667085]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#475467]">月額合計</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-3xl font-semibold text-[#101828]">
                  {isLoading ? "—" : `¥${totalMonthly.toLocaleString()}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-[#ECFDF3] rounded-full shrink-0">
              <TrendingUp className="w-3 h-3 text-[#027A48]" />
              <span className="text-xs font-medium text-[#027A48]">月額</span>
            </div>
          </div>
        </div>
      </div>

      {/* 応援履歴グラフ */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-[#475467]">応援履歴</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-3xl font-semibold text-[#101828]">
                ¥{(totalMonthly * 3).toLocaleString()}
              </p>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#ECFDF3] rounded-full">
                <TrendingUp className="w-3 h-3 text-[#027A48]" />
                <span className="text-xs font-medium text-[#027A48]">累計</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["12ヶ月", "30日", "7日", "24時間"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  selectedPeriod === period
                    ? "bg-[#F9FAFB] text-[#101828] border border-[#E4E7EC]"
                    : "text-[#475467] hover:bg-[#F9FAFB]"
                )}
              >
                {period}
              </button>
            ))}
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#D0D5DD] rounded-lg text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors">
              <Settings className="w-4 h-4" />
              フィルター
            </button>
          </div>
        </div>

        {/* SVGグラフ */}
        <div className="h-48 relative">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 160 Q 80 155 160 140 T 320 110 T 480 85 T 640 65 T 800 45"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
            />
            <path
              d="M 0 160 Q 80 155 160 140 T 320 110 T 480 85 T 640 65 T 800 45 L 800 200 L 0 200 Z"
              fill="url(#chartGradient)"
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-[#475467] pt-2 border-t border-[#E4E7EC]">
            {["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 応援中のタレント テーブル */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#E4E7EC]">
          <h2 className="text-lg font-semibold text-[#101828]">応援中のタレント</h2>
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D0D5DD] rounded-lg text-[#667085] hover:border-[#98A2B3] transition-colors cursor-pointer">
            <Search className="w-4 h-4" />
            <span className="text-sm">検索</span>
            <div className="flex items-center gap-0.5 text-xs bg-[#F2F4F7] px-1.5 py-0.5 rounded border border-[#E4E7EC] ml-4">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-[#475467] text-sm">読み込み中...</div>
        ) : subscriptions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-[#475467] text-sm mb-4">まだ応援中のタレントがいません</p>
            <Link
              href="/talents"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 rounded-lg text-sm font-medium text-white hover:bg-sky-600 transition-colors"
            >
              タレントを探す
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            {/* テーブルヘッダー */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#F9FAFB] border-b border-[#E4E7EC] text-xs font-medium text-[#475467]">
              <div className="col-span-4 flex items-center gap-1">
                タレント <ChevronDown className="w-3 h-3" />
              </div>
              <div className="col-span-2 flex items-center gap-1">
                プラン <ChevronDown className="w-3 h-3" />
              </div>
              <div className="col-span-2 flex items-center gap-1">
                次回請求 <ChevronDown className="w-3 h-3" />
              </div>
              <div className="col-span-1 flex items-center gap-1">
                ステータス
              </div>
              <div className="col-span-2 flex items-center gap-1">
                金額 <ChevronDown className="w-3 h-3" />
              </div>
              <div className="col-span-1" />
            </div>

            {/* テーブルボディ */}
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-[#E4E7EC] hover:bg-[#F9FAFB] transition-colors items-start md:items-center"
              >
                <div className="col-span-4 flex items-center gap-3 w-full md:w-auto">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#D0D5DD] shrink-0" />
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                    {sub.talent?.cover_image_url ? (
                      <img src={sub.talent.cover_image_url} alt={sub.talent.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>🌱</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#101828] truncate">{sub.talent?.name ?? "—"}</p>
                    <p className="text-xs text-[#475467]">@{sub.talent?.id?.slice(0, 8) ?? "—"}</p>
                  </div>
                </div>

                <div className="col-span-2 md:block hidden">
                  <p className="text-sm text-[#475467]">{sub.plan?.name ?? "—"}</p>
                </div>

                <div className="col-span-2 md:block hidden">
                  <p className="text-sm text-[#475467]">
                    {sub.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString("ja-JP")
                      : "—"}
                  </p>
                </div>

                <div className="col-span-1">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ECFDF3] rounded-full text-xs font-medium text-[#027A48]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#12B76A]" />
                    Active
                  </span>
                </div>

                <div className="col-span-2 md:block hidden">
                  <p className="text-sm font-medium text-[#101828]">
                    ¥{(sub.plan?.price ?? 0).toLocaleString()}
                    <span className="text-xs font-normal text-[#475467] ml-1">
                      / {CYCLE_LABELS[sub.plan?.billing_cycle ?? "monthly"] ?? "月"}
                    </span>
                  </p>
                </div>

                <div className="col-span-1 flex items-center justify-end gap-1">
                  <Link
                    href={`/community/${sub.talent?.id}`}
                    className="p-2 text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors"
                    title="サロンへ"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button className="p-2 text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* フッター */}
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-sm text-[#475467]">
                {subscriptions.length}件中 {subscriptions.length}件を表示
              </p>
              <Link
                href="/mypage/subscriptions"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#D0D5DD] rounded-lg text-sm font-medium text-[#344054] hover:bg-[#F9FAFB] transition-colors"
              >
                すべて管理
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-3 bg-white border border-[#E4E7EC] rounded-xl p-6 hover:border-sky-400 hover:shadow-sm transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-lg border border-[#E4E7EC] bg-white flex items-center justify-center group-hover:border-sky-300 group-hover:bg-sky-50 transition-colors">
              <action.icon className="w-5 h-5 text-[#667085] group-hover:text-sky-500 transition-colors" />
            </div>
            <p className="text-sm font-medium text-[#344054]">{action.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
