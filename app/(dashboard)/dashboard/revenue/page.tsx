"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CircleDollarSign, TrendingUp, Wallet, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface PlanStat {
  name: string
  price: number
  supporters: number
  billing_cycle: string
}

const CYCLE_LABELS: Record<string, string> = {
  monthly: "月額", quarterly: "3ヶ月", biannual: "半年",
  yearly: "年額", onetime: "買い切り",
}

export default function RevenuePage() {
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talentId")

  const [planStats, setPlanStats] = useState<PlanStat[]>([])
  const [totalSupporters, setTotalSupporters] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      let tid = talentId
      if (!tid) {
        const { data } = await supabase
          .from("talents")
          .select("id")
          .eq("operator_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
        tid = data?.id ?? null
      }
      if (!tid) { setIsLoading(false); return }

      // プランごとのサポーター数・収益
      const { data: plans } = await supabase
        .from("support_plans")
        .select("name, price, current_supporters, billing_cycle")
        .eq("talent_id", tid)
        .eq("is_active", true)

      if (plans) {
        setPlanStats(plans.map((p) => ({
          name: p.name,
          price: p.price,
          supporters: p.current_supporters,
          billing_cycle: p.billing_cycle,
        })))
        setTotalSupporters(plans.reduce((s, p) => s + p.current_supporters, 0))
      }
      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  // 月換算収益（年額は÷12、3ヶ月は÷3）
  const toMonthly = (price: number, cycle: string) => {
    if (cycle === "yearly") return Math.round(price / 12)
    if (cycle === "quarterly") return Math.round(price / 3)
    if (cycle === "biannual") return Math.round(price / 6)
    return price
  }

  const monthlyGross = planStats.reduce(
    (sum, p) => sum + toMonthly(p.price, p.billing_cycle) * p.supporters,
    0
  )
  const platformFee = Math.round(monthlyGross * 0.2)
  const monthlyNet = monthlyGross - platformFee

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">収益・出金</h1>
        <p className="text-muted-foreground">収益の確認と出金申請</p>
      </div>

      {/* Notice */}
      <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-800 text-sm">Stripe連携前の概算表示</p>
          <p className="text-sm text-yellow-700">
            現在の収益はサポーター数×プラン価格の概算です。実際の決済連携後に正確な数値が表示されます。
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">月間収益（概算）</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{monthlyGross.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">プラットフォーム手数料（20%）差引前</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">月間取り分（概算）</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{monthlyNet.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">手数料差引後の受取額</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">サポーター数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSupporters}人</div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>プラン別収益</CardTitle>
          <CardDescription>公開中のプランごとの内訳（月換算）</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
          ) : planStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              公開中のプランがありません
            </div>
          ) : (
            <div className="space-y-3">
              {planStats.map((plan, i) => {
                const monthly = toMonthly(plan.price, plan.billing_cycle) * plan.supporters
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ¥{plan.price.toLocaleString()} / {CYCLE_LABELS[plan.billing_cycle] ?? plan.billing_cycle}
                        　×　{plan.supporters}人
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">¥{monthly.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">月換算</Badge>
                    </div>
                  </div>
                )
              })}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 font-semibold">
                <span>合計（手数料差引前）</span>
                <span>¥{monthlyGross.toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout */}
      <Card>
        <CardHeader>
          <CardTitle>出金申請</CardTitle>
          <CardDescription>Stripe Connect連携後に利用可能になります</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-3">
            <p className="text-muted-foreground text-sm">
              出金機能はStripe Connect連携後に有効になります。<br />
              連携設定は管理者にお問い合わせください。
            </p>
            <Button variant="outline" disabled>
              出金申請（準備中）
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
