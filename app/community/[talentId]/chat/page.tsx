"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Message {
  id: string
  content: string
  created_at: string
  user_id: string
  sender: { display_name: string | null } | null
}

export default function SalonChatPage() {
  const { talentId } = useParams<{ talentId: string }>()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isMember, setIsMember] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [operatorId, setOperatorId] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function fetchData() {
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
        const { data } = await supabase
          .from("community_messages")
          .select("id, content, created_at, user_id, sender:user_id(display_name)")
          .eq("talent_id", talentId)
          .order("created_at", { ascending: true })
          .limit(100)

        if (data) setMessages(data as unknown as Message[])

        // Realtime subscription
        channel = supabase
          .channel(`salon-chat-${talentId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "community_messages",
              filter: `talent_id=eq.${talentId}`,
            },
            async (payload) => {
              const row = payload.new as { id: string; content: string; created_at: string; user_id: string }
              const { data: senderData } = await supabase
                .from("users")
                .select("display_name")
                .eq("id", row.user_id)
                .single()
              const newMsg: Message = {
                ...row,
                sender: senderData ?? null,
              }
              setMessages((prev) => [...prev, newMsg])
            }
          )
          .subscribe()
      }

      setIsLoading(false)
    }

    fetchData()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [talentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!newMessage.trim() || !currentUserId) return
    setIsSending(true)
    const supabase = createClient()
    await supabase.from("community_messages").insert({
      talent_id: talentId,
      user_id: currentUserId,
      content: newMessage.trim(),
    })
    setNewMessage("")
    setIsSending(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isOperator = currentUserId === operatorId

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
  }

  if (!isMember) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold">グループチャット</h1>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-12 text-center space-y-3">
            <Lock className="h-10 w-10 mx-auto text-primary" />
            <h3 className="font-semibold text-lg">メンバー限定チャット</h3>
            <p className="text-sm text-muted-foreground">
              サロンに参加すると、タレントや他のメンバーとリアルタイムでチャットできます
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
    <div className="space-y-4">
      <h1 className="text-xl font-bold">グループチャット</h1>

      <Card className="flex flex-col h-[600px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              まだメッセージがありません。最初のメッセージを送ってみましょう！
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.user_id === currentUserId
              const isFromOperator = msg.user_id === operatorId
              const name = msg.sender?.display_name ?? "匿名"
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  {!isMe && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col gap-1 max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">{name}</span>
                        {isFromOperator && (
                          <Badge variant="secondary" className="text-xs py-0 px-1.5">タレント</Badge>
                        )}
                      </div>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="flex-1"
            disabled={isSending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  )
}
