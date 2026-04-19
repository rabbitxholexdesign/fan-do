"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
} from "@/components/ui/dialog"
import {
  CreditCard,
  ArrowDownToLine,
  ArrowUpRight,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  Receipt,
  BadgeJapaneseYen,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// ── 定数 ─────────────────────────────────────────────────────
const PLATFORM_FEE_RATE = 0.20 // 20%

// ── 型定義 ───────────────────────────────────────────────────
interface TalentRevenue {
  talent_id: string
  talent_name: string
  status: string
  active_subscribers: number
  gross_monthly: number        // 総月次売上
  fee_amount: number           // プラットフォーム手数料
  payout_amount: number        // タレント振込予定額
  bank: {
    id: string
    bank_name: string
    branch_name: string
    account_type: string
    account_number: string
    account_holder: string
    verified: boolean | null
  } | null
  last_payout_at: string | null
  last_payout_month: string | null
}

interface PayoutRecord {
  id: string
  talent_id: string
  talent_name: string
  amount: number
  fee_amount: number
  gross_amount: number
  period_month: string
  note: string | null
  processed_at: string
  bank_snapshot: {
    bank_name: string
    branch_name: string
    account_number: string
    account_holder: string
  }
}

// ── ユーティリティ ───────────────────────────────────────────
function currentYearMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function formatMonth(ym: string) {
  const [y, m] = ym.split("-")
  return `${y}年${parseInt(m)}月`
}

// ── コンポーネント ────────────────────────────────────────────
export default function AdminRevenuePage() {
  const [revenues, setRevenues] = useState<TalentRevenue[]>([])
  const [payoutHistory, setPayoutHistory] = useState<PayoutRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(currentYearMonth())

  // 振込処理ダイアログ
  const [dialogOpen, setDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processNote, setProcessNote] = useState("")
  const [selectedTalent, setSelectedTalent] = useState<TalentRevenue | null>(null)
  const [processResult, setProcessResult] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()

    // ① アクティブサブスクリプションとプラン価格を取得
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("talent_id, plan_id, support_plans(price, billing_cycle)")
      .eq("status", "active")

    // ② タレント情報を取得
    const { data: talents } = await supabase
      .from("talents")
      .select("id, name, status")
      .eq("status", "active")

    // ③ 銀行口座を取得
    const { data: banks } = await supabase
      .from("bank_accounts")
      .select("id, talent_id, bank_name, branch_name, account_type, account_number, account_holder, verified")

    // ④ 振込履歴（最新1件）を取得
    const { data: payouts } = await supabase
      .from("payout_records")
      .select("talent_id, processed_at, period_month")
      .order("processed_at", { ascending: false })

    // ⑤ 振込履歴（全件・表示用）
    const { data: allPayouts } = await supabase
      .from("payout_records")
      .select("id, talent_id, amount, fee_amount, gross_amount, period_month, note, processed_at, bank_snapshot")
      .order("processed_at", { ascending: false })
      .limit(100)

    // タレントIDごとの最新振込
    const latestPayoutMap = new Map<string, { processed_at: string; period_month: string }>()
    for (const p of payouts ?? []) {
      if (!latestPayoutMap.has(p.talent_id)) {
        latestPayoutMap.set(p.talent_id, { processed_at: p.processed_at, period_month: p.period_month })
      }
    }

    // タレントIDごとのサブスク集計
    const subMap = new Map<string, number>() // talent_id → monthly gross
    const subCountMap = new Map<string, number>()
    for (const sub of subs ?? []) {
      const plan = sub.support_plans as { price: number; billing_cycle: string } | null
      if (!plan) continue
      // billing_cycleに応じて月額換算
      let monthly = plan.price
      if (plan.billing_cycle === "yearly") monthly = Math.round(plan.price / 12)
      if (plan.billing_cycle === "quarterly") monthly = Math.round(plan.price / 3)
      subMap.set(sub.talent_id, (subMap.get(sub.talent_id) ?? 0) + monthly)
      subCountMap.set(sub.talent_id, (subCountMap.get(sub.talent_id) ?? 0) + 1)
    }

    // タレントIDごとの銀行口座
    const bankMap = new Map<string, TalentRevenue["bank"]>()
    for (const b of banks ?? []) {
      bankMap.set(b.talent_id, b)
    }

    // 集計
    const result: TalentRevenue[] = (talents ?? []).map((t) => {
      const gross = subMap.get(t.id) ?? 0
      const fee = Math.round(gross * PLATFORM_FEE_RATE)
      const payout = gross - fee
      const latestPayout = latestPayoutMap.get(t.id) ?? null
      return {
        talent_id: t.id,
        talent_name: t.name,
        status: t.status,
        active_subscribers: subCountMap.get(t.id) ?? 0,
        gross_monthly: gross,
        fee_amount: fee,
        payout_amount: payout,
        bank: bankMap.get(t.id) ?? null,
        last_payout_at: latestPayout?.processed_at ?? null,
        last_payout_month: latestPayout?.period_month ?? null,
      }
    })

    // 振込履歴にタレント名を付与
    const talentNameMap = new Map((talents ?? []).map((t) => [t.id, t.name]))
    const historyWithNames: PayoutRecord[] = (allPayouts ?? []).map((p) => ({
      ...p,
      talent_name: talentNameMap.get(p.talent_id) ?? p.talent_id,
    }))

    setRevenues(result)
    setPayoutHistory(historyWithNames)
    setIsLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // 振込処理の実行
  async function handlePayout() {
    if (!selectedTalent?.bank) return
    setProcessing(true)
    setProcessResult(null)

    const supabase = createClient()
    const { error } = await supabase.from("payout_records").insert({
      talent_id: selectedTalent.talent_id,
      amount: selectedTalent.payout_amount,
      fee_amount: selectedTalent.fee_amount,
      gross_amount: selectedTalent.gross_monthly,
      period_month: selectedMonth,
      note: processNote.trim() || null,
      bank_snapshot: {
        bank_name: selectedTalent.bank.bank_name,
        branch_name: selectedTalent.bank.branch_name,
        account_type: selectedTalent.bank.account_type,
        account_number: selectedTalent.bank.account_number,
        account_holder: selectedTalent.bank.account_holder,
      },
    })

    if (error) {
      setProcessResult({ type: "error", text: "記録に失敗しました: " + error.message })
    } else {
      setProcessResult({ type: "success", text: "振込処理を記録しました" })
      setProcessNote("")
      await fetchData()
      setTimeout(() => setDialogOpen(false), 1200)
    }
    setProcessing(false)
  }

  // 集計
  const totalGross = revenues.reduce((s, r) => s + r.gross_monthly, 0)
  const totalFee = revenues.reduce((s, r) => s + r.fee_amount, 0)
  const totalPayout = revenues.reduce((s, r) => s + r.payout_amount, 0)
  const unprocessedCount = revenues.filter(
    (r) => r.payout_amount > 0 && r.last_payout_month !== selectedMonth
  ).length

  const filtered = revenues.filter(
    (r) =>
      !search ||
      r.talent_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">収益・振込管理</h1>
          <p className="text-muted-foreground">タレント別の月次収益確認と振込処理を行います</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {/* KPI カード */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">月次GMV</p>
                <p className="text-2xl font-bold">¥{totalGross.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatMonth(selectedMonth)}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">プラットフォーム手数料</p>
                <p className="text-2xl font-bold">¥{totalFee.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{(PLATFORM_FEE_RATE * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-full bg-green-50 p-3">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">タレント振込予定額</p>
                <p className="text-2xl font-bold">¥{totalPayout.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{(100 - PLATFORM_FEE_RATE * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-full bg-orange-50 p-3">
                <BadgeJapaneseYen className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">未処理の振込</p>
                <p className="text-2xl font-bold">{unprocessedCount}件</p>
                <p className="text-xs text-muted-foreground mt-1">{formatMonth(selectedMonth)}分</p>
              </div>
              <div className={`rounded-full p-3 ${unprocessedCount > 0 ? "bg-amber-50" : "bg-muted"}`}>
                <ArrowDownToLine className={`h-6 w-6 ${unprocessedCount > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* タブ */}
      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue" className="gap-2">
            <CreditCard className="h-4 w-4" />
            タレント別収益
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Receipt className="h-4 w-4" />
            振込履歴
          </TabsTrigger>
        </TabsList>

        {/* ── タレント別収益タブ ── */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="タレント名で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 text-center text-muted-foreground">読み込み中...</div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  アクティブなタレントが見つかりません
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>タレント</TableHead>
                      <TableHead className="text-right">サポーター数</TableHead>
                      <TableHead className="text-right">月次売上</TableHead>
                      <TableHead className="text-right">手数料(20%)</TableHead>
                      <TableHead className="text-right">振込予定額</TableHead>
                      <TableHead>振込先口座</TableHead>
                      <TableHead>今月処理</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => {
                      const alreadyProcessed = r.last_payout_month === selectedMonth
                      const canProcess = r.payout_amount > 0 && !!r.bank && r.bank.verified === true && !alreadyProcessed

                      return (
                        <TableRow key={r.talent_id}>
                          {/* タレント */}
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {r.talent_name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{r.talent_name}</span>
                            </div>
                          </TableCell>
                          {/* サポーター数 */}
                          <TableCell className="text-right">{r.active_subscribers}名</TableCell>
                          {/* 月次売上 */}
                          <TableCell className="text-right font-medium">
                            ¥{r.gross_monthly.toLocaleString()}
                          </TableCell>
                          {/* 手数料 */}
                          <TableCell className="text-right text-muted-foreground">
                            ¥{r.fee_amount.toLocaleString()}
                          </TableCell>
                          {/* 振込予定額 */}
                          <TableCell className="text-right font-semibold text-primary">
                            ¥{r.payout_amount.toLocaleString()}
                          </TableCell>
                          {/* 振込先口座 */}
                          <TableCell>
                            {r.bank ? (
                              <div className="text-sm">
                                <p className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3 text-muted-foreground" />
                                  {r.bank.bank_name}
                                </p>
                                <p className="text-muted-foreground">{r.bank.account_number}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">未登録</span>
                            )}
                            {r.bank && r.bank.verified !== true && (
                              <Badge variant="outline" className="mt-1 text-xs text-amber-600 border-amber-300">
                                要確認
                              </Badge>
                            )}
                          </TableCell>
                          {/* 今月処理状況 */}
                          <TableCell>
                            {alreadyProcessed ? (
                              <Badge className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                                <CheckCircle2 className="h-3 w-3" />
                                処理済み
                              </Badge>
                            ) : r.payout_amount === 0 ? (
                              <span className="text-xs text-muted-foreground">対象外</span>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                未処理
                              </Badge>
                            )}
                          </TableCell>
                          {/* 操作 */}
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              disabled={!canProcess}
                              onClick={() => {
                                setSelectedTalent(r)
                                setProcessResult(null)
                                setProcessNote("")
                                setDialogOpen(true)
                              }}
                            >
                              振込処理
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            ※ 振込処理ボタンは口座確認済みかつ未処理の場合のみ有効です。口座確認は
            <a href="/admin/applications" className="underline ml-1">タレント申請ページ</a>
            から行ってください。
          </p>
        </TabsContent>

        {/* ── 振込履歴タブ ── */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>振込処理履歴</CardTitle>
              <CardDescription>管理者が記録した振込処理の一覧です</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="py-16 text-center text-muted-foreground">読み込み中...</div>
              ) : payoutHistory.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  振込履歴がありません
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>タレント</TableHead>
                      <TableHead>対象月</TableHead>
                      <TableHead className="text-right">売上</TableHead>
                      <TableHead className="text-right">手数料</TableHead>
                      <TableHead className="text-right">振込額</TableHead>
                      <TableHead>振込先</TableHead>
                      <TableHead>処理日</TableHead>
                      <TableHead>メモ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payoutHistory.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.talent_name}</TableCell>
                        <TableCell>{formatMonth(p.period_month)}</TableCell>
                        <TableCell className="text-right">¥{p.gross_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ¥{p.fee_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          ¥{p.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{p.bank_snapshot.bank_name}</p>
                            <p className="text-muted-foreground">{p.bank_snapshot.account_number}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(p.processed_at).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                          {p.note ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── 振込処理ダイアログ ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>振込処理の記録</DialogTitle>
            <DialogDescription>
              実際の振込完了後にこのボタンを押してください
            </DialogDescription>
          </DialogHeader>

          {selectedTalent && selectedTalent.bank && (
            <div className="space-y-4">
              {/* タレント情報 */}
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedTalent.talent_name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedTalent.talent_name}</p>
                  <p className="text-sm text-muted-foreground">{formatMonth(selectedMonth)}分</p>
                </div>
              </div>

              {/* 金額 */}
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">月次売上</span>
                  <span>¥{selectedTalent.gross_monthly.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">手数料 (20%)</span>
                  <span>− ¥{selectedTalent.fee_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span>振込金額</span>
                  <span className="text-primary text-base">¥{selectedTalent.payout_amount.toLocaleString()}</span>
                </div>
              </div>

              {/* 口座情報 */}
              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <p className="font-medium flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4" />
                  振込先口座
                </p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">銀行名</span>
                  <span>{selectedTalent.bank.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">支店名</span>
                  <span>{selectedTalent.bank.branch_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">口座種別</span>
                  <span>{selectedTalent.bank.account_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">口座番号</span>
                  <span>{selectedTalent.bank.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">口座名義</span>
                  <span>{selectedTalent.bank.account_holder}</span>
                </div>
              </div>

              {/* メモ */}
              <div className="space-y-2">
                <Label htmlFor="note">メモ（任意）</Label>
                <Textarea
                  id="note"
                  placeholder="振込参照番号など"
                  value={processNote}
                  onChange={(e) => setProcessNote(e.target.value)}
                  rows={2}
                />
              </div>

              {/* 注意書き */}
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>実際の銀行振込を完了してから「振込完了を記録」を押してください</span>
              </div>

              {/* 結果 */}
              {processResult && (
                <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                  processResult.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-destructive/10 text-destructive"
                }`}>
                  {processResult.type === "success"
                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                    : <AlertCircle className="h-4 w-4 shrink-0" />}
                  {processResult.text}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={processing}>
              キャンセル
            </Button>
            <Button onClick={handlePayout} disabled={processing}>
              {processing ? "記録中..." : "振込完了を記録"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
