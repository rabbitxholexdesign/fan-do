"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Heart, Calendar, Users, Flame, Lock, Medal } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// ── fan℃ランク定義 ──────────────────────────────────────────
const RANKS = [
  {
    id: "gold",
    label: "ゴールド",
    threshold: 5000,
    color: "text-yellow-500",
    bg: "bg-yellow-50 border-yellow-200",
    badgeCls: "bg-yellow-100 text-yellow-800",
  },
  {
    id: "silver",
    label: "シルバー",
    threshold: 1000,
    color: "text-slate-400",
    bg: "bg-slate-50 border-slate-200",
    badgeCls: "bg-slate-100 text-slate-700",
  },
  {
    id: "bronze",
    label: "ブロンズ",
    threshold: 0,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    badgeCls: "bg-amber-100 text-amber-800",
  },
] as const

function getRank(score: number) {
  return RANKS.find((r) => score >= r.threshold) ?? RANKS[RANKS.length - 1]
}

function getNextRank(score: number) {
  const idx = RANKS.findIndex((r) => score >= r.threshold)
  return idx > 0 ? RANKS[idx - 1] : null
}

// ── 固定バッジ定義（達成条件はロジックで判定） ─────────────────────
const BADGE_DEFS = [
  {
    id: "first_support",
    name: "ファーストサポーター",
    description: "初めて支援プランに参加",
    icon: Heart,
    color: "text-red-500",
    check: (stats: Stats) => stats.totalSubscriptions >= 1,
  },
  {
    id: "multi_support",
    name: "マルチサポーター",
    description: "3人以上のタレントを同時に応援",
    icon: Users,
    color: "text-blue-500",
    check: (stats: Stats) => stats.activeSubscriptions >= 3,
  },
  {
    id: "bronze_rank",
    name: "ブロンズファン",
    description: "fan℃スコア1pt以上獲得",
    icon: Medal,
    color: "text-amber-700",
    check: (stats: Stats) => stats.totalScore >= 1,
  },
  {
    id: "silver_rank",
    name: "シルバーファン",
    description: "fan℃スコア1,000pt以上獲得",
    icon: Star,
    color: "text-slate-400",
    check: (stats: Stats) => stats.totalScore >= 1000,
  },
  {
    id: "gold_rank",
    name: "ゴールドファン",
    description: "fan℃スコア5,000pt以上獲得",
    icon: Trophy,
    color: "text-yellow-500",
    check: (stats: Stats) => stats.totalScore >= 5000,
  },
  {
    id: "hot_fan",
    name: "ホットファン",
    description: "fan℃スコア500pt以上獲得",
    icon: Flame,
    color: "text-orange-500",
    check: (stats: Stats) => stats.totalScore >= 500,
  },
  {
    id: "long_term",
    name: "ロングサポーター",
    description: "サブスク継続日数30日以上",
    icon: Calendar,
    color: "text-green-500",
    check: (stats: Stats) => stats.maxContinuousDays >= 30,
  },
] as const

interface Stats {
  totalScore: number
  totalSubscriptions: number
  activeSubscriptions: number
  maxContinuousDays: number
}

export default function BadgesPage() {
  const [stats, setStats] = useState<Stats>({
    totalScore: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    maxContinuousDays: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const [scoresRes, allSubsRes, activeSubsRes] = await Promise.all([
        supabase
          .from("fanc_scores")
          .select("score")
          .eq("fan_id", user.id),
        supabase
          .from("subscriptions")
          .select("id, created_at")
          .eq("fan_id", user.id),
        supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("fan_id", user.id)
          .eq("status", "active"),
      ])

      const totalScore = (scoresRes.data ?? []).reduce((s, r) => s + r.score, 0)
      const totalSubscriptions = allSubsRes.data?.length ?? 0
      const activeSubscriptions = activeSubsRes.count ?? 0

      // Calculate max continuous days from earliest subscription
      let maxContinuousDays = 0
      if (allSubsRes.data && allSubsRes.data.length > 0) {
        const earliest = allSubsRes.data.reduce((min, s) =>
          new Date(s.created_at) < new Date(min.created_at) ? s : min
        )
        maxContinuousDays = Math.floor(
          (Date.now() - new Date(earliest.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )
      }

      setStats({ totalScore, totalSubscriptions, activeSubscriptions, maxContinuousDays })
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const currentRank = getRank(stats.totalScore)
  const nextRank = getNextRank(stats.totalScore)
  const progressToNext = nextRank
    ? Math.min(100, Math.round((stats.totalScore / nextRank.threshold) * 100))
    : 100

  const earnedBadges = BADGE_DEFS.filter((b) => b.check(stats))
  const notEarnedBadges = BADGE_DEFS.filter((b) => !b.check(stats))

  if (isLoading) {
    return (
      <div className="text-center py-16 text-muted-foreground">読み込み中...</div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">fan℃バッジ</h1>
        <p className="text-muted-foreground">応援活動で獲得したバッジとランクを確認できます</p>
      </div>

      {/* Rank Card */}
      <Card className={`border-2 ${currentRank.bg}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full bg-background ${currentRank.color}`}>
              <Trophy className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-muted-foreground">現在のランク</p>
                <Badge className={currentRank.badgeCls}>{currentRank.label}</Badge>
              </div>
              <p className="text-3xl font-bold">{stats.totalScore.toLocaleString()} <span className="text-lg font-normal text-muted-foreground">pt</span></p>
              {nextRank ? (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{nextRank.label}まで</span>
                    <span>{(nextRank.threshold - stats.totalScore).toLocaleString()} pt</span>
                  </div>
                  <Progress value={progressToNext} className="h-2" />
                </div>
              ) : (
                <p className="text-sm text-yellow-600 mt-2 font-medium">最高ランク達成！</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{earnedBadges.length}</p>
                <p className="text-sm text-muted-foreground">獲得バッジ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-sm text-muted-foreground">応援中タレント</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.maxContinuousDays}</p>
                <p className="text-sm text-muted-foreground">継続日数</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>獲得済みバッジ</CardTitle>
            <CardDescription>これまでに獲得したバッジ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-br from-muted/50 to-muted border"
                >
                  <div className={`p-3 rounded-full bg-background ${badge.color}`}>
                    <badge.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Yet Earned */}
      {notEarnedBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>未獲得のバッジ</CardTitle>
            <CardDescription>条件を達成すると獲得できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {notEarnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-dashed opacity-60"
                >
                  <div className="p-3 rounded-full bg-muted">
                    <badge.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{badge.name}</p>
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {earnedBadges.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>まだバッジを獲得していません</p>
            <p className="text-sm mt-1">タレントを応援してバッジを集めましょう！</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
