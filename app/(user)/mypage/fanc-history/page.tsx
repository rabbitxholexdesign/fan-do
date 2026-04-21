"use client"

import { useState, useEffect } from "react"
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

const ACTION_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  subscription:        { label: "サブスク",     bg: "bg-sky-100",    text: "text-sky-700" },
  sns_share:           { label: "SNSシェア",    bg: "bg-violet-100", text: "text-violet-700" },
  event_participation: { label: "イベント参加", bg: "bg-emerald-100",text: "text-emerald-700" },
  community_activity:  { label: "サロン活動",  bg: "bg-orange-100", text: "text-orange-700" },
  bonus:               { label: "ボーナス",     bg: "bg-amber-100",  text: "text-amber-700" },
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-1">マイページ</p>
        <h1 className="text-2xl font-bold text-slate-800">fan℃履歴</h1>
        <p className="text-slate-500 mt-1">fan℃スコアの獲得履歴</p>
      </div>

      {/* Score Card */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 shadow-lg shadow-slate-200/50 p-6">
        <div className="flex items-center gap-8">
          <FanTemperatureMeter temperature={temperature} size="md" />
          <div>
            <p className="text-sm text-slate-500 mb-1">トータル fan℃ スコア</p>
            <p className="text-5xl font-bold text-slate-800">{totalScore.toLocaleString()}</p>
            <p className="text-sm text-slate-400 mt-1">pt</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">獲得履歴</h2>
          <p className="text-sm text-slate-400 mt-0.5">最新50件</p>
        </div>
        <div className="divide-y divide-slate-50">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-slate-400">読み込み中...</div>
          ) : events.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="text-4xl mb-3">🌡️</div>
              <p className="text-slate-500">まだ fan℃ の獲得履歴がありません</p>
            </div>
          ) : (
            events.map((event) => {
              const cfg = ACTION_CONFIG[event.action_type] ?? { label: event.action_type, bg: "bg-slate-100", text: "text-slate-600" }
              return (
                <div key={event.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {event.description ?? event.action_type}
                      </p>
                      <p className="text-xs text-slate-400">
                        {event.talent?.name && `${event.talent.name} · `}
                        {new Date(event.earned_at).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>
                  <span className="text-sky-600 font-bold shrink-0 ml-4">+{event.score}℃</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
