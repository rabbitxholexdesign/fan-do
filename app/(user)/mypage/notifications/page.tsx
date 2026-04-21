"use client"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  community_post: { label: "サロン更新", bg: "bg-orange-100", text: "text-orange-700", icon: MessageCircle },
  support:        { label: "支援",       bg: "bg-sky-100",    text: "text-sky-700",    icon: Heart },
  billing:        { label: "お支払い",   bg: "bg-emerald-100",text: "text-emerald-700",icon: CreditCard },
  news:           { label: "お知らせ",   bg: "bg-violet-100", text: "text-violet-700", icon: Megaphone },
  kyc:            { label: "審査",       bg: "bg-amber-100",  text: "text-amber-700",  icon: Bell },
  system:         { label: "システム",   bg: "bg-slate-100",  text: "text-slate-600",  icon: Bell },
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-1">マイページ</p>
        <h1 className="text-2xl font-bold text-slate-800">通知</h1>
        <p className="text-slate-500 mt-1">お知らせと通知設定</p>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList className="bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
          <TabsTrigger value="inbox" className="rounded-lg flex items-center gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            <Inbox className="h-4 w-4" />
            受信トレイ
            {unreadCount > 0 && (
              <span className="ml-1 min-w-[1.25rem] h-5 px-1.5 bg-sky-500 data-[state=active]:bg-white data-[state=active]:text-sky-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg flex items-center gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white">
            <Bell className="h-4 w-4" />
            通知設定
          </TabsTrigger>
        </TabsList>

        {/* 受信トレイ */}
        <TabsContent value="inbox" className="mt-6 space-y-4">
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm font-medium px-4 py-2 rounded-full hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                すべて既読にする
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl bg-white border border-slate-100 h-20 animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 py-16 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-slate-200" />
              <p className="text-slate-500">通知はありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system
                const Icon = cfg.icon
                return (
                  <div
                    key={n.id}
                    className={`relative rounded-2xl border p-5 transition-all duration-200 ${
                      n.is_read
                        ? "bg-white border-slate-100 shadow-sm shadow-slate-200/30"
                        : "bg-sky-50/50 border-sky-200 shadow-lg shadow-slate-200/50"
                    }`}
                    onClick={() => { if (!n.is_read) markAsRead(n.id) }}
                    role={n.is_read ? undefined : "button"}
                    style={{ cursor: n.is_read ? "default" : "pointer" }}
                  >
                    {!n.is_read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-sky-500" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${cfg.bg}`}>
                        <Icon className={`h-4 w-4 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-slate-400">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className="font-semibold text-sm text-slate-800 mt-1">{n.title}</p>
                        {n.body && (
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                        )}
                        {n.link_url && (
                          <Link
                            href={n.link_url}
                            className="inline-flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600 font-medium mt-1.5 transition-colors"
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
        <TabsContent value="settings" className="mt-6 space-y-4">
          <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-sky-500" />
                通知の受け取り
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">全体の通知設定を管理します</p>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-medium text-slate-700">すべての通知を受け取る</Label>
                  <p className="text-sm text-slate-500">
                    オフにするとすべての通知が停止されます
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">通知の種類</h2>
              <p className="text-sm text-slate-500 mt-0.5">種類ごとに通知方法を設定できます</p>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-[1fr_80px_80px] gap-4 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">
                <div />
                <div className="flex items-center justify-center gap-1">
                  <Mail className="h-3.5 w-3.5" />メール
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Bell className="h-3.5 w-3.5" />サイト内
                </div>
              </div>
              {[
                { id: "community", label: "サロン更新", desc: "応援中タレントの新しい投稿", emailDef: true, pushDef: true, icon: MessageCircle, bg: "bg-orange-100", text: "text-orange-600" },
                { id: "support", label: "支援関連", desc: "支援の完了や更新のお知らせ", emailDef: true, pushDef: true, icon: Heart, bg: "bg-sky-100", text: "text-sky-600" },
                { id: "billing", label: "お支払い", desc: "請求や決済に関するお知らせ", emailDef: true, pushDef: false, icon: CreditCard, bg: "bg-emerald-100", text: "text-emerald-600" },
                { id: "news", label: "お知らせ", desc: "fan℃からの重要なお知らせ", emailDef: true, pushDef: false, icon: Megaphone, bg: "bg-violet-100", text: "text-violet-600" },
              ].map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_80px] gap-4 items-center py-4 border-t border-slate-50">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${item.bg} shrink-0`}>
                      <item.icon className={`h-4 w-4 ${item.text}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
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
          </div>

          <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <Mail className="h-5 w-5 text-sky-500" />
                メール配信
              </h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="font-medium text-slate-700">ダイジェストメール</Label>
                  <p className="text-sm text-slate-500">週1回、応援中タレントの活動まとめ</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-50">
                <div className="space-y-0.5">
                  <Label className="font-medium text-slate-700">プロモーションメール</Label>
                  <p className="text-sm text-slate-500">新機能やキャンペーンのお知らせ</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
