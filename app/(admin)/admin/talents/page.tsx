"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Pause,
  Play,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

// Mock data
const talents = [
  {
    id: "1",
    name: "里山キッチン",
    owner: "田中一郎",
    email: "tanaka@satoyama.example.com",
    category: "農業・食",
    region: "新潟県",
    supporters: 1234,
    temperature: 87,
    monthlyRevenue: 450000,
    status: "active",
    createdAt: "2023-06-15",
  },
  {
    id: "2",
    name: "海辺の音楽祭",
    owner: "鈴木花子",
    email: "suzuki@music.example.com",
    category: "アート・音楽",
    region: "神奈川県",
    supporters: 892,
    temperature: 72,
    monthlyRevenue: 320000,
    status: "active",
    createdAt: "2023-08-20",
  },
  {
    id: "3",
    name: "古民家カフェ 縁",
    owner: "佐藤太郎",
    email: "sato@cafe.example.com",
    category: "飲食",
    region: "京都府",
    supporters: 756,
    temperature: 65,
    monthlyRevenue: 280000,
    status: "active",
    createdAt: "2023-09-10",
  },
  {
    id: "4",
    name: "伝統工芸 匠",
    owner: "高橋工房",
    email: "takahashi@craft.example.com",
    category: "伝統・文化",
    region: "石川県",
    supporters: 423,
    temperature: 45,
    monthlyRevenue: 150000,
    status: "suspended",
    createdAt: "2023-07-05",
  },
  {
    id: "5",
    name: "地元野球チーム",
    owner: "山本監督",
    email: "yamamoto@baseball.example.com",
    category: "スポーツ",
    region: "愛知県",
    supporters: 2341,
    temperature: 92,
    monthlyRevenue: 680000,
    status: "active",
    createdAt: "2023-05-01",
  },
]

const categories = [
  "すべて",
  "農業・食",
  "アート・音楽",
  "飲食",
  "伝統・文化",
  "スポーツ",
  "観光・体験",
  "教育・学び",
]

export default function AdminTalentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("すべて")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTalents = talents.filter((talent) => {
    const matchesSearch =
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.owner.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "すべて" || talent.category === categoryFilter
    const matchesStatus = statusFilter === "all" || talent.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">タレント管理</h1>
        <p className="text-muted-foreground">
          すべてのタレントの管理・モニタリングを行います
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">総タレント数</p>
                <p className="text-2xl font-bold">342</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">アクティブ</p>
                <p className="text-2xl font-bold">328</p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">一時停止中</p>
                <p className="text-2xl font-bold">14</p>
              </div>
              <Pause className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均fan℃</p>
                <p className="text-2xl font-bold">58.4</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="タレント名、オーナー名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">アクティブ</SelectItem>
                <SelectItem value="suspended">一時停止</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Talents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タレント</TableHead>
                <TableHead>オーナー</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>サポーター</TableHead>
                <TableHead>fan℃</TableHead>
                <TableHead>月間収益</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTalents.map((talent) => (
                <TableRow key={talent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {talent.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{talent.name}</p>
                        <p className="text-sm text-muted-foreground">{talent.region}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{talent.owner}</p>
                      <p className="text-xs text-muted-foreground">{talent.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{talent.category}</Badge>
                  </TableCell>
                  <TableCell>{talent.supporters.toLocaleString()}人</TableCell>
                  <TableCell>
                    <FanTemperatureMeter
                      temperature={talent.temperature}
                      size="sm"
                      showLabel={false}
                    />
                  </TableCell>
                  <TableCell>¥{talent.monthlyRevenue.toLocaleString()}</TableCell>
                  <TableCell>
                    {talent.status === "active" ? (
                      <Badge className="bg-green-100 text-green-700">アクティブ</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700">一時停止</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/talents/${talent.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            詳細を見る
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {talent.status === "active" ? (
                          <DropdownMenuItem className="text-amber-600">
                            <Pause className="mr-2 h-4 w-4" />
                            一時停止
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <Play className="mr-2 h-4 w-4" />
                            再開
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          警告を送信
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
