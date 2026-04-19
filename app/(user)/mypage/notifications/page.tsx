"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Bell, Mail, MessageCircle, Heart, CreditCard, Megaphone,
  CheckCheck, ExternalLink, Inbox,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  link_url: string | null
  is_read: boolean
  created_at: string
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  community_post: { label: "サロン更新", color: "bg-orange-100 text-orange-700", icon: MessageCircle },
  support:        { label: "支援",       color: "bg-blue-100 text-blue-700",   icon: Heart },
  billing:        { label: "お支払い",   color: "bg-green-100 text-green-700", icon: CreditCard },
  news:           { label: "お知らせ",   color: "bg-purple-100 text-purple-700", icon: Megaphone },
  kyc:            { label: "審査",       color: "bg-yellow-100 text-yellow-700", icon: Bell },
  system:         { label: "システム",   color: "bg-gray-100 text-gray-700",   icon: Bell },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "たった今"
  if (mins < 60) return `${mins}分前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}日前`
  return new Date(dateStr).toLocaleDateString("ja-JP")
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  async function fetchNotifications() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsLoading(false); return }

    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, body, link_url, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) setNotifications(data as Notification[])
    setIsLoading(false)
  }

  async function markAsRead(id: string) {
    const supabase = createClient()
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  async function markAllAsRead() {
    setMarkingAll(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMarkingAll(false); return }

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">通知</h1>
        <p className="text-muted-foreground">お知らせと通知設定</p>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            受信トレイ
            {unreadCount > 0 && (
              <Badge className="ml-1 h-5 px-1.5 text-xs">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            通知設定
          </TabsTrigger>
        </TabsList>

        {/* 受信トレイ */}
        <TabsContent value="inbox" className="mt-6 space-y-4">
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={markingAll}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                すべて既読にする
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center space-y-2">
                <Bell className="h-10 w-10 mx-auto text-muted-foreground/40" />
                <p className="text-muted-foreground">通知はありません</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system
                const Icon = cfg.icon
                return (
                  <div
                    key={n.id}
                    className={`relative rounded-xl border p-4 transition-colors ${
                      n.is_read ? "bg-background" : "bg-primary/5 border-primary/20"
                    }`}
                    onClick={() => { if (!n.is_read) markAsRead(n.id) }}
                    role={n.is_read ? undefined : "button"}
                    style={{ cursor: n.is_read ? "default" : "pointer" }}
                  >
                    {!n.is_read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${cfg.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.color}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className="font-medium text-sm mt-1">{n.title}</p>
                        {n.body && (
                          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        )}
                        {n.link_url && (
                          <Link
                            href={n.link_url}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            詳細を見る
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="settings" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                通知の受け取り
              </CardTitle>
              <CardDescription>全体の通知設定を管理します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>すべての通知を受け取る</Label>
                  <p className="text-sm text-muted-foreground">
                    オフにするとすべての通知が停止されます
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>通知の種類</CardTitle>
              <CardDescription>種類ごとに通知方法を設定できます</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-[1fr_80px_80px] gap-4 text-sm font-medium text-muted-foreground">
                  <div />
                  <div className="flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4" />メール
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Bell className="h-4 w-4" />サイト内
                  </div>
                </div>
                {[
                  { id: "community", label: "サロン更新", desc: "応援中タレントの新しい投稿", emailDef: true, pushDef: true, icon: MessageCircle },
                  { id: "support", label: "支援関連", desc: "支援の完了や更新のお知らせ", emailDef: true, pushDef: true, icon: Heart },
                  { id: "billing", label: "お支払い", desc: "請求や決済に関するお知らせ", emailDef: true, pushDef: false, icon: CreditCard },
                  { id: "news", label: "お知らせ", desc: "fan℃からの重要なお知らせ", emailDef: true, pushDef: false, icon: Megaphone },
                ].map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_80px_80px] gap-4 items-center py-4 border-t">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Switch defaultChecked={item.emailDef} />
                    </div>
                    <div className="flex justify-center">
                      <Switch defaultChecked={item.pushDef} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                メール配信
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>ダイジェストメール</Label>
                  <p className="text-sm text-muted-foreground">週1回、応援中タレントの活動まとめ</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2 border-t">
                <div className="space-y-0.5">
                  <Label>プロモーションメール</Label>
                  <p className="text-sm text-muted-foreground">新機能やキャンペーンのお知らせ</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
