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
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Users,
  UserPlus,
  Heart,
  Mail,
} from "lucide-react"

// Mock data
const users = [
  {
    id: "1",
    name: "山田太郎",
    email: "yamada@example.com",
    role: "fan",
    supportingCount: 5,
    totalSpent: 45000,
    temperature: 72,
    status: "active",
    createdAt: "2023-06-15",
    lastLogin: "2024-01-15",
  },
  {
    id: "2",
    name: "鈴木花子",
    email: "suzuki@example.com",
    role: "owner",
    supportingCount: 3,
    totalSpent: 28000,
    temperature: 58,
    status: "active",
    createdAt: "2023-08-20",
    lastLogin: "2024-01-14",
    talents: ["海辺の音楽祭"],
  },
  {
    id: "3",
    name: "佐藤一郎",
    email: "sato@example.com",
    role: "fan",
    supportingCount: 12,
    totalSpent: 120000,
    temperature: 95,
    status: "active",
    createdAt: "2023-04-10",
    lastLogin: "2024-01-15",
  },
  {
    id: "4",
    name: "高橋美咲",
    email: "takahashi@example.com",
    role: "fan",
    supportingCount: 0,
    totalSpent: 0,
    temperature: 0,
    status: "suspended",
    createdAt: "2023-11-01",
    lastLogin: "2024-01-01",
  },
  {
    id: "5",
    name: "伊藤健太",
    email: "ito@example.com",
    role: "owner",
    supportingCount: 2,
    totalSpent: 15000,
    temperature: 42,
    status: "active",
    createdAt: "2023-09-15",
    lastLogin: "2024-01-13",
    talents: ["地元野球チーム", "少年サッカークラブ"],
  },
]

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.status === "active").length
  const ownerUsers = users.filter((u) => u.role === "owner").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ユーザー管理</h1>
        <p className="text-muted-foreground">
          登録ユーザーの管理・モニタリングを行います
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">総ユーザー数</p>
                <p className="text-2xl font-bold">12,847</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今月の新規登録</p>
                <p className="text-2xl font-bold">428</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">タレント運営者</p>
                <p className="text-2xl font-bold">342</p>
              </div>
              <Heart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">アクティブ率</p>
                <p className="text-2xl font-bold">78.4%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
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
                placeholder="名前、メールアドレスで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="ユーザー種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="fan">ファン</SelectItem>
                <SelectItem value="owner">タレント運営者</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">アクティブ</SelectItem>
                <SelectItem value="suspended">停止中</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ユーザー</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>応援中</TableHead>
                <TableHead>累計支援額</TableHead>
                <TableHead>fan℃</TableHead>
                <TableHead>最終ログイン</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === "owner" ? (
                      <Badge className="bg-primary/10 text-primary">運営者</Badge>
                    ) : (
                      <Badge variant="outline">ファン</Badge>
                    )}
                  </TableCell>
                  <TableCell>{user.supportingCount}人</TableCell>
                  <TableCell>¥{user.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    {user.temperature > 0 ? (
                      <FanTemperatureMeter
                        temperature={user.temperature}
                        size="sm"
                        showLabel={false}
                      />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.lastLogin).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell>
                    {user.status === "active" ? (
                      <Badge className="bg-green-100 text-green-700">アクティブ</Badge>
                    ) : (
                      <Badge variant="destructive">停止中</Badge>
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          詳細を見る
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          メールを送信
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "active" ? (
                          <DropdownMenuItem className="text-destructive">
                            <Ban className="mr-2 h-4 w-4" />
                            アカウント停止
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            停止解除
                          </DropdownMenuItem>
                        )}
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
