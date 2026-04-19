"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { createClient } from "@/lib/supabase/client"

interface FancEvent {
  id: string
  score: number
  action_type: string
  description: string | null
  earned_at: string
  talent: { name: string } | null
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  subscription: { label: "サブスク", color: "bg-blue-100 text-blue-700" },
  sns_share: { label: "SNSシェア", color: "bg-purple-100 text-purple-700" },
  event_participation: { label: "イベント参加", color: "bg-green-100 text-green-700" },
  community_activity: { label: "サロン活動", color: "bg-orange-100 text-orange-700" },
  bonus: { label: "ボーナス", color: "bg-yellow-100 text-yellow-700" },
}

export default function FancHistoryPage() {
  const [events, setEvents] = useState<FancEvent[]>([])
  const [totalScore, setTotalScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data } = await supabase
        .from("fanc_scores")
        .select("id, score, action_type, description, earned_at, talent:talent_id(name)")
        .eq("fan_id", user.id)
        .order("earned_at", { ascending: false })
        .limit(50)

      if (data) {
        setEvents(data as unknown as FancEvent[])
        setTotalScore(data.reduce((sum, e) => sum + e.score, 0))
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const temperature = Math.min(100, Math.round(totalScore / 100))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">fan℃履歴</h1>
        <p className="text-muted-foreground">fan℃スコアの獲得履歴</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <FanTemperatureMeter temperature={temperature} size="md" />
            <div>
              <p className="text-sm text-muted-foreground">トータルfan℃スコア</p>
              <p className="text-4xl font-bold">{totalScore.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">pt</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>獲得履歴</CardTitle>
          <CardDescription>最新50件</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              まだfan℃の獲得履歴がありません
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const actionInfo = ACTION_LABELS[event.action_type] ?? { label: event.action_type, color: "bg-gray-100 text-gray-700" }
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${actionInfo.color}`}>
                        {actionInfo.label}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {event.description ?? event.action_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.talent?.name && `${event.talent.name} · `}
                          {new Date(event.earned_at).toLocaleDateString("ja-JP")}
                        </p>
                      </div>
                    </div>
                    <span className="text-primary font-bold shrink-0 ml-4">+{event.score}℃</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
