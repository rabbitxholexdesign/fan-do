"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ChevronDown, ArrowUpRight, Pencil } from "lucide-react"

interface Subscription {
  id: string
  created_at: string
  current_period_end: string | null
  talent: { id: string; name: string; cover_image_url: string | null } | null
  plan: { name: string; price: number; billing_cycle: string } | null
  status: string
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: "月", quarterly: "3ヶ月", biannual: "半年", yearly: "年", onetime: "買い切り",
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  active:    { label: "Active",   bg: "bg-[#ECFDF3]", text: "text-[#027A48]", dot: "bg-[#12B76A]" },
  cancelled: { label: "解約済み", bg: "bg-[#F2F4F7]", text: "text-[#344054]", dot: "bg-[#98A2B3]" },
  paused:    { label: "停止中",   bg: "bg-[#FFFAEB]", text: "text-[#B54708]", dot: "bg-[#F79009]" },
  past_due:  { label: "遅延",     bg: "bg-[#FEF3F2]", text: "text-[#B42318]", dot: "bg-[#F04438]" },
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
          id, created_at, current_period_end, status,
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
    (sum, s) => sum + toMonthly(s.plan?.price ?? 0, s.plan?.billing_cycle ?? "monthly"), 0
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#101828]">支援中プラン管理</h1>
        <p className="text-sm text-[#475467] mt-1">現在のサブスクリプションを管理します</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <p className="text-sm text-[#475467]">応援中タレント</p>
          <p className="text-3xl font-semibold text-[#101828] mt-1">
            {active.length}
            <span className="text-base font-normal text-[#475467] ml-1">件</span>
          </p>
        </div>
        <div className="bg-white border border-[#E4E7EC] rounded-xl p-5 shadow-sm">
          <p className="text-sm text-[#475467]">月換算支援額</p>
          <p className="text-3xl font-semibold text-[#101828] mt-1">
            ¥{totalMonthly.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EC]">
          <h2 className="text-base font-semibold text-[#101828]">サブスクリプション一覧</h2>
          <p className="text-sm text-[#475467] mt-0.5">支援中・過去のすべてのプラン</p>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-[#475467] text-sm">読み込み中...</div>
        ) : subscriptions.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl mb-3">🌿</div>
            <p className="text-[#475467] text-sm mb-4">支援中のプランがありません</p>
            <Link href="/talents" className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 rounded-lg text-sm font-medium text-white hover:bg-sky-600 transition-colors">
              タレントを探す
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#F9FAFB] border-b border-[#E4E7EC] text-xs font-medium text-[#475467]">
              <div className="col-span-4 flex items-center gap-1">タレント <ChevronDown className="w-3 h-3" /></div>
              <div className="col-span-2 flex items-center gap-1">プラン <ChevronDown className="w-3 h-3" /></div>
              <div className="col-span-2 flex items-center gap-1">開始日 <ChevronDown className="w-3 h-3" /></div>
              <div className="col-span-1">ステータス</div>
              <div className="col-span-2 flex items-center gap-1">金額 <ChevronDown className="w-3 h-3" /></div>
              <div className="col-span-1" />
            </div>

            {subscriptions.map((sub) => {
              const st = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.active
              return (
                <div key={sub.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-6 py-4 border-b border-[#E4E7EC] hover:bg-[#F9FAFB] transition-colors items-start md:items-center last:border-0">
                  <div className="col-span-4 flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {sub.talent?.cover_image_url ? (
                        <img src={sub.talent.cover_image_url} alt={sub.talent.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>🌱</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/talents/${sub.talent?.id}`} className="text-sm font-medium text-[#101828] hover:text-sky-600 transition-colors truncate block">
                        {sub.talent?.name ?? "—"}
                      </Link>
                    </div>
                  </div>
                  <div className="col-span-2 md:block hidden">
                    <p className="text-sm text-[#475467]">{sub.plan?.name ?? "—"}</p>
                  </div>
                  <div className="col-span-2 md:block hidden">
                    <p className="text-sm text-[#475467]">{new Date(sub.created_at).toLocaleDateString("ja-JP")}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
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
                    <Link href={`/community/${sub.talent?.id}`} className="p-2 text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors" title="サロンへ">
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                    <button className="p-2 text-[#475467] hover:text-[#101828] hover:bg-[#F2F4F7] rounded-lg transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
