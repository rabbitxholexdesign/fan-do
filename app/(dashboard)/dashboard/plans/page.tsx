"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Users, CircleDollarSign, Pencil, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Plan {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  billing_cycle: string
  max_supporters: number | null
  current_supporters: number
  return_description: string | null
  fanc_bonus: number
  is_active: boolean
}

const CATEGORY_LABELS: Record<string, string> = { hito: "ひと", mono: "もの", koto: "こと" }
const CYCLE_LABELS: Record<string, string> = {
  monthly: "月額", quarterly: "3ヶ月", biannual: "半年",
  yearly: "年額", onetime: "買い切り",
}

export default function PlansPage() {
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talentId")

  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTalentId, setActiveTalentId] = useState<string | null>(null)

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
      setActiveTalentId(tid)

      const { data } = await supabase
        .from("support_plans")
        .select("*")
        .eq("talent_id", tid)
        .order("price", { ascending: true })

      if (data) setPlans(data as Plan[])
      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  async function toggleActive(planId: string, current: boolean) {
    const supabase = createClient()
    await supabase.from("support_plans").update({ is_active: !current }).eq("id", planId)
    setPlans(plans.map((p) => p.id === planId ? { ...p, is_active: !current } : p))
  }

  async function deletePlan(planId: string) {
    if (!confirm("このプランを削除しますか？")) return
    const supabase = createClient()
    await supabase.from("support_plans").delete().eq("id", planId)
    setPlans(plans.filter((p) => p.id !== planId))
  }

  const totalRevenue = plans
    .filter((p) => p.is_active)
    .reduce((sum, p) => sum + p.price * p.current_supporters, 0)

  const newLink = activeTalentId
    ? `/dashboard/plans/new?talentId=${activeTalentId}`
    : "/dashboard/plans/new"

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">プラン管理</h1>
          <p className="text-muted-foreground">支援プランの作成・編集・公開設定</p>
        </div>
        <Button asChild>
          <Link href={newLink}>
            <Plus className="h-4 w-4 mr-2" />
            新しいプランを作成
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">公開中プラン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter((p) => p.is_active).length}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">総サポーター数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.reduce((s, p) => s + p.current_supporters, 0)}人
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">月間収益（概算）</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-muted-foreground">支援プランがまだありません</p>
            <Button asChild>
              <Link href={newLink}>
                <Plus className="h-4 w-4 mr-2" />
                最初のプランを作成
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.is_active ? "" : "opacity-60"}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[plan.category] ?? plan.category}
                      </Badge>
                      {!plan.is_active && (
                        <Badge variant="secondary" className="text-xs">非公開</Badge>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">¥{plan.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">
                        / {CYCLE_LABELS[plan.billing_cycle] ?? plan.billing_cycle}
                      </span>
                    </div>
                    {plan.return_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {plan.return_description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {plan.current_supporters}人
                        {plan.max_supporters && ` / ${plan.max_supporters}人`}
                      </span>
                      {plan.fanc_bonus > 0 && (
                        <span className="text-primary font-medium">+{plan.fanc_bonus}℃ ボーナス</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{plan.is_active ? "公開中" : "非公開"}</span>
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={() => toggleActive(plan.id, plan.is_active)}
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/plans/${plan.id}/edit`} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            編集
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onSelect={() => deletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
