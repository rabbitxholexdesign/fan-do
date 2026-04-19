"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "アクティブ", color: "bg-green-100 text-green-700" },
  cancelled: { label: "解約済み", color: "bg-gray-100 text-gray-700" },
  paused: { label: "一時停止中", color: "bg-yellow-100 text-yellow-700" },
  past_due: { label: "支払い遅延", color: "bg-red-100 text-red-700" },
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">支援中プラン管理</h1>
        <p className="text-muted-foreground">現在のサブスクリプションを管理します</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">応援中タレント</p>
            <p className="text-2xl font-bold">{active.length}<span className="text-sm font-normal ml-1">件</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">月換算支援額</p>
            <p className="text-2xl font-bold">¥{totalMonthly.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-4">
          <p>支援中のプランがありません</p>
          <Button asChild>
            <Link href="/talents">タレントを探す</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const statusInfo = STATUS_LABELS[sub.status] ?? STATUS_LABELS.active
            return (
              <Card key={sub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Talent Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
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
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {sub.talent?.name ?? "—"}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{sub.plan?.name ?? "—"}</p>
                      <p className="text-sm font-medium mt-1">
                        ¥{(sub.plan?.price ?? 0).toLocaleString()}
                        {sub.plan?.billing_cycle && ` / ${CYCLE_LABELS[sub.plan.billing_cycle] ?? sub.plan.billing_cycle}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        開始: {new Date(sub.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>

                    <div className="flex gap-2 sm:flex-col sm:items-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/community/${sub.talent?.id}`}>サロンへ</Link>
                      </Button>
                      {sub.status === "active" && (
                        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                          解約
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
