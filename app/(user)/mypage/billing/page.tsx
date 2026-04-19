"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Shield, ExternalLink, Receipt } from "lucide-react"
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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active:    { label: "有効", color: "bg-green-100 text-green-800" },
  cancelled: { label: "解約済み", color: "bg-gray-100 text-gray-700" },
  past_due:  { label: "支払い遅延", color: "bg-red-100 text-red-800" },
  paused:    { label: "一時停止", color: "bg-yellow-100 text-yellow-800" },
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

        // Monthly total for active subscriptions
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">支払い履歴・お支払い方法</h1>
        <p className="text-muted-foreground">サブスクリプションとお支払い情報を管理します</p>
      </div>

      {/* Security notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-sm">安全なお支払い</p>
              <p className="text-sm text-muted-foreground">
                お支払い情報はStripeによって安全に管理されています。
                カード情報は暗号化され、当サービスには保存されません。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      {activeCount > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">有効なサブスク</p>
              <p className="text-2xl font-bold mt-1">{activeCount}件</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">月額合計（概算）</p>
              <p className="text-2xl font-bold mt-1">¥{formatPrice(totalMonthly)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>サブスクリプション一覧</CardTitle>
          <CardDescription>支援中・過去のサブスクリプション</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <Receipt className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">サブスクリプションがありません</p>
              <Button variant="outline" asChild>
                <Link href="/talents">タレントを探す</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const statusConfig = STATUS_CONFIG[sub.status] ?? { label: sub.status, color: "bg-gray-100 text-gray-700" }
                const plan = sub.plan
                const talent = sub.talent
                return (
                  <div
                    key={sub.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {talent?.name ?? "—"}
                        </span>
                        <Badge className={`shrink-0 text-xs border-0 ${statusConfig.color}`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan?.name ?? "—"}
                        {plan && (
                          <span className="ml-2">
                            ¥{formatPrice(plan.price)} / {BILLING_LABELS[plan.billing_cycle] ?? plan.billing_cycle}
                          </span>
                        )}
                      </p>
                      {sub.current_period_end && sub.status === "active" && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          次回更新: {new Date(sub.current_period_end).toLocaleDateString("ja-JP")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        開始: {new Date(sub.created_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {talent && sub.status === "active" && (
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/community/${talent.id}`}>サロン</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stripe Customer Portal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            お支払い方法・請求書
          </CardTitle>
          <CardDescription>
            カードの追加・変更・削除や請求書の確認はStripeのポータルから行えます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={openStripePortal}
            disabled={isPortalLoading}
            variant="outline"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {isPortalLoading ? "移動中..." : "Stripeポータルを開く"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Stripe の安全なページに移動します
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
