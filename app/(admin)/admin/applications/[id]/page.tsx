"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Building2, Users, AlertTriangle, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type TalentStatus = "pending_review" | "pending_kyc" | "pending_final" | "active" | "rejected"

interface TalentDetail {
  id: string
  name: string
  category: string
  tags: string[]
  prefecture: string | null
  city: string | null
  description: string | null
  status: TalentStatus
  created_at: string
  operator: { id: string; display_name: string | null; email: string } | null
}

interface KycSubmission {
  id: string
  kyc_type: "individual" | "corporate" | "organization"
  status: string
  submitted_at: string
}

interface BankAccount {
  id: string
  bank_name: string
  branch_name: string
  account_type: string
  account_number: string
  account_holder: string
}

interface LegalNotice {
  seller_name: string
  address: string
  phone: string
  email: string
  cancel_policy: string
  delivery_timing: string
}

interface SupportPlan {
  id: string
  name: string
  price: number
  billing_cycle: string
  description: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  hito: "ひと", mono: "もの", koto: "こと",
}

const KYC_TYPE_LABELS: Record<string, string> = {
  individual: "個人", corporate: "法人", organization: "団体",
}

const STATUS_CONFIG: Record<TalentStatus, { label: string; color: string }> = {
  pending_review: { label: "一次審査待ち", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  pending_kyc:    { label: "KYC審査待ち", color: "bg-blue-100 text-blue-800 border-blue-200" },
  pending_final:  { label: "最終承認待ち", color: "bg-orange-100 text-orange-800 border-orange-200" },
  active:         { label: "承認済み", color: "bg-green-100 text-green-800 border-green-200" },
  rejected:       { label: "却下", color: "bg-red-100 text-red-800 border-red-200" },
}

export default function AdminApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [talent, setTalent] = useState<TalentDetail | null>(null)
  const [kyc, setKyc] = useState<KycSubmission | null>(null)
  const [bank, setBank] = useState<BankAccount | null>(null)
  const [legal, setLegal] = useState<LegalNotice | null>(null)
  const [plans, setPlans] = useState<SupportPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const [talentRes, kycRes, bankRes, legalRes, plansRes] = await Promise.all([
        supabase
          .from("talents")
          .select("id, name, category, tags, prefecture, city, description, status, created_at, operator:operator_id(id, display_name, email)")
          .eq("id", id)
          .single(),
        supabase
          .from("kyc_submissions")
          .select("id, kyc_type, status, submitted_at")
          .eq("talent_id", id)
          .order("submitted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("bank_accounts")
          .select("id, bank_name, branch_name, account_type, account_number, account_holder")
          .eq("talent_id", id)
          .maybeSingle(),
        supabase
          .from("legal_notices")
          .select("seller_name, address, phone, email, cancel_policy, delivery_timing")
          .eq("talent_id", id)
          .maybeSingle(),
        supabase
          .from("support_plans")
          .select("id, name, price, billing_cycle, description")
          .eq("talent_id", id)
          .order("price", { ascending: true }),
      ])

      if (talentRes.data) setTalent(talentRes.data as unknown as TalentDetail)
      if (kycRes.data) setKyc(kycRes.data as KycSubmission)
      if (bankRes.data) setBank(bankRes.data as BankAccount)
      if (legalRes.data) setLegal(legalRes.data as LegalNotice)
      if (plansRes.data) setPlans(plansRes.data as SupportPlan[])
      setIsLoading(false)
    }

    fetchData()
  }, [id])

  const handleAction = async (action: "approve" | "reject" | "request_kyc" | "publish") => {
    setActionLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("ログインが必要です"); setActionLoading(false); return }

    const nextStatus: Record<string, TalentStatus> = {
      approve:     "pending_kyc",
      request_kyc: "pending_final",
      publish:     "active",
      reject:      "rejected",
    }

    const { error: updateError, count } = await supabase
      .from("talents")
      .update({ status: nextStatus[action] })
      .eq("id", id)
      .select("id", { count: "exact", head: true })

    if (updateError) {
      setError("更新に失敗しました: " + updateError.message)
      setActionLoading(false)
      return
    }

    if (count === 0) {
      setError("権限がありません。管理者ロールが設定されているか確認してください。")
      setActionLoading(false)
      return
    }

    // Audit log
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action,
      target_type: "talent",
      target_id: id,
      after_state: { status: nextStatus[action] },
      note: note || null,
    })

    router.push("/admin/applications")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">読み込み中...</div>
    )
  }

  if (!talent) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">申請が見つかりませんでした</p>
        <Button asChild variant="outline">
          <Link href="/admin/applications">一覧に戻る</Link>
        </Button>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[talent.status]
  const location = [talent.prefecture, talent.city].filter(Boolean).join(" ")

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/applications">
            <ArrowLeft className="h-4 w-4 mr-1" />
            一覧に戻る
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{talent.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
            <span className="text-sm text-muted-foreground">
              申請日: {new Date(talent.created_at).toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <Card>
            <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="タレント名" value={talent.name} />
              <InfoRow label="カテゴリ" value={CATEGORY_LABELS[talent.category] ?? talent.category} />
              <InfoRow label="活動地域" value={location || "—"} />
              <InfoRow label="タグ" value={talent.tags.join("、") || "—"} />
              <div>
                <p className="text-sm text-muted-foreground mb-1">紹介文</p>
                <p className="text-sm whitespace-pre-wrap">{talent.description || "—"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Operator */}
          <Card>
            <CardHeader><CardTitle className="text-base">申請者情報</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="氏名" value={talent.operator?.display_name ?? "—"} />
              <InfoRow label="メール" value={talent.operator?.email ?? "—"} />
            </CardContent>
          </Card>

          {/* KYC */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">本人確認（KYC）</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/applications/${id}/kyc`}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  KYC審査ページ
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {kyc ? (
                <div className="space-y-3">
                  <InfoRow label="事業形態" value={KYC_TYPE_LABELS[kyc.kyc_type] ?? kyc.kyc_type} />
                  <InfoRow label="提出日" value={new Date(kyc.submitted_at).toLocaleDateString("ja-JP")} />
                  <InfoRow label="ステータス" value={kyc.status} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">KYC情報が未提出です</p>
              )}
            </CardContent>
          </Card>

          {/* Bank */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">振込先口座</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/applications/${id}/bank`}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  口座確認ページ
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {bank ? (
                <div className="space-y-3">
                  <InfoRow label="金融機関" value={bank.bank_name} />
                  <InfoRow label="支店名" value={bank.branch_name} />
                  <InfoRow label="口座種別" value={bank.account_type} />
                  <InfoRow label="口座番号" value={`****${bank.account_number.slice(-3)}`} />
                  <InfoRow label="口座名義" value={bank.account_holder} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">口座情報が未登録です</p>
              )}
            </CardContent>
          </Card>

          {/* Legal */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">特定商取引法</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/applications/${id}/legal`}>
                  <ExternalLink className="h-3 w-3 mr-1" />
                  法的情報確認ページ
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {legal ? (
                <div className="space-y-3">
                  <InfoRow label="販売業者名" value={legal.seller_name} />
                  <InfoRow label="所在地" value={legal.address} />
                  <InfoRow label="電話番号" value={legal.phone} />
                  <InfoRow label="メール" value={legal.email} />
                  <InfoRow label="提供時期" value={legal.delivery_timing} />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">キャンセルポリシー</p>
                    <p className="text-sm">{legal.cancel_policy}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">特定商取引法情報が未登録です</p>
              )}
            </CardContent>
          </Card>

          {/* Support Plans */}
          <Card>
            <CardHeader><CardTitle className="text-base">支援プラン</CardTitle></CardHeader>
            <CardContent>
              {plans.length > 0 ? (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{plan.name}</p>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          ¥{plan.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plan.billing_cycle === "monthly" ? "月額" : "年額"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">支援プランが未登録です</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          <Card className="sticky top-24">
            <CardHeader><CardTitle className="text-base">審査アクション</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">審査メモ（任意）</Label>
                <Textarea
                  placeholder="却下理由や特記事項を入力..."
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Actions by status */}
              {talent.status === "pending_review" && (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleAction("approve")}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    一次審査を通過させる
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    却下する
                  </Button>
                </div>
              )}

              {talent.status === "pending_kyc" && (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={() => handleAction("request_kyc")}
                    disabled={actionLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    KYC確認完了・最終審査へ
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    却下する
                  </Button>
                </div>
              )}

              {talent.status === "pending_final" && (
                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <Link href={`/admin/applications/${id}/approve`}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      最終承認ページへ
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleAction("reject")}
                    disabled={actionLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    却下する
                  </Button>
                </div>
              )}

              {(talent.status === "active" || talent.status === "rejected") && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground text-center">
                  {talent.status === "active" ? "このタレントは公開済みです" : "このタレントは却下済みです"}
                </div>
              )}

              {actionLoading && (
                <p className="text-sm text-center text-muted-foreground">処理中...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="col-span-2 font-medium">{value}</dd>
    </div>
  )
}
