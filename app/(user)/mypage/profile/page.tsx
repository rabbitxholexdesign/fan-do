"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { Badge } from "@/components/ui/badge"
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">プロフィール</h1>
          <p className="text-muted-foreground">あなたの情報を管理します</p>
        </div>
        <Button
          variant={isEditing ? "default" : "outline"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              保存
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              編集
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>プロフィール情報を設定します</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">表示名</Label>
                <Input id="name" defaultValue={user.name} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">地域</Label>
                <Input id="location" defaultValue={user.location} disabled={!isEditing} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea id="bio" defaultValue={user.bio} disabled={!isEditing} rows={4} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {user.location}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {user.joinedAt}から利用
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">あなたの fan℃</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <FanTemperatureMeter temperature={user.totalFanScore} size="lg" />
              <p className="text-sm text-muted-foreground mt-4 text-center">
                応援活動の熱量を表しています
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">獲得バッジ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">活動サマリー</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">応援中タレント</dt>
                  <dd className="font-semibold">{user.supportingCount}人</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">獲得バッジ</dt>
                  <dd className="font-semibold">{user.badges.length}個</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">総合fan℃</dt>
                  <dd className="font-semibold text-primary">{user.totalFanScore}℃</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
