"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import {
  Users,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import Link from "next/link"

// Mock data
const stats = [
  {
    name: "総ユーザー数",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
  },
  {
    name: "アクティブタレント",
    value: "342",
    change: "+8.2%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    name: "月間GMV",
    value: "¥4,280,000",
    change: "+23.1%",
    trend: "up",
    icon: CreditCard,
  },
  {
    name: "未対応レポート",
    value: "7",
    change: "-2",
    trend: "down",
    icon: AlertTriangle,
  },
]

const pendingReviews = [
  {
    id: "1",
    name: "山田農園",
    type: "法人",
    category: "農業・食",
    submittedAt: "2024-01-15",
    status: "pending",
  },
  {
    id: "2",
    name: "海辺のカフェ みなと",
    type: "個人",
    category: "飲食",
    submittedAt: "2024-01-14",
    status: "pending",
  },
  {
    id: "3",
    name: "伝統工芸 匠の会",
    type: "団体",
    category: "伝統・文化",
    submittedAt: "2024-01-13",
    status: "documents_required",
  },
]

const recentActivities = [
  {
    type: "approval",
    message: "「地元酒蔵 蔵元」が承認されました",
    time: "10分前",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    type: "report",
    message: "新しい通報が届きました",
    time: "30分前",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
  },
  {
    type: "payment",
    message: "出金申請 ¥150,000 が処理されました",
    time: "1時間前",
    icon: CreditCard,
    iconColor: "text-blue-500",
  },
  {
    type: "rejection",
    message: "「不明なタレント」が却下されました",
    time: "2時間前",
    icon: XCircle,
    iconColor: "text-red-500",
  },
]

const topTalents = [
  {
    id: "1",
    name: "里山キッチン",
    supporters: 1234,
    temperature: 87,
    revenue: 450000,
  },
  {
    id: "2",
    name: "海辺の音楽祭",
    supporters: 892,
    temperature: 72,
    revenue: 320000,
  },
  {
    id: "3",
    name: "古民家カフェ 縁",
    supporters: 756,
    temperature: 65,
    revenue: 280000,
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          プラットフォーム全体の状況を確認できます
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span className="ml-1 text-muted-foreground">先月比</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                審査待ちタレント
              </CardTitle>
              <CardDescription>承認が必要なタレント申請</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/reviews">すべて表示</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{review.type}</span>
                        <span>・</span>
                        <span>{review.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {review.status === "pending" ? (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        審査待ち
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        書類不備
                      </Badge>
                    )}
                    <Button size="sm" asChild>
                      <Link href={`/admin/reviews/${review.id}`}>審査</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>システム全体の最新動向</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`mt-0.5 ${activity.iconColor}`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Talents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>トップタレント</CardTitle>
            <CardDescription>今月最もアクティブなタレント</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/talents">すべて表示</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {topTalents.map((talent, index) => (
              <div
                key={talent.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{talent.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {talent.supporters.toLocaleString()}人のサポーター
                  </p>
                </div>
                <FanTemperatureMeter temperature={talent.temperature} size="sm" showLabel={false} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/reviews">審査管理</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/reports">通報確認</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/payments">出金処理</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/analytics">レポート出力</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
