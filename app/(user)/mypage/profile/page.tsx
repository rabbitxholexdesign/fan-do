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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-1">マイページ</p>
          <h1 className="text-2xl font-bold text-slate-800">プロフィール</h1>
          <p className="text-slate-500 mt-0.5">あなたの情報を管理します</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 ${
            isEditing
              ? "bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-500/20"
              : "border border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4" />
              保存
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4" />
              編集
            </>
          )}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info Card */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">基本情報</h2>

          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-sky-100">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-2xl bg-sky-100 text-sky-600 font-bold">{user.name[0]}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-sky-500 text-white rounded-full shadow-lg hover:bg-sky-600 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{user.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-600 font-medium">表示名</Label>
              <Input
                id="name"
                defaultValue={user.name}
                disabled={!isEditing}
                className="rounded-xl border-slate-200 focus:border-sky-300 focus:ring-sky-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-600 font-medium">地域</Label>
              <Input
                id="location"
                defaultValue={user.location}
                disabled={!isEditing}
                className="rounded-xl border-slate-200 focus:border-sky-300 focus:ring-sky-200"
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label htmlFor="bio" className="text-slate-600 font-medium">自己紹介</Label>
            <Textarea
              id="bio"
              defaultValue={user.bio}
              disabled={!isEditing}
              rows={4}
              className="rounded-xl border-slate-200 focus:border-sky-300 focus:ring-sky-200 resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-400" />
              {user.location}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-400" />
              {user.joinedAt}から利用
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-4">
          {/* Fan Temperature */}
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100 shadow-lg shadow-slate-200/50 p-5">
            <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-4">あなたの fan℃</p>
            <div className="flex flex-col items-center py-2">
              <FanTemperatureMeter temperature={user.totalFanScore} size="lg" />
              <p className="text-sm text-slate-500 mt-4 text-center">
                応援活動の熱量を表しています
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-5">
            <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-3">獲得バッジ</p>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <span
                  key={badge}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Activity Summary */}
          <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 p-5">
            <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-4">活動サマリー</p>
            <dl className="space-y-3">
              <div className="flex justify-between items-center">
                <dt className="text-sm text-slate-500">応援中タレント</dt>
                <dd className="font-semibold text-slate-800">{user.supportingCount}人</dd>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                <dt className="text-sm text-slate-500">獲得バッジ</dt>
                <dd className="font-semibold text-slate-800">{user.badges.length}個</dd>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-3">
                <dt className="text-sm text-slate-500">総合 fan℃</dt>
                <dd className="font-semibold text-sky-600">{user.totalFanScore}℃</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
