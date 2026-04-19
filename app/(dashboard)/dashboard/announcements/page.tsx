"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Megaphone, CheckCircle2, AlertCircle, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SentAnnouncement {
  id: string
  title: string
  body: string | null
  created_at: string
  recipientCount?: number
}

export default function AnnouncementsPage() {
  const searchParams = useSearchParams()
  const [talentId, setTalentId] = useState<string | null>(null)
  const [supporterCount, setSupporterCount] = useState(0)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [history, setHistory] = useState<SentAnnouncement[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get talent (prefer query param, then first active)
      const paramId = searchParams.get("talentId")
      const { data: talents } = await supabase
        .from("talents")
        .select("id, status")
        .eq("user_id", user.id)

      if (!talents || talents.length === 0) { setIsLoadingHistory(false); return }

      const selected =
        (paramId ? talents.find((t) => t.id === paramId) : null) ??
        talents.find((t) => t.status === "active") ??
        talents[0]

      setTalentId(selected.id)

      // Get active subscriber count
      const { count } = await supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("talent_id", selected.id)
        .eq("status", "active")

      setSupporterCount(count ?? 0)

      // Load sent announcement history (notifications of type "news" sent by this talent)
      const { data: sent } = await supabase
        .from("notifications")
        .select("id, title, body, created_at")
        .eq("type", "news")
        .like("link_url", `/community/${selected.id}%`)
        .order("created_at", { ascending: false })
        .limit(20)

      // Deduplicate by title+created_at (one entry per batch)
      const seen = new Set<string>()
      const deduped: SentAnnouncement[] = []
      for (const n of sent ?? []) {
        const key = `${n.title}::${n.created_at}`
        if (!seen.has(key)) {
          seen.add(key)
          deduped.push(n)
        }
      }
      setHistory(deduped)
      setIsLoadingHistory(false)
    }
    init()
  }, [searchParams])

  async function handleSend() {
    if (!talentId || !title.trim() || !message.trim()) return
    setIsSending(true)
    setResult(null)

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ talentId, title: title.trim(), message: message.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setResult({ type: "error", text: data.error ?? "送信に失敗しました" })
      } else {
        setResult({ type: "success", text: `${data.count}名のサポーターに送信しました` })
        setTitle("")
        setMessage("")
        // Prepend to history
        setHistory((prev) => [
          {
            id: crypto.randomUUID(),
            title: title.trim(),
            body: message.trim(),
            created_at: new Date().toISOString(),
          },
          ...prev,
        ])
      }
    } catch {
      setResult({ type: "error", text: "ネットワークエラーが発生しました" })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">お知らせ配信</h1>
        <p className="text-muted-foreground">サポーター全員に通知を送信します</p>
      </div>

      {/* Compose */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            お知らせを作成
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            現在のサポーター数：<span className="font-semibold text-foreground">{supporterCount}名</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              placeholder="例：新イベントのお知らせ"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">本文</Label>
            <Textarea
              id="message"
              placeholder="サポーターへのメッセージを入力してください"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">{message.length} / 1000</p>
          </div>

          {result && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                result.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              }`}
            >
              {result.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {result.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={isSending || !title.trim() || !message.trim() || supporterCount === 0}
            >
              {isSending ? "送信中..." : `${supporterCount}名に送信する`}
            </Button>
          </div>

          {supporterCount === 0 && (
            <p className="text-xs text-muted-foreground text-center">
              現在アクティブなサポーターがいません
            </p>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>送信履歴</CardTitle>
          <CardDescription>過去に送信したお知らせ</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              まだお知らせを送信していません
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="p-4 border rounded-lg space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{item.title}</p>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {new Date(item.created_at).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Badge>
                  </div>
                  {item.body && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.body}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
