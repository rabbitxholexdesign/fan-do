"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

// Mock chart component placeholder
function ChartPlaceholder({ title, height = 300 }: { title: string; height?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border border-dashed bg-muted/30"
      style={{ height }}
    >
      <div className="text-center">
        <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  )
}

const metrics = [
  {
    name: "月間GMV",
    value: "¥4,280,000",
    change: "+23.1%",
    trend: "up",
  },
  {
    name: "新規ユーザー",
    value: "428",
    change: "+12.5%",
    trend: "up",
  },
  {
    name: "新規タレント",
    value: "18",
    change: "+8.3%",
    trend: "up",
  },
  {
    name: "解約率",
    value: "2.3%",
    change: "-0.5%",
    trend: "down",
  },
]

const topCategories = [
  { name: "農業・食", count: 89, percentage: 26 },
  { name: "アート・音楽", count: 72, percentage: 21 },
  { name: "飲食", count: 58, percentage: 17 },
  { name: "伝統・文化", count: 45, percentage: 13 },
  { name: "スポーツ", count: 38, percentage: 11 },
  { name: "その他", count: 40, percentage: 12 },
]

const topRegions = [
  { name: "東京都", count: 52, percentage: 15 },
  { name: "大阪府", count: 41, percentage: 12 },
  { name: "北海道", count: 35, percentage: 10 },
  { name: "福岡県", count: 32, percentage: 9 },
  { name: "京都府", count: 28, percentage: 8 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">レポート・分析</h1>
          <p className="text-muted-foreground">
            プラットフォーム全体のパフォーマンスを分析します
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30">
            <SelectTrigger className="w-[150px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">過去7日間</SelectItem>
              <SelectItem value="30">過去30日間</SelectItem>
              <SelectItem value="90">過去90日間</SelectItem>
              <SelectItem value="365">過去1年間</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            レポート出力
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{metric.name}</p>
                <div className="flex items-center text-sm">
                  {metric.trend === "up" ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">{metric.change}</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-green-500" />
                      <span className="text-green-500">{metric.change}</span>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="users">ユーザー</TabsTrigger>
          <TabsTrigger value="revenue">収益</TabsTrigger>
          <TabsTrigger value="talents">タレント</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* GMV Chart */}
            <Card>
              <CardHeader>
                <CardTitle>GMV推移</CardTitle>
                <CardDescription>月間総流通額の推移</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="GMV推移グラフ" />
              </CardContent>
            </Card>

            {/* User Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>ユーザー成長</CardTitle>
                <CardDescription>登録ユーザー数の推移</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="ユーザー成長グラフ" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ別タレント数</CardTitle>
                <CardDescription>カテゴリごとのタレント分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{category.name}</span>
                        <span className="text-muted-foreground">
                          {category.count}件 ({category.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Regions */}
            <Card>
              <CardHeader>
                <CardTitle>地域別タレント数</CardTitle>
                <CardDescription>上位5地域のタレント分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRegions.map((region, index) => (
                    <div key={region.name} className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{region.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {region.count}件
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary/60 transition-all"
                            style={{ width: `${region.percentage * 2}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>新規登録推移</CardTitle>
                <CardDescription>日別の新規ユーザー登録数</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="新規登録推移グラフ" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>アクティブユーザー</CardTitle>
                <CardDescription>DAU/MAU推移</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="アクティブユーザーグラフ" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ユーザー属性</CardTitle>
              <CardDescription>ユーザーの属性分布</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    ユーザー種別
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>ファン</span>
                      <Badge variant="outline">12,505 (97.3%)</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>タレント運営者</span>
                      <Badge variant="outline">342 (2.7%)</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    登録経路
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>メール</span>
                      <Badge variant="outline">68%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Google</span>
                      <Badge variant="outline">24%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>LINE</span>
                      <Badge variant="outline">8%</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-4 text-sm font-medium text-muted-foreground">
                    平均支援数
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>1人あたり</span>
                      <Badge variant="outline">2.3件</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>平均支援額</span>
                      <Badge variant="outline">¥3,200/月</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>収益推移</CardTitle>
                <CardDescription>プラットフォーム手数料収入の推移</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="収益推移グラフ" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>プラン別収益</CardTitle>
                <CardDescription>支援プラン価格帯別の収益分布</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="プラン別収益グラフ" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>収益サマリー</CardTitle>
              <CardDescription>今月の収益詳細</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">総GMV</p>
                  <p className="mt-1 text-2xl font-bold">¥4,280,000</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">手数料収入</p>
                  <p className="mt-1 text-2xl font-bold">¥856,000</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">タレント支払い</p>
                  <p className="mt-1 text-2xl font-bold">¥3,270,000</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">決済手数料</p>
                  <p className="mt-1 text-2xl font-bold">¥154,080</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="talents" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>タレント登録推移</CardTitle>
                <CardDescription>月別の新規タレント登録数</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="タレント登録推移グラフ" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>fan℃分布</CardTitle>
                <CardDescription>タレントのfan℃スコア分布</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder title="fan℃分布グラフ" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>タレントパフォーマンス</CardTitle>
              <CardDescription>主要指標の統計</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">平均サポーター数</p>
                  <p className="mt-1 text-2xl font-bold">37.4人</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">平均月間収益</p>
                  <p className="mt-1 text-2xl font-bold">¥125,146</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">平均fan℃</p>
                  <p className="mt-1 text-2xl font-bold">58.4℃</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">投稿頻度</p>
                  <p className="mt-1 text-2xl font-bold">4.2回/月</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
