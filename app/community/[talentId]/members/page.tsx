"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Lock, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"

interface Member {
  id: string
  fan_id: string
  created_at: string
  fan: { display_name: string | null } | null
  plan: { name: string } | null
  fanc_score: number
}

export default function SalonMembersPage() {
  const { talentId } = useParams<{ talentId: string }>()

  const [members, setMembers] = useState<Member[]>([])
  const [isMember, setIsMember] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [operatorId, setOperatorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)

      const { data: talent } = await supabase
        .from("talents")
        .select("operator_id")
        .eq("id", talentId)
        .single()
      setOperatorId(talent?.operator_id ?? null)

      let member = false
      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("fan_id", user.id)
          .eq("talent_id", talentId)
          .eq("status", "active")
          .limit(1)
          .single()
        member = !!sub || talent?.operator_id === user.id
      }
      setIsMember(member)

      if (member) {
        const { data: subs } = await supabase
          .from("subscriptions")
          .select("id, fan_id, created_at, fan:fan_id(display_name), plan:plan_id(name)")
          .eq("talent_id", talentId)
          .eq("status", "active")
          .order("created_at", { ascending: false })

        if (subs) {
          // Fetch total fanc score per fan
          const fanIds = subs.map((s) => s.fan_id)
          const { data: scores } = await supabase
            .from("fanc_scores")
            .select("fan_id, score")
            .eq("talent_id", talentId)
            .in("fan_id", fanIds)

          const scoreMap: Record<string, number> = {}
          if (scores) {
            for (const s of scores) {
              scoreMap[s.fan_id] = (scoreMap[s.fan_id] ?? 0) + s.score
            }
          }

          setMembers(
            subs.map((s) => ({
              id: s.id,
              fan_id: s.fan_id,
              created_at: s.created_at,
              fan: s.fan as { display_name: string | null } | null,
              plan: s.plan as { name: string } | null,
              fanc_score: scoreMap[s.fan_id] ?? 0,
            }))
          )
        }
      }

      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
  }

  if (!isMember) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold">メンバー</h1>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-12 text-center space-y-3">
            <Lock className="h-10 w-10 mx-auto text-primary" />
            <h3 className="font-semibold text-lg">メンバー限定ページ</h3>
            <p className="text-sm text-muted-foreground">
              サロンに参加すると、他のメンバーの一覧が見られます
            </p>
            <Button asChild>
              <Link href={`/talents/${talentId}#plans`}>応援プランを見る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">メンバー</h1>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{members.length}人</span>
        </div>
      </div>

      {members.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            まだメンバーがいません
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">アクティブメンバー</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {members.map((member) => {
                const name = member.fan?.display_name ?? "匿名"
                const isMe = member.fan_id === currentUserId
                const isOperatorMember = member.fan_id === operatorId
                const temperature = Math.min(100, Math.round(member.fanc_score / 100))
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{name}</span>
                        {isOperatorMember && (
                          <Badge variant="secondary" className="text-xs shrink-0">タレント</Badge>
                        )}
                        {isMe && !isOperatorMember && (
                          <Badge variant="outline" className="text-xs shrink-0">あなた</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {member.plan?.name ?? "—"} ·{" "}
                        {new Date(member.created_at).toLocaleDateString("ja-JP")}から
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <FanTemperatureMeter temperature={temperature} size="sm" showLabel={false} />
                      <span className="text-xs font-medium text-primary">
                        {member.fanc_score.toLocaleString()}℃
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
