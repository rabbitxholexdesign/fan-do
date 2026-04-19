"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Building2,
  User,
  Users,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

// Mock data
const reviews = [
  {
    id: "1",
    name: "山田農園",
    type: "法人",
    typeIcon: Building2,
    category: "農業・食",
    region: "新潟県",
    email: "yamada@farm.example.com",
    submittedAt: "2024-01-15T10:30:00",
    status: "pending",
    kycStatus: "verified",
    documents: ["法人登記簿", "代表者身分証", "銀行口座確認書"],
  },
  {
    id: "2",
    name: "海辺のカフェ みなと",
    type: "個人",
    typeIcon: User,
    category: "飲食",
    region: "神奈川県",
    email: "minato@cafe.example.com",
    submittedAt: "2024-01-14T14:20:00",
    status: "pending",
    kycStatus: "verified",
    documents: ["運転免許証", "銀行口座確認書"],
  },
  {
    id: "3",
    name: "伝統工芸 匠の会",
    type: "団体",
    typeIcon: Users,
    category: "伝統・文化",
    region: "京都府",
    email: "takumi@craft.example.com",
    submittedAt: "2024-01-13T09:15:00",
    status: "documents_required",
    kycStatus: "pending",
    documents: ["団体規約", "代表者身分証"],
    missingDocuments: ["銀行口座確認書"],
  },
  {
    id: "4",
    name: "地元アーティスト 空",
    type: "個人",
    typeIcon: User,
    category: "アート・音楽",
    region: "福岡県",
    email: "sora@artist.example.com",
    submittedAt: "2024-01-12T16:45:00",
    status: "approved",
    kycStatus: "verified",
    documents: ["マイナンバーカード", "銀行口座確認書"],
  },
  {
    id: "5",
    name: "不明なサービス",
    type: "個人",
    typeIcon: User,
    category: "その他",
    region: "東京都",
    email: "unknown@example.com",
    submittedAt: "2024-01-11T11:00:00",
    status: "rejected",
    kycStatus: "rejected",
    documents: ["身分証（不鮮明）"],
    rejectionReason: "本人確認書類が不鮮明なため",
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          審査待ち
        </Badge>
      )
    case "documents_required":
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700">
          <AlertCircle className="h-3 w-3" />
          書類不備
        </Badge>
      )
    case "approved":
      return (
        <Badge className="gap-1 bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3" />
          承認済み
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          却下
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReview, setSelectedReview] = useState<typeof reviews[0] | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || review.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = reviews.filter((r) => r.status === "pending").length
  const documentsRequiredCount = reviews.filter((r) => r.status === "documents_required").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">審査管理</h1>
        <p className="text-muted-foreground">
          タレント申請の審査・承認を行います
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">審査待ち</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">書類不備</p>
                <p className="text-2xl font-bold">{documentsRequiredCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今月の承認数</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="タレント名、メールアドレスで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="ステータス" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="pending">審査待ち</SelectItem>
                <SelectItem value="documents_required">書類不備</SelectItem>
                <SelectItem value="approved">承認済み</SelectItem>
                <SelectItem value="rejected">却下</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タレント</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>申請日</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.name}</p>
                        <p className="text-sm text-muted-foreground">{review.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <review.typeIcon className="h-4 w-4 text-muted-foreground" />
                      {review.type}
                    </div>
                  </TableCell>
                  <TableCell>{review.category}</TableCell>
                  <TableCell>
                    {new Date(review.submittedAt).toLocaleDateString("ja-JP")}
                  </TableCell>
                  <TableCell>
                    {review.kycStatus === "verified" ? (
                      <Badge className="bg-green-100 text-green-700">確認済み</Badge>
                    ) : review.kycStatus === "pending" ? (
                      <Badge variant="outline">確認中</Badge>
                    ) : (
                      <Badge variant="destructive">却下</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(review.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>タレント詳細</DialogTitle>
                            <DialogDescription>
                              申請内容を確認して審査を行ってください
                            </DialogDescription>
                          </DialogHeader>
                          {selectedReview && (
                            <div className="space-y-6">
                              {/* Basic Info */}
                              <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                    {selectedReview.name.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-lg font-semibold">{selectedReview.name}</h3>
                                  <p className="text-muted-foreground">{selectedReview.email}</p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <Badge variant="outline">{selectedReview.type}</Badge>
                                    <Badge variant="outline">{selectedReview.category}</Badge>
                                    <Badge variant="outline">{selectedReview.region}</Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Documents */}
                              <div>
                                <h4 className="mb-3 font-medium">提出書類</h4>
                                <div className="space-y-2">
                                  {selectedReview.documents.map((doc, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                      <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <span>{doc}</span>
                                      </div>
                                      <Button variant="ghost" size="sm">
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                {selectedReview.missingDocuments && (
                                  <div className="mt-3 rounded-lg bg-amber-50 p-3">
                                    <p className="text-sm font-medium text-amber-700">
                                      不足書類: {selectedReview.missingDocuments.join(", ")}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Rejection Reason */}
                              {selectedReview.rejectionReason && (
                                <div className="rounded-lg bg-red-50 p-3">
                                  <p className="text-sm font-medium text-red-700">
                                    却下理由: {selectedReview.rejectionReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          <DialogFooter className="gap-2 sm:gap-0">
                            {selectedReview?.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  onClick={() => setRejectDialogOpen(true)}
                                >
                                  却下
                                </Button>
                                <Button>承認</Button>
                              </>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      {review.status === "pending" && (
                        <>
                          <Button size="sm" variant="outline">
                            却下
                          </Button>
                          <Button size="sm">承認</Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>申請を却下</DialogTitle>
            <DialogDescription>
              却下理由を入力してください。申請者にメールで通知されます。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">却下理由</label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="却下理由を入力..."
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive">却下する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
