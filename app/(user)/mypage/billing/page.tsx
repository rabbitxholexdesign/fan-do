"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Shield, CreditCard, ExternalLink, Receipt, ChevronDown, ArrowUpRight } from "lucide-react"
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
  monthly: "月額", yearly: "年額", quarterly: "3ヶ月",
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active:    { label: "Active",   bg: "bg-[#ECFDF3]", text: "text-[#027A48]", dot: "bg-[#12B76A]" },
  cancelled: { label: "解約済み", bg: "bg-[#F2F4F7]", text: "text-[#344054]", dot: "bg-[#98A2B3]" },
  past_due:  { label: "遅延",     bg: "bg-[#FEF3F2]", text: "text-[#B42318]", dot: "bg-[#F04438]" },
  paused:    { label: "停止中",   bg: "bg-[#FFFAEB]", text: "text-[#B54708]", dot: "bg-[#F79009]" },
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
        .select(`id, status, created_at, current_period_end, talent:talent_id(id, name), plan:plan_id(name, price, billing_cycle)`)
        .eq("fan_id", user.id)
        .order("created_at", { ascending: false })

      if (data) {
        const subs = data as unknown as Subscription[]
        setSubscriptions(subs)
        const monthly = subs.filter((s) => s.status === "active").reduce((sum, s) => {
          if (!s.plan) return sum
          const { price, billing_cycle } = s.plan
          if (billing_cycle === "yearly") return sum + Math.round(price / 12)
          if (billing_cycle === "quarterly") return sum + Math.round(price / 3)
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
      if (json.url) window.location.href = json.url
      else alert(json.error ?? "エラーが発生しました")
    } catch {
      alert("通信エラーが発生しました")
    }
    setIsPortalLoading(false)
  }

  const activeCount = subscriptions.filter((s) => s.status === "active").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#101828]">支払い履歴・お支払い方法</h1>
        <p className="text-sm text-[#475467] mt-1">サブスクリプションとお支払い情報を管理します</p>
      </div>

      {/* Security Notice */}
      <div className="bg-[#EFF8FF] border border-[#B2DDFF] rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#175CD3] mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-[#101828] text-sm">安全なお支払い</p>
            <p className="text-sm text-[#475467] mt-0.5">
              お支払い情報はStripeによって安全に管理されています。カード情報は暗号化され、当サービスには保存されません。
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      {activeCount > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
            <p className="text-sm text-[#475467]">有効なサブスク</p>
            <p className="text-3xl font-semibold text-[#101828] mt-1">{activeCount}
              <span className="text-base font-normal text-[#475467] ml-1">件</span>
            </p>
          </div>
          <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
            <p className="text-sm text-[#475467]">月額合計（概算）</p>
            <p className="text-3xl font-semibold text-[#101828] mt-1">¥{totalMonthly.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Subscriptions Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EC]">
          <h2 className="text-base font-semibold text-[#101828]">サブスクリプション一覧</h2>
          <p className="text-sm text-[#475467] mt-0.5">支援中・過去のサブスクリプション</p>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-[#475467] text-sm">読み込み中...</div>
        ) : subscriptions.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-4">
            <Receipt className="h-12 w-12 mx-auto text-[#D0D5DD]" />
            <p className="text-[#475467] text-sm">サブスクリプションがありません</p>
            <Link href="/talents" className="inline-block border border-[#D0D5DD] text-[#344054] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#F9FAFB] transition-colors">
              タレントを探す
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#F9FAFB] border-b border-[#E4E7EC] text-xs font-medium text-[#475467]">
              <div className="col-span-3 flex items-center gap-1">タレント <ChevronDown className="w-3 h-3" /></div>
              <div className="col-span-3">プラン / 金額</div>
              <div className="col-span-2 flex items-center gap-1">開始日 <ChevronDown className="w-3 h-3" /></div>
              <div className="col-span-2">次回更新</div>
              <div className="col-span-1">ステータス</div>
              <div className="col-span-1" />
            </div>
            {subscriptions.map((sub) => {
              const st = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.active
              return (
                <div key={sub.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-[#E4E7EC] hover:bg-[#F9FAFB] transition-colors items-start md:items-center last:border-0">
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-[#101828]">{sub.talent?.name ?? "—"}</p>
                  </div>
                  <div className="col-span-3 md:block hidden">
                    <p className="text-sm text-[#475467]">{sub.plan?.name ?? "—"}</p>
                    {sub.plan && (
                      <p className="text-sm font-medium text-[#101828]">
                        ¥{sub.plan.price.toLocaleString()} / {BILLING_LABELS[sub.plan.billing_cycle] ?? sub.plan.billing_cycle}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 md:block hidden">
                    <p className="text-sm text-[#475467]">{new Date(sub.created_at).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <div className="col-span-2 md:block hidden">
                    <p className="text-sm text-[#475467]">
                      {sub.current_period_end && sub.status === "active"
                        ? new Date(sub.current_period_end).toLocaleDateString("ja-JP")
                        : "—"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {sub.talent && sub.status === "active" && (
                      <Link href={`/community/${sub.talent.id}`} className="p-2 text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Stripe Portal */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard className="h-5 w-5 text-[#667085]" />
          <h2 className="font-semibold text-[#101828]">お支払い方法・請求書</h2>
        </div>
        <p className="text-sm text-[#475467] mb-4">
          カードの追加・変更・削除や請求書の確認はStripeのポータルから行えます
        </p>
        <button
          onClick={openStripePortal}
          disabled={isPortalLoading}
          className="flex items-center gap-2 border border-[#D0D5DD] text-[#344054] text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#F9FAFB] transition-colors shadow-sm disabled:opacity-50"
        >
          <ExternalLink className="h-4 w-4" />
          {isPortalLoading ? "移動中..." : "Stripeポータルを開く"}
        </button>
        <p className="text-xs text-[#667085] mt-2">Stripe の安全なページに移動します</p>
      </div>
    </div>
  )
}
