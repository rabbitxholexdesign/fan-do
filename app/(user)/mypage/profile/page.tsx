"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { Camera, Mail, MapPin, Calendar, Edit2, Save } from "lucide-react"

export default function MyPageProfile() {
  const [isEditing, setIsEditing] = useState(false)

  const user = {
    name: "山田 花子",
    email: "hanako@example.com",
    avatar: "",
    bio: "地域の魅力を発信するクリエイターを応援しています。特に伝統工芸や地方のアーティストに興味があります。",
    location: "長崎県 長崎市",
    joinedAt: "2023年10月",
    totalFanScore: 185,
    supportingCount: 3,
    badges: ["アーリーサポーター", "月間MVPファン", "100日連続応援"],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#101828]">プロフィール</h1>
          <p className="text-sm text-[#475467] mt-0.5">あなたの情報を管理します</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm ${
            isEditing
              ? "bg-sky-500 text-white border border-sky-500 hover:bg-sky-600"
              : "bg-white text-[#344054] border border-[#D0D5DD] hover:bg-[#F9FAFB]"
          }`}
        >
          {isEditing ? <><Save className="h-4 w-4" />保存</> : <><Edit2 className="h-4 w-4" />編集</>}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 bg-white border border-[#E4E7EC] rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-[#101828] mb-5">基本情報</h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-600 font-semibold">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-sky-500 text-white rounded-lg shadow-lg hover:bg-sky-600 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#101828]">{user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-[#475467] mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-[#344054]">表示名</Label>
              <Input id="name" defaultValue={user.name} disabled={!isEditing} className="rounded-lg border-[#D0D5DD]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-[#344054]">地域</Label>
              <Input id="location" defaultValue={user.location} disabled={!isEditing} className="rounded-lg border-[#D0D5DD]" />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="bio" className="text-sm font-medium text-[#344054]">自己紹介</Label>
            <Textarea id="bio" defaultValue={user.bio} disabled={!isEditing} rows={4} className="rounded-lg border-[#D0D5DD] resize-none" />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-[#475467] pt-5 border-t border-[#E4E7EC]">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#98A2B3]" />{user.location}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-[#98A2B3]" />{user.joinedAt}から利用</div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-[#475467] uppercase tracking-wider mb-4">あなたの fan℃</p>
            <div className="flex flex-col items-center py-2">
              <FanTemperatureMeter temperature={user.totalFanScore} size="lg" />
              <p className="text-sm text-[#475467] mt-4 text-center">応援活動の熱量を表しています</p>
            </div>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-[#475467] uppercase tracking-wider mb-3">獲得バッジ</p>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <span key={badge} className="text-xs px-2.5 py-1 rounded-full bg-[#F2F4F7] text-[#344054] font-medium border border-[#E4E7EC]">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-sm p-5">
            <p className="text-xs font-medium text-[#475467] uppercase tracking-wider mb-4">活動サマリー</p>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-sm text-[#475467]">応援中タレント</dt>
                <dd className="font-semibold text-[#101828]">{user.supportingCount}人</dd>
              </div>
              <div className="flex justify-between items-center border-t border-[#F2F4F7] pt-3">
                <dt className="text-sm text-[#475467]">獲得バッジ</dt>
                <dd className="font-semibold text-[#101828]">{user.badges.length}個</dd>
              </div>
              <div className="flex justify-between items-center border-t border-[#F2F4F7] pt-3">
                <dt className="text-sm text-[#475467]">総合 fan℃</dt>
                <dd className="font-semibold text-sky-600">{user.totalFanScore}℃</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
