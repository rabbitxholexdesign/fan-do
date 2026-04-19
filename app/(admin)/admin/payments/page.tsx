"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  Search,
  CreditCard,
  ArrowDownToLine,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
} from "lucide-react"

// Mock data
const withdrawalRequests = [
  {
    id: "1",
    talent: "里山キッチン",
    owner: "田中一郎",
    amount: 150000,
    bankName: "三菱UFJ銀行",
    branchName: "新宿支店",
    accountType: "普通",
    accountNumber: "1234567",
    accountHolder: "タナカ イチロウ",
    requestedAt: "2024-01-15T10:30:00",
    status: "pending",
  },
  {
    id: "2",
    talent: "海辺の音楽祭",
    owner: "鈴木花子",
    amount: 80000,
    bankName: "みずほ銀行",
    branchName: "横浜支店",
    accountType: "普通",
    accountNumber: "7654321",
    accountHolder: "スズキ ハナコ",
    requestedAt: "2024-01-14T14:20:00",
    status: "pending",
  },
  {
    id: "3",
    talent: "古民家カフェ 縁",
    owner: "佐藤太郎",
    amount: 200000,
    bankName: "三井住友銀行",
    branchName: "京都支店",
    accountType: "普通",
    accountNumber: "9876543",
    accountHolder: "サトウ タロウ",
    requestedAt: "2024-01-13T09:15:00",
    status: "completed",
    completedAt: "2024-01-14T16:00:00",
  },
]

const transactions = [
  {
    id: "1",
    type: "support",
    from: "山田太郎",
    to: "里山キッチン",
    amount: 3000,
    fee: 600,
    net: 2400,
    plan: "応援プラン",
    createdAt: "2024-01-15T10:30:00",
  },
  {
    id: "2",
    type: "support",
    from: "鈴木花子",
    to: "海辺の音楽祭",
    amount: 5000,
    fee: 1000,
    net: 4000,
    plan: "VIPプラン",
    createdAt: "2024-01-15T09:15:00",
  },
  {
    id: "3",
    type: "refund",
    from: "佐藤一郎",
    to: "古民家カフェ 縁",
    amount: -1000,
    fee: -200,
    net: -800,
    plan: "ライトプラン",
    createdAt: "2024-01-14T16:45:00",
  },
]

export default function AdminPaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<typeof withdrawalRequests[0] | null>(null)

  const pendingRequests = withdrawalRequests.filter((r) => r.status === "pending")
  const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">決済管理</h1>
        <p className="text-muted-foreground">
          支援決済と出金申請の管理を行います
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今月のGMV</p>
                <p className="text-2xl font-bold">¥4,280,000</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">プラットフォーム手数料</p>
                <p className="text-2xl font-bold">¥856,000</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">出金待ち</p>
                <p className="text-2xl font-bold">{pendingRequests.length}件</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">出金待ち金額</p>
                <p className="text-2xl font-bold">¥{totalPendingAmount.toLocaleString()}</p>
              </div>
              <ArrowDownToLine className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdrawals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="withdrawals" className="gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            出金申請
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions" className="gap-2">
            <CreditCard className="h-4 w-4" />
            取引履歴
          </TabsTrigger>
        </TabsList>

        <TabsContent value="withdrawals" className="space-y-4">
          {/* Withdrawal Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>出金申請一覧</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タレント</TableHead>
                    <TableHead>申請額</TableHead>
                    <TableHead>振込先</TableHead>
                    <TableHead>申請日</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawalRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {request.talent.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{request.talent}</p>
                            <p className="text-sm text-muted-foreground">{request.owner}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ¥{request.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{request.bankName}</p>
                          <p className="text-muted-foreground">{request.branchName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        {request.status === "pending" ? (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            処理待ち
                          </Badge>
                        ) : (
                          <Badge className="gap-1 bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            完了
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === "pending" && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedRequest(request)}
                              >
                                処理
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>出金処理</DialogTitle>
                                <DialogDescription>
                                  以下の出金申請を処理します
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRequest && (
                                <div className="space-y-4">
                                  <div className="rounded-lg border p-4">
                                    <div className="mb-4 flex items-center gap-3">
                                      <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                          {selectedRequest.talent.slice(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{selectedRequest.talent}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {selectedRequest.owner}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">出金額</span>
                                        <span className="font-medium">
                                          ¥{selectedRequest.amount.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">振込先銀行</span>
                                        <span>{selectedRequest.bankName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">支店名</span>
                                        <span>{selectedRequest.branchName}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">口座種別</span>
                                        <span>{selectedRequest.accountType}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">口座番号</span>
                                        <span>{selectedRequest.accountNumber}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">口座名義</span>
                                        <span>{selectedRequest.accountHolder}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="rounded-lg bg-amber-50 p-3">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600" />
                                      <p className="text-sm text-amber-700">
                                        振込処理完了後に「完了」ボタンを押してください
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <DialogFooter className="gap-2 sm:gap-0">
                                <Button variant="outline">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  却下
                                </Button>
                                <Button>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  完了
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="ユーザー名、タレント名で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="取引種別" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="support">支援</SelectItem>
                    <SelectItem value="refund">返金</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>種別</TableHead>
                    <TableHead>支援者</TableHead>
                    <TableHead>タレント</TableHead>
                    <TableHead>プラン</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>手数料</TableHead>
                    <TableHead>純額</TableHead>
                    <TableHead>日時</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {tx.type === "support" ? (
                          <Badge className="bg-green-100 text-green-700">支援</Badge>
                        ) : (
                          <Badge variant="destructive">返金</Badge>
                        )}
                      </TableCell>
                      <TableCell>{tx.from}</TableCell>
                      <TableCell>{tx.to}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.plan}</Badge>
                      </TableCell>
                      <TableCell className={tx.amount < 0 ? "text-red-500" : ""}>
                        ¥{tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className={tx.fee < 0 ? "text-red-500" : ""}>
                        ¥{tx.fee.toLocaleString()}
                      </TableCell>
                      <TableCell className={tx.net < 0 ? "text-red-500" : ""}>
                        ¥{tx.net.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {new Date(tx.createdAt).toLocaleString("ja-JP")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
