"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { 
  Users, 
  TrendingUp, 
  Eye,
  Heart,
  MessageCircle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"

// Mock data for charts (simplified bar representation)
const monthlyData = [
  { month: "1月", supporters: 120, revenue: 185000, views: 4500 },
  { month: "2月", supporters: 132, revenue: 198000, views: 5200 },
  { month: "3月", supporters: 144, revenue: 215000, views: 5800 },
  { month: "4月", supporters: 156, revenue: 234500, views: 6100 },
]

const planDistribution = [
  { name: "ライト", count: 45, percentage: 29, color: "bg-slate-400" },
  { name: "スタンダード", count: 78, percentage: 50, color: "bg-temperature-medium" },
  { name: "プレミアム", count: 33, percentage: 21, color: "bg-temperature-high" },
]

const topContent = [
  { id: "1", title: "新作輪島塗のお椀完成のお知らせ", views: 1250, likes: 89, comments: 24 },
  { id: "2", title: "ワークショップ開催レポート", views: 980, likes: 67, comments: 18 },
  { id: "3", title: "制作過程の裏話", views: 856, likes: 52, comments: 12 },
  { id: "4", title: "新しい挑戦について", views: 723, likes: 45, comments: 8 },
]

const demographicData = [
  { label: "20代", percentage: 15 },
  { label: "30代", percentage: 35 },
  { label: "40代", percentage: 28 },
  { label: "50代", percentage: 15 },
  { label: "60代以上", percentage: 7 },
]

function SimpleBarChart({ data, valueKey, maxValue }: { data: typeof monthlyData, valueKey: keyof typeof monthlyData[0], maxValue: number }) {
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((item, index) => {
        const value = item[valueKey] as number
        const height = (value / maxValue) * 100
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-muted rounded-t relative" style={{ height: `${height}%` }}>
              <div className="absolute inset-0 bg-primary/80 rounded-t" />
            </div>
            <span className="text-xs text-muted-foreground">{item.month}</span>
          </div>
        )
      })}
    </div>
  )
}

function StatChange({ value, suffix = "" }: { value: number, suffix?: string }) {
  const isPositive = value >= 0
  return (
    <span className={`flex items-center text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {isPositive ? "+" : ""}{value}{suffix}
    </span>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">アナリティクス</h1>
          <p className="text-muted-foreground">パフォーマンスと成長を分析</p>
        </div>
        <Select defaultValue="30d">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">過去7日間</SelectItem>
            <SelectItem value="30d">過去30日間</SelectItem>
            <SelectItem value="90d">過去90日間</SelectItem>
            <SelectItem value="1y">過去1年間</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ページビュー</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,100</div>
            <StatChange value={5.2} suffix="%" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">新規サポーター</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <StatChange value={8.3} suffix="%" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">エンゲージメント率</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
            <StatChange value={2.1} suffix="%" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">平均fan℃</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FanTemperatureMeter temperature={78} size="sm" showLabel={false} />
              <div>
                <div className="text-2xl font-bold">78℃</div>
                <StatChange value={3} suffix="℃" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="supporters" className="space-y-6">
        <TabsList>
          <TabsTrigger value="supporters">サポーター推移</TabsTrigger>
          <TabsTrigger value="revenue">収益推移</TabsTrigger>
          <TabsTrigger value="views">閲覧数推移</TabsTrigger>
        </TabsList>

        <TabsContent value="supporters">
          <Card>
            <CardHeader>
              <CardTitle>サポーター数の推移</CardTitle>
              <CardDescription>月別のサポーター数変化</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={monthlyData} valueKey="supporters" maxValue={200} />
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                {monthlyData.map((item, index) => (
                  <div key={index}>
                    <p className="text-lg font-semibold">{item.supporters}</p>
                    <p className="text-xs text-muted-foreground">人</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>収益の推移</CardTitle>
              <CardDescription>月別の収益変化</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={monthlyData} valueKey="revenue" maxValue={300000} />
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                {monthlyData.map((item, index) => (
                  <div key={index}>
                    <p className="text-lg font-semibold">¥{(item.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-muted-foreground">円</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="views">
          <Card>
            <CardHeader>
              <CardTitle>閲覧数の推移</CardTitle>
              <CardDescription>月別のページビュー変化</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={monthlyData} valueKey="views" maxValue={8000} />
              <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                {monthlyData.map((item, index) => (
                  <div key={index}>
                    <p className="text-lg font-semibold">{(item.views / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-muted-foreground">PV</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>プラン分布</CardTitle>
            <CardDescription>サポーターのプラン内訳</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {planDistribution.map((plan) => (
              <div key={plan.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{plan.name}</span>
                  <span className="text-muted-foreground">{plan.count}人 ({plan.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${plan.color} rounded-full transition-all`}
                    style={{ width: `${plan.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>年代分布</CardTitle>
            <CardDescription>サポーターの年代構成</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {demographicData.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">{item.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Content */}
      <Card>
        <CardHeader>
          <CardTitle>人気コンテンツ</CardTitle>
          <CardDescription>最も閲覧された活動報告</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topContent.map((content, index) => (
              <div key={content.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{content.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {content.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {content.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {content.comments}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
