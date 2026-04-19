"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Camera, 
  Save, 
  Plus,
  Trash2,
  CreditCard,
  Shield,
  CheckCircle
} from "lucide-react"

// Mock data
const talentData = {
  name: "山田工房",
  description: "石川県で輪島塗を100年以上続ける工房です。伝統を守りながら、現代の暮らしに合う器を制作しています。",
  category: "伝統工芸",
  location: "石川県",
  coverImage: "/placeholder.svg?height=300&width=800",
  profileImage: "/placeholder.svg?height=200&width=200",
  website: "https://yamada-kobo.example.com",
  twitter: "@yamada_kobo",
  instagram: "yamada_kobo",
}

const supportPlans = [
  { id: "1", name: "ライトプラン", price: 500, description: "活動報告の閲覧、コミュニティへの参加" },
  { id: "2", name: "スタンダードプラン", price: 1000, description: "ライト特典 + 限定コンテンツ、月1回のオンライン交流会" },
  { id: "3", name: "プレミアムプラン", price: 3000, description: "スタンダード特典 + 制作過程の動画、年1回の工房見学" },
]

export default function DashboardSettingsPage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">設定</h1>
          <p className="text-muted-foreground">タレントの設定を管理します</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">プロフィール</TabsTrigger>
          <TabsTrigger value="plans">支援プラン</TabsTrigger>
          <TabsTrigger value="payment">振込先</TabsTrigger>
          <TabsTrigger value="legal">特商法表記</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle>カバー画像</CardTitle>
              <CardDescription>タレントページのヘッダーに表示されます</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[3/1] rounded-lg overflow-hidden bg-muted">
                <Image
                  src={talentData.coverImage}
                  alt="カバー画像"
                  fill
                  className="object-cover"
                />
                <button className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                  <Camera className="h-5 w-5" />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>タレントの基本情報を設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                    <Image
                      src={talentData.profileImage}
                      alt="プロフィール画像"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="font-medium">プロフィール画像</p>
                  <p className="text-sm text-muted-foreground">
                    推奨サイズ: 400x400px
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">タレント名</Label>
                  <Input id="name" defaultValue={talentData.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <Select defaultValue={talentData.category}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="伝統工芸">伝統工芸</SelectItem>
                      <SelectItem value="アート">アート</SelectItem>
                      <SelectItem value="音楽">音楽</SelectItem>
                      <SelectItem value="飲食">飲食</SelectItem>
                      <SelectItem value="地域振興">地域振興</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">活動地域</Label>
                <Input id="location" defaultValue={talentData.location} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">紹介文</Label>
                <Textarea
                  id="description"
                  defaultValue={talentData.description}
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="website">Webサイト</Label>
                  <Input id="website" defaultValue={talentData.website} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">X (Twitter)</Label>
                  <Input id="twitter" defaultValue={talentData.twitter} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" defaultValue={talentData.instagram} />
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                変更を保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>支援プラン</CardTitle>
                <CardDescription>サポーター向けのプランを設定します</CardDescription>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                プランを追加
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportPlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{plan.name}</p>
                        <Badge variant="secondary">¥{plan.price.toLocaleString()}/月</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">編集</Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                振込先口座
              </CardTitle>
              <CardDescription>収益の振込先を設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-green-100">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">○○銀行 ○○支店</p>
                    <p className="text-sm text-muted-foreground">普通 ****1234 / ヤマダ タロウ</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">変更</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                ※口座情報の変更には本人確認が必要です
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                本人確認
              </CardTitle>
              <CardDescription>KYC認証の状態</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">認証済み</p>
                    <p className="text-sm text-green-600">2024年2月15日に確認完了</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>特定商取引法に基づく表記</CardTitle>
              <CardDescription>法令に基づく必要事項を設定します</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seller-name">販売業者名</Label>
                <Input id="seller-name" defaultValue="山田工房" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="representative">代表者名</Label>
                <Input id="representative" defaultValue="山田 太郎" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">所在地</Label>
                <Textarea id="address" defaultValue="石川県○○市○○町1-2-3" rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input id="phone" defaultValue="076-XXX-XXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input id="email" defaultValue="contact@yamada-kobo.example.com" />
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>住所を公開</Label>
                  <p className="text-xs text-muted-foreground">
                    オフの場合、請求時のみ開示
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                変更を保存
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
