"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Flag,
  Shield,
  Ban,
} from "lucide-react"

// Mock data
const reports = [
  {
    id: "1",
    type: "inappropriate_content",
    typeLabel: "不適切なコンテンツ",
    target: "投稿",
    targetName: "里山キッチンの活動報告",
    reporter: "匿名ユーザー",
    reason: "虚偽の情報が含まれている可能性があります",
    reportedAt: "2024-01-15T10:30:00",
    status: "pending",
  },
  {
    id: "2",
    type: "spam",
    typeLabel: "スパム・詐欺",
    target: "タレント",
    targetName: "不審なサービス",
    reporter: "山田太郎",
    reason: "怪しいリンクが投稿されています",
    reportedAt: "2024-01-14T14:20:00",
    status: "investigating",
  },
  {
    id: "3",
    type: "harassment",
    typeLabel: "ハラスメント",
    target: "コメント",
    targetName: "海辺の音楽祭へのコメント",
    reporter: "鈴木花子",
    reason: "誹謗中傷のコメントが投稿されています",
    reportedAt: "2024-01-13T09:15:00",
    status: "resolved",
    resolution: "該当コメントを削除しました",
  },
  {
    id: "4",
    type: "copyright",
    typeLabel: "著作権侵害",
    target: "投稿",
    targetName: "伝統工芸 匠の投稿",
    reporter: "著作権者",
    reason: "許可なく使用された画像があります",
    reportedAt: "2024-01-12T16:45:00",
    status: "dismissed",
    resolution: "確認の結果、問題なしと判断",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          未対応
        </Badge>
      )
    case "investigating":
      return (
        <Badge className="gap-1 bg-amber-100 text-amber-700">
          <Eye className="h-3 w-3" />
          調査中
        </Badge>
      )
    case "resolved":
      return (
        <Badge className="gap-1 bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" />
          対応済み
        </Badge>
      )
    case "dismissed":
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          却下
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "inappropriate_content":
      return <Badge variant="destructive">不適切なコンテンツ</Badge>
    case "spam":
      return <Badge className="bg-amber-100 text-amber-700">スパム・詐欺</Badge>
    case "harassment":
      return <Badge variant="destructive">ハラスメント</Badge>
    case "copyright":
      return <Badge className="bg-blue-100 text-blue-700">著作権侵害</Badge>
    default:
      return <Badge variant="outline">{type}</Badge>
  }
}

export default function AdminReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<typeof reports[0] | null>(null)
  const [response, setResponse] = useState("")

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = reports.filter((r) => r.status === "pending").length
  const investigatingCount = reports.filter((r) => r.status === "investigating").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">通報・違反管理</h1>
        <p className="text-muted-foreground">
          ユーザーからの通報と違反コンテンツの管理を行います
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">未対応</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">調査中</p>
                <p className="text-2xl font-bold">{investigatingCount}</p>
              </div>
              <Eye className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今月の対応数</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均対応時間</p>
                <p className="text-2xl font-bold">4.2h</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
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
                placeholder="対象、理由で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="pending">未対応</SelectItem>
                <SelectItem value="investigating">調査中</SelectItem>
                <SelectItem value="resolved">対応済み</SelectItem>
                <SelectItem value="dismissed">却下</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>種別</TableHead>
                <TableHead>対象</TableHead>
                <TableHead>通報理由</TableHead>
                <TableHead>通報者</TableHead>
                <TableHead>通報日時</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{getTypeBadge(report.type)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.targetName}</p>
                      <p className="text-sm text-muted-foreground">{report.target}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                  <TableCell>{report.reporter}</TableCell>
                  <TableCell>
                    {new Date(report.reportedAt).toLocaleString("ja-JP")}
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>通報詳細</DialogTitle>
                          <DialogDescription>
                            通報内容を確認して対応を行ってください
                          </DialogDescription>
                        </DialogHeader>
                        {selectedReport && (
                          <div className="space-y-6">
                            {/* Report Info */}
                            <div className="rounded-lg border p-4">
                              <div className="mb-4 flex items-center justify-between">
                                {getTypeBadge(selectedReport.type)}
                                {getStatusBadge(selectedReport.status)}
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm text-muted-foreground">対象</p>
                                  <p className="font-medium">
                                    {selectedReport.targetName}（{selectedReport.target}）
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">通報理由</p>
                                  <p>{selectedReport.reason}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">通報者</p>
                                  <p>{selectedReport.reporter}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">通報日時</p>
                                  <p>
                                    {new Date(selectedReport.reportedAt).toLocaleString("ja-JP")}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Resolution (if exists) */}
                            {selectedReport.resolution && (
                              <div className="rounded-lg bg-muted p-4">
                                <p className="text-sm font-medium">対応内容</p>
                                <p className="text-sm text-muted-foreground">
                                  {selectedReport.resolution}
                                </p>
                              </div>
                            )}

                            {/* Response Form (if pending/investigating) */}
                            {(selectedReport.status === "pending" ||
                              selectedReport.status === "investigating") && (
                              <div>
                                <label className="text-sm font-medium">対応内容</label>
                                <Textarea
                                  value={response}
                                  onChange={(e) => setResponse(e.target.value)}
                                  placeholder="対応内容を入力..."
                                  className="mt-2"
                                  rows={3}
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <DialogFooter className="gap-2 sm:gap-0">
                          {selectedReport?.status === "pending" && (
                            <>
                              <Button variant="outline">
                                <Eye className="mr-2 h-4 w-4" />
                                調査開始
                              </Button>
                              <Button variant="outline">
                                <XCircle className="mr-2 h-4 w-4" />
                                却下
                              </Button>
                            </>
                          )}
                          {selectedReport?.status === "investigating" && (
                            <>
                              <Button variant="outline" className="text-amber-600">
                                <Flag className="mr-2 h-4 w-4" />
                                警告
                              </Button>
                              <Button variant="destructive">
                                <Ban className="mr-2 h-4 w-4" />
                                削除・停止
                              </Button>
                              <Button>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                対応完了
                              </Button>
                            </>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
