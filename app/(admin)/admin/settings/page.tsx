"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Settings,
  Percent,
  Bell,
  Mail,
  Shield,
  Database,
  Palette,
} from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">システム設定</h1>
        <p className="text-muted-foreground">
          プラットフォーム全体の設定を管理します
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            一般
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-2">
            <Percent className="h-4 w-4" />
            手数料
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            通知
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            セキュリティ
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>サイト情報</CardTitle>
              <CardDescription>
                プラットフォームの基本情報を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">サイト名</Label>
                  <Input id="siteName" defaultValue="fan℃" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">サイトURL</Label>
                  <Input id="siteUrl" defaultValue="https://fanc.jp" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">サイト説明</Label>
                <Textarea
                  id="description"
                  defaultValue="地域の「ひと・もの・こと」をタレントとして応援できるファンコミュニティ創出型プラットフォーム"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">お問い合わせメール</Label>
                <Input id="contactEmail" type="email" defaultValue="support@fanc.jp" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>メンテナンスモード</CardTitle>
              <CardDescription>
                サイトをメンテナンス状態にします
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">メンテナンスモード</p>
                  <p className="text-sm text-muted-foreground">
                    有効にすると管理者以外はサイトにアクセスできなくなります
                  </p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">メンテナンスメッセージ</Label>
                <Textarea
                  id="maintenanceMessage"
                  placeholder="現在メンテナンス中です。しばらくお待ちください。"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>変更を保存</Button>
          </div>
        </TabsContent>

        {/* Fee Settings */}
        <TabsContent value="fees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>プラットフォーム手数料</CardTitle>
              <CardDescription>
                支援金額に対するプラットフォーム手数料を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platformFee">基本手数料率 (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="platformFee"
                      type="number"
                      defaultValue="20"
                      className="w-24"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    支援金額から差し引かれるプラットフォーム手数料
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripeFee">決済手数料率 (%)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="stripeFee"
                      type="number"
                      defaultValue="3.6"
                      className="w-24"
                      disabled
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Stripeによる決済手数料（変更不可）
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-4 font-medium">手数料シミュレーション</h4>
                <div className="rounded-lg border p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>支援金額</span>
                      <span>¥10,000</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>プラットフォーム手数料 (20%)</span>
                      <span>-¥2,000</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>決済手数料 (3.6%)</span>
                      <span>-¥360</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>タレント受取額</span>
                      <span>¥7,640</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>出金設定</CardTitle>
              <CardDescription>
                出金に関する設定を行います
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minWithdrawal">最低出金額</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">¥</span>
                    <Input
                      id="minWithdrawal"
                      type="number"
                      defaultValue="1000"
                      className="w-32"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="withdrawalFee">出金手数料</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">¥</span>
                    <Input
                      id="withdrawalFee"
                      type="number"
                      defaultValue="250"
                      className="w-32"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>変更を保存</Button>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>メール通知設定</CardTitle>
              <CardDescription>
                システムから送信されるメール通知を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">新規タレント申請</p>
                    <p className="text-sm text-muted-foreground">
                      新しいタレント申請があった際に通知
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">出金申請</p>
                    <p className="text-sm text-muted-foreground">
                      出金申請があった際に通知
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">通報</p>
                    <p className="text-sm text-muted-foreground">
                      ユーザーからの通報があった際に通知
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">日次レポート</p>
                    <p className="text-sm text-muted-foreground">
                      毎日のサマリーレポートをメールで送信
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>通知先メールアドレス</CardTitle>
              <CardDescription>
                管理者通知の送信先を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminEmails">管理者メールアドレス</Label>
                <Textarea
                  id="adminEmails"
                  placeholder="admin@fanc.jp&#10;support@fanc.jp"
                  rows={3}
                  defaultValue="admin@fanc.jp"
                />
                <p className="text-sm text-muted-foreground">
                  複数のメールアドレスを改行で区切って入力できます
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>変更を保存</Button>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>セキュリティ設定</CardTitle>
              <CardDescription>
                プラットフォームのセキュリティに関する設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">二要素認証の強制</p>
                    <p className="text-sm text-muted-foreground">
                      管理者アカウントに二要素認証を必須にする
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">IPアドレス制限</p>
                    <p className="text-sm text-muted-foreground">
                      管理画面へのアクセスを特定IPに制限
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">ログイン通知</p>
                    <p className="text-sm text-muted-foreground">
                      新しいデバイスからのログイン時にメール通知
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>セッション設定</CardTitle>
              <CardDescription>
                ログインセッションに関する設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">セッションタイムアウト</Label>
                  <Select defaultValue="60">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30分</SelectItem>
                      <SelectItem value="60">1時間</SelectItem>
                      <SelectItem value="120">2時間</SelectItem>
                      <SelectItem value="480">8時間</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">最大ログイン試行回数</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3回</SelectItem>
                      <SelectItem value="5">5回</SelectItem>
                      <SelectItem value="10">10回</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>変更を保存</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
