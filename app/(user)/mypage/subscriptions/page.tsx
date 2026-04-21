"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Subscription {
  id: string
  created_at: string
  talent: { id: string; name: string; cover_image_url: string | null } | null
  plan: { name: string; price: number; billing_cycle: string } | null
  status: string
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: "月", quarterly: "3ヶ月", biannual: "半年", yearly: "年", onetime: "買い切り",
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active:    { label: "アクティブ",   bg: "bg-emerald-100", text: "text-emerald-700" },
  cancelled: { label: "解約済み",     bg: "bg-slate-100",   text: "text-slate-600" },
  paused:    { label: "一時停止中",   bg: "bg-amber-100",   text: "text-amber-700" },
  past_due:  { label: "支払い遅延",   bg: "bg-red-100",     text: "text-red-700" },
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data } = await supabase
        .from("subscriptions")
        .select(`
          id, created_at, status,
          talent:talent_id(id, name, cover_image_url),
          plan:plan_id(name, price, billing_cycle)
        `)
        .eq("fan_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setSubscriptions(data as unknown as Subscription[])
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const active = subscriptions.filter((s) => s.status === "active")

  const toMonthly = (price: number, cycle: string) => {
    if (cycle === "yearly") return Math.round(price / 12)
    if (cycle === "quarterly") return Math.round(price / 3)
    if (cycle === "biannual") return Math.round(price / 6)
    return price
  }

  const totalMonthly = active.reduce(
    (sum, s) => sum + toMonthly(s.plan?.price ?? 0, s.plan?.billing_cycle ?? "monthly"),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-1">マイページ</p>
        <h1 className="text-2xl font-bold text-slate-800">支援中プラン管理</h1>
        <p className="text-slate-500 mt-1">現在のサブスクリプションを管理します</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-5">
          <p className="text-sm text-slate-500 mb-1">応援中タレント</p>
          <p className="text-3xl font-bold text-slate-800">{active.length}
            <span className="text-base font-normal text-slate-500 ml-1">件</span>
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-5">
          <p className="text-sm text-slate-500 mb-1">月換算支援額</p>
          <p className="text-3xl font-bold text-slate-800">
            <span className="text-base font-normal text-slate-500 mr-0.5">¥</span>
            {totalMonthly.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Subscription List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 h-28 animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 py-16 text-center">
          <div className="text-5xl mb-4">🌿</div>
          <p className="text-slate-500 mb-4">支援中のプランがありません</p>
          <Link
            href="/talents"
            className="bg-sky-500 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-sky-600 transition-colors inline-block"
          >
            タレントを探す
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const statusInfo = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.active
            return (
              <div
                key={sub.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Talent Image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                    {sub.talent?.cover_image_url ? (
                      <img
                        src={sub.talent.cover_image_url}
                        alt={sub.talent.name ?? ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🌿</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <Link
                        href={`/talents/${sub.talent?.id}`}
                        className="font-semibold text-slate-800 hover:text-sky-600 transition-colors"
                      >
                        {sub.talent?.name ?? "—"}
                      </Link>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{sub.plan?.name ?? "—"}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      ¥{(sub.plan?.price ?? 0).toLocaleString()}
                      {sub.plan?.billing_cycle && (
                        <span className="font-normal text-slate-500"> / {CYCLE_LABELS[sub.plan.billing_cycle] ?? sub.plan.billing_cycle}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      開始: {new Date(sub.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>

                  <div className="flex gap-2 sm:flex-col sm:items-end justify-end">
                    <Link
                      href={`/community/${sub.talent?.id}`}
                      className="border border-slate-200 text-slate-700 text-sm font-medium px-4 py-1.5 rounded-full hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      サロンへ
                    </Link>
                    {sub.status === "active" && (
                      <button className="text-slate-400 text-xs hover:text-red-500 transition-colors">
                        解約
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
