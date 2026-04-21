"use client"

import { useState, useEffect } from "react"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp } from "lucide-react"

interface FancEvent {
  id: string
  score: number
  action_type: string
  description: string | null
  earned_at: string
  talent: { name: string } | null
}

const ACTION_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  subscription:        { label: "サブスク",     bg: "bg-[#EFF8FF]", text: "text-[#175CD3]" },
  sns_share:           { label: "SNSシェア",    bg: "bg-[#F4F3FF]", text: "text-[#5925DC]" },
  event_participation: { label: "イベント参加", bg: "bg-[#ECFDF3]", text: "text-[#027A48]" },
  community_activity:  { label: "サロン活動",  bg: "bg-[#FFF6ED]", text: "text-[#B93815]" },
  bonus:               { label: "ボーナス",     bg: "bg-[#FFFAEB]", text: "text-[#B54708]" },
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
      <div>
        <h1 className="text-2xl font-semibold text-[#101828]">fan℃履歴</h1>
        <p className="text-sm text-[#475467] mt-1">fan℃スコアの獲得履歴</p>
      </div>

      {/* Score Card */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <FanTemperatureMeter temperature={temperature} size="md" />
          <div className="flex-1">
            <p className="text-sm text-[#475467]">トータル fan℃ スコア</p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-4xl font-semibold text-[#101828]">{totalScore.toLocaleString()}</p>
              <span className="text-sm text-[#475467]">pt</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-[#ECFDF3] rounded-full">
            <TrendingUp className="w-3 h-3 text-[#027A48]" />
            <span className="text-xs font-medium text-[#027A48]">累計</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E4E7EC]">
          <h2 className="text-base font-semibold text-[#101828]">獲得履歴</h2>
          <p className="text-sm text-[#475467] mt-0.5">最新50件</p>
        </div>

        {isLoading ? (
          <div className="px-6 py-12 text-center text-[#475467] text-sm">読み込み中...</div>
        ) : events.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-4xl mb-3">🌡️</div>
            <p className="text-[#475467] text-sm">まだ fan℃ の獲得履歴がありません</p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E7EC]">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#F9FAFB] text-xs font-medium text-[#475467]">
              <div className="col-span-3">種別</div>
              <div className="col-span-5">内容</div>
              <div className="col-span-2">タレント</div>
              <div className="col-span-1 text-right">獲得</div>
              <div className="col-span-1 text-right">日付</div>
            </div>
            {events.map((event) => {
              const cfg = ACTION_CONFIG[event.action_type] ?? { label: event.action_type, bg: "bg-[#F2F4F7]", text: "text-[#344054]" }
              return (
                <div key={event.id} className="grid grid-cols-12 gap-4 px-6 py-3.5 hover:bg-[#F9FAFB] transition-colors items-center">
                  <div className="col-span-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="col-span-5">
                    <p className="text-sm text-[#101828] truncate">{event.description ?? event.action_type}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#475467] truncate">{event.talent?.name ?? "—"}</p>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-sm font-semibold text-sky-600">+{event.score}℃</span>
                  </div>
                  <div className="col-span-1 text-right">
                    <p className="text-xs text-[#667085]">
                      {new Date(event.earned_at).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
