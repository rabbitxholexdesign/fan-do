"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, CreditCard, ExternalLink, Receipt } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Subscription {
  id: string
  status: string
  created_at: string
  current_period_end: string | null
  talent: { id: string; name: string } | null
  plan: { name: string; price: number; billing_cycle: string } | null
}

const BILLING_LABELS: Record<string, string> = {
  monthly:   "月額",
  yearly:    "年額",
  quarterly: "3ヶ月",
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active:    { label: "有効",      bg: "bg-emerald-100", text: "text-emerald-700" },
  cancelled: { label: "解約済み",  bg: "bg-slate-100",   text: "text-slate-600" },
  past_due:  { label: "支払い遅延",bg: "bg-red-100",     text: "text-red-700" },
  paused:    { label: "一時停止",  bg: "bg-amber-100",   text: "text-amber-700" },
}

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const [totalMonthly, setTotalMonthly] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data } = await supabase
        .from("subscriptions")
        .select(`
          id, status, created_at, current_period_end,
          talent:talent_id(id, name),
          plan:plan_id(name, price, billing_cycle)
        `)
        .eq("fan_id", user.id)
        .order("created_at", { ascending: false })

      if (data) {
        const subs = data as unknown as Subscription[]
        setSubscriptions(subs)

        const monthly = subs
          .filter((s) => s.status === "active")
          .reduce((sum, s) => {
            if (!s.plan) return sum
            const price = s.plan.price
            const cycle = s.plan.billing_cycle
            if (cycle === "yearly") return sum + Math.round(price / 12)
            if (cycle === "quarterly") return sum + Math.round(price / 3)
            return sum + price
          }, 0)
        setTotalMonthly(monthly)
      }

      setIsLoading(false)
    }
    fetchData()
  }, [])

  async function openStripePortal() {
    setIsPortalLoading(true)
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        alert(json.error ?? "エラーが発生しました")
      }
    } catch {
      alert("通信エラーが発生しました")
    }
    setIsPortalLoading(false)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ja-JP").format(price)

  const activeCount = subscriptions.filter((s) => s.status === "active").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-1">マイページ</p>
        <h1 className="text-2xl font-bold text-slate-800">支払い履歴・お支払い方法</h1>
        <p className="text-slate-500 mt-1">サブスクリプションとお支払い情報を管理します</p>
      </div>

      {/* Security Notice */}
      <div className="rounded-2xl bg-sky-50 border border-sky-100 p-5">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">安全なお支払い</p>
            <p className="text-sm text-slate-500 mt-0.5">
              お支払い情報はStripeによって安全に管理されています。カード情報は暗号化され、当サービスには保存されません。
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {activeCount > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-5">
            <p className="text-sm text-slate-500 mb-1">有効なサブスク</p>
            <p className="text-3xl font-bold text-slate-800">{activeCount}
              <span className="text-base font-normal text-slate-500 ml-1">件</span>
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-5">
            <p className="text-sm text-slate-500 mb-1">月額合計（概算）</p>
            <p className="text-3xl font-bold text-slate-800">
              <span className="text-base font-normal text-slate-500 mr-0.5">¥</span>
              {formatPrice(totalMonthly)}
            </p>
          </div>
        </div>
      )}

      {/* Subscriptions */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">サブスクリプション一覧</h2>
          <p className="text-sm text-slate-400 mt-0.5">支援中・過去のサブスクリプション</p>
        </div>
        <div className="divide-y divide-slate-50">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-slate-400">読み込み中...</div>
          ) : subscriptions.length === 0 ? (
            <div className="px-6 py-16 text-center space-y-4">
              <Receipt className="h-12 w-12 mx-auto text-slate-200" />
              <p className="text-slate-500">サブスクリプションがありません</p>
              <Link
                href="/talents"
                className="inline-block border border-slate-200 text-slate-700 text-sm font-medium px-5 py-2 rounded-full hover:bg-slate-50 transition-colors"
              >
                タレントを探す
              </Link>
            </div>
          ) : (
            subscriptions.map((sub) => {
              const statusConfig = STATUS_CONFIG[sub.status] ?? { label: sub.status, bg: "bg-slate-100", text: "text-slate-600" }
              const plan = sub.plan
              const talent = sub.talent
              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 text-sm truncate">
                        {talent?.name ?? "—"}
                      </span>
                      <span className={`shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {plan?.name ?? "—"}
                      {plan && (
                        <span className="ml-2 font-medium text-slate-700">
                          ¥{formatPrice(plan.price)} / {BILLING_LABELS[plan.billing_cycle] ?? plan.billing_cycle}
                        </span>
                      )}
                    </p>
                    {sub.current_period_end && sub.status === "active" && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        次回更新: {new Date(sub.current_period_end).toLocaleDateString("ja-JP")}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      開始: {new Date(sub.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {talent && sub.status === "active" && (
                      <Link
                        href={`/community/${talent.id}`}
                        className="border border-slate-200 text-slate-700 text-sm font-medium px-4 py-1.5 rounded-full hover:bg-slate-50 transition-colors"
                      >
                        サロン
                      </Link>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Stripe Customer Portal */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-5 w-5 text-sky-500" />
          <h2 className="font-semibold text-slate-800">お支払い方法・請求書</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          カードの追加・変更・削除や請求書の確認はStripeのポータルから行えます
        </p>
        <button
          onClick={openStripePortal}
          disabled={isPortalLoading}
          className="flex items-center gap-2 border border-slate-200 text-slate-700 text-sm font-medium px-5 py-2.5 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <ExternalLink className="h-4 w-4" />
          {isPortalLoading ? "移動中..." : "Stripeポータルを開く"}
        </button>
        <p className="text-xs text-slate-400 mt-2">Stripe の安全なページに移動します</p>
      </div>
    </div>
  )
}
