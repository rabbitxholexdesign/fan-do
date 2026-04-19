"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import {
  Users,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  MessageCircle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Talent {
  id: string
  name: string
  status: string
  fanc_score: number
  supporter_count: number
}

interface Subscription {
  id: string
  created_at: string
  fan: { display_name: string | null } | null
  plan: { name: string } | null
}

function StatCard({
  title,
  value,
  icon: Icon,
  suffix = "",
  prefix = "",
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  suffix?: string
  prefix?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const applied = searchParams.get("applied")
  const talentId = searchParams.get("talentId")

  const [talents, setTalents] = useState<Talent[]>([])
  const [activeTalent, setActiveTalent] = useState<Talent | null>(null)
  const [recentSubs, setRecentSubs] = useState<Subscription[]>([])
  const [postCount, setPostCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      // オペレーターのタレント一覧
      const { data: talentData } = await supabase
        .from("talents")
        .select("id, name, status, fanc_score, supporter_count")
        .eq("operator_id", user.id)
        .order("created_at", { ascending: false })

      if (talentData && talentData.length > 0) {
        setTalents(talentData as Talent[])
        // URLパラメータ → active → 先頭 の優先順で選択
        const selected =
          (talentData as Talent[]).find((t) => t.id === talentId) ??
          (talentData as Talent[]).find((t) => t.status === "active") ??
          talentData[0] as Talent
        setActiveTalent(selected)

        // 選択タレントの最新サポーター
        const { data: subsData } = await supabase
          .from("subscriptions")
          .select("id, created_at, fan:fan_id(display_name), plan:plan_id(name)")
          .eq("talent_id", selected.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(4)

        if (subsData) setRecentSubs(subsData as unknown as Subscription[])

        // コミュニティ投稿数
        const { count } = await supabase
          .from("community_posts")
          .select("id", { count: "exact", head: true })
          .eq("talent_id", selected.id)

        setPostCount(count ?? 0)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [talentId])

  const temperature = Math.min(100, Math.round((activeTalent?.fanc_score ?? 0) / 100))

  // 月次収益（サブスク数 × 仮の平均単価 — Stripe連携前の概算）
  const estimatedMonthlyRevenue = (activeTalent?.supporter_count ?? 0) * 1500

  return (
    <div className="space-y-8">
      {/* 申請完了バナー */}
      {applied && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
          <span className="text-green-600 mt-0.5">✓</span>
          <div>
            <p className="font-medium text-green-800">申請を受け付けました</p>
            <p className="text-sm text-green-700">審査には通常1〜3営業日かかります。結果はメールでお知らせします。</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground">読み込み中...</div>
      ) : talents.length === 0 ? (
        /* タレント未作成 */
        <div className="text-center py-20 space-y-4">
          <p className="text-muted-foreground">タレントがまだ登録されていません</p>
          <Button asChild>
            <Link href="/dashboard/talents/new">タレントを作成する</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* タレント審査中バナー */}
          {activeTalent && activeTalent.status !== "active" && (
            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">「{activeTalent.name}」は審査中です</p>
                <p className="text-sm text-yellow-700">
                  承認されるとサポーターの募集が開始されます。
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">ダッシュボード</h1>
              <p className="text-muted-foreground">{activeTalent?.name}の運営状況</p>
            </div>
            <div className="flex gap-2">
              {activeTalent?.status === "active" && (
                <Button variant="outline" asChild>
                  <Link href={`/talents/${activeTalent.id}`}>
                    公開ページを見る
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/dashboard/talents/new">新しいタレントを作成</Link>
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="サポーター数"
              value={activeTalent?.supporter_count ?? 0}
              icon={Users}
              suffix="人"
            />
            <StatCard
              title="今月の収益（概算）"
              value={estimatedMonthlyRevenue}
              icon={CircleDollarSign}
              prefix="¥"
            />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">fan℃スコア</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <FanTemperatureMeter temperature={temperature} size="sm" showLabel={false} />
                  <div>
                    <div className="text-2xl font-bold">{activeTalent?.fanc_score ?? 0}</div>
                    <div className="text-xs text-muted-foreground">pt</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <StatCard
              title="コミュニティ投稿"
              value={postCount}
              icon={MessageCircle}
              suffix="件"
            />
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Supporters */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>最近のサポーター</CardTitle>
                  <CardDescription>新しく参加したサポーター</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/supporters">
                    すべて見る <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentSubs.length > 0 ? (
                  <div className="space-y-4">
                    {recentSubs.map((sub) => (
                      <div key={sub.id} className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {(sub.fan?.display_name ?? "?")[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {sub.fan?.display_name ?? "匿名ユーザー"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {sub.plan?.name ?? "—"}
                            </Badge>
                            <span>{new Date(sub.created_at).toLocaleDateString("ja-JP")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    まだサポーターがいません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Talents List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>タレント一覧</CardTitle>
                  <CardDescription>登録しているタレント</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/talents/new">
                    新規作成 <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {talents.map((talent) => (
                    <div key={talent.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{talent.name}</p>
                        <p className="text-xs text-muted-foreground">
                          サポーター {talent.supporter_count}人
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            talent.status === "active"
                              ? "border-green-200 text-green-700"
                              : talent.status === "rejected"
                              ? "border-red-200 text-red-700"
                              : "border-yellow-200 text-yellow-700"
                          }`}
                        >
                          {talent.status === "active" ? "公開中"
                            : talent.status === "rejected" ? "却下"
                            : "審査中"}
                        </Badge>
                        {talent.status === "active" && (
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/talents/${talent.id}`}>
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
              <CardDescription>よく使う機能にすばやくアクセス</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/reports/new">
                    <MessageCircle className="h-5 w-5" />
                    活動報告を投稿
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/salon">
                    <Users className="h-5 w-5" />
                    サロン管理
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/revenue">
                    <CircleDollarSign className="h-5 w-5" />
                    出金申請
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link href="/dashboard/settings">
                    <Calendar className="h-5 w-5" />
                    タレント情報を編集
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
