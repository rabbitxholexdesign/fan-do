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
  community_post: { label: "サロン更新", bg: "bg-[#FFF6ED]", text: "text-[#B93815]", icon: MessageCircle },
  support:        { label: "支援",       bg: "bg-[#EFF8FF]", text: "text-[#175CD3]", icon: Heart },
  billing:        { label: "お支払い",   bg: "bg-[#ECFDF3]", text: "text-[#027A48]", icon: CreditCard },
  news:           { label: "お知らせ",   bg: "bg-[#F4F3FF]", text: "text-[#5925DC]", icon: Megaphone },
  kyc:            { label: "審査",       bg: "bg-[#FFFAEB]", text: "text-[#B54708]", icon: Bell },
  system:         { label: "システム",   bg: "bg-[#F2F4F7]", text: "text-[#344054]", icon: Bell },
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

  useEffect(() => { fetchNotifications() }, [])

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
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setMarkingAll(false)
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#101828]">通知</h1>
        <p className="text-sm text-[#475467] mt-1">お知らせと通知設定</p>
      </div>

      <Tabs defaultValue="inbox">
        <TabsList className="bg-white border border-[#E4E7EC] rounded-lg p-1 shadow-sm">
          <TabsTrigger value="inbox" className="rounded-md flex items-center gap-2 text-[#475467] data-[state=active]:bg-[#F9FAFB] data-[state=active]:text-[#101828]">
            <Inbox className="h-4 w-4" />
            受信トレイ
            {unreadCount > 0 && (
              <span className="ml-1 bg-[#F2F4F7] text-[#344054] text-xs font-medium px-1.5 py-0.5 rounded-full border border-[#E4E7EC]">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-md flex items-center gap-2 text-[#475467] data-[state=active]:bg-[#F9FAFB] data-[state=active]:text-[#101828]">
            <Bell className="h-4 w-4" />
            通知設定
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="mt-6 space-y-4">
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={markAllAsRead}
                disabled={markingAll}
                className="flex items-center gap-2 border border-[#D0D5DD] text-[#344054] text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#F9FAFB] transition-colors shadow-sm disabled:opacity-50"
              >
                <CheckCheck className="h-4 w-4" />
                すべて既読にする
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm px-6 py-12 text-center text-[#475467] text-sm">読み込み中...</div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm py-16 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-[#D0D5DD]" />
              <p className="text-[#475467] text-sm">通知はありません</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden divide-y divide-[#E4E7EC]">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system
                const Icon = cfg.icon
                return (
                  <div
                    key={n.id}
                    className={`relative p-5 transition-colors ${n.is_read ? "hover:bg-[#F9FAFB]" : "bg-[#F9FAFB]"}`}
                    onClick={() => { if (!n.is_read) markAsRead(n.id) }}
                    role={n.is_read ? undefined : "button"}
                    style={{ cursor: n.is_read ? "default" : "pointer" }}
                  >
                    {!n.is_read && (
                      <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-sky-500" />
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 ${cfg.bg}`}>
                        <Icon className={`h-4 w-4 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                          <span className="text-xs text-[#667085]">{timeAgo(n.created_at)}</span>
                        </div>
                        <p className="font-medium text-sm text-[#101828] mt-1">{n.title}</p>
                        {n.body && <p className="text-sm text-[#475467] mt-0.5 line-clamp-2">{n.body}</p>}
                        {n.link_url && (
                          <Link href={n.link_url} className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium mt-1.5 transition-colors" onClick={(e) => e.stopPropagation()}>
                            詳細を見る <ExternalLink className="h-3 w-3" />
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

        <TabsContent value="settings" className="mt-6 space-y-4">
          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E4E7EC]">
              <h2 className="font-semibold text-[#101828] flex items-center gap-2"><Bell className="h-5 w-5 text-[#667085]" />通知の受け取り</h2>
              <p className="text-sm text-[#475467] mt-0.5">全体の通知設定を管理します</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <Label className="font-medium text-[#101828]">すべての通知を受け取る</Label>
                <p className="text-sm text-[#475467]">オフにするとすべての通知が停止されます</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E4E7EC]">
              <h2 className="font-semibold text-[#101828]">通知の種類</h2>
              <p className="text-sm text-[#475467] mt-0.5">種類ごとに通知方法を設定できます</p>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-[1fr_80px_80px] gap-4 text-xs font-medium text-[#475467] uppercase tracking-wide mb-4">
                <div />
                <div className="flex items-center justify-center gap-1"><Mail className="h-3.5 w-3.5" />メール</div>
                <div className="flex items-center justify-center gap-1"><Bell className="h-3.5 w-3.5" />サイト内</div>
              </div>
              {[
                { id: "community", label: "サロン更新", desc: "応援中タレントの新しい投稿", emailDef: true, pushDef: true, icon: MessageCircle, bg: "bg-[#FFF6ED]", text: "text-[#B93815]" },
                { id: "support", label: "支援関連", desc: "支援の完了や更新のお知らせ", emailDef: true, pushDef: true, icon: Heart, bg: "bg-[#EFF8FF]", text: "text-[#175CD3]" },
                { id: "billing", label: "お支払い", desc: "請求や決済に関するお知らせ", emailDef: true, pushDef: false, icon: CreditCard, bg: "bg-[#ECFDF3]", text: "text-[#027A48]" },
                { id: "news", label: "お知らせ", desc: "fan℃からの重要なお知らせ", emailDef: true, pushDef: false, icon: Megaphone, bg: "bg-[#F4F3FF]", text: "text-[#5925DC]" },
              ].map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_80px_80px] gap-4 items-center py-4 border-t border-[#F2F4F7]">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${item.bg} shrink-0`}>
                      <item.icon className={`h-4 w-4 ${item.text}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#101828]">{item.label}</p>
                      <p className="text-xs text-[#667085]">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex justify-center"><Switch defaultChecked={item.emailDef} /></div>
                  <div className="flex justify-center"><Switch defaultChecked={item.pushDef} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E4E7EC]">
              <h2 className="font-semibold text-[#101828] flex items-center gap-2"><Mail className="h-5 w-5 text-[#667085]" />メール配信</h2>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label className="font-medium text-[#101828]">ダイジェストメール</Label>
                  <p className="text-sm text-[#475467]">週1回、応援中タレントの活動まとめ</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[#F2F4F7]">
                <div>
                  <Label className="font-medium text-[#101828]">プロモーションメール</Label>
                  <p className="text-sm text-[#475467]">新機能やキャンペーンのお知らせ</p>
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
