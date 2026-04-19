"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, FileText, ExternalLink, User, Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type KycStatus = "pending" | "approved" | "rejected"

interface KycDetail {
  id: string
  talent_id: string
  kyc_type: "individual" | "corporate" | "organization"
  status: KycStatus
  document_urls: Record<string, string | string[]>
  rejection_reason: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewer: { display_name: string | null } | null
  talent: { name: string; status: string } | null
}

const KYC_TYPE_LABELS: Record<string, string> = {
  individual: "個人",
  corporate: "法人",
  organization: "団体",
}

const STATUS_CONFIG: Record<KycStatus, { label: string; color: string }> = {
  pending:  { label: "審査待ち", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved: { label: "承認済み", color: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "却下",    color: "bg-red-100 text-red-800 border-red-200" },
}

const DOCUMENT_LABELS: Record<string, string> = {
  identity_card:       "身分証明書（表）",
  identity_card_back:  "身分証明書（裏）",
  residence_card:      "在留カード",
  corporate_registry:  "登記簿謄本",
  articles:            "定款",
  representative_id:   "代表者身分証",
  bank_statement:      "通帳コピー",
  other:               "その他書類",
}

export default function AdminKycReviewPage() {
  const params = useParams()
  const router = useRouter()
  const talentId = params.id as string

  const [kyc, setKyc] = useState<KycDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data } = await supabase
        .from("kyc_submissions")
        .select(`
          id, talent_id, kyc_type, status, document_urls,
          rejection_reason, submitted_at, reviewed_at,
          reviewer:reviewed_by(display_name),
          talent:talent_id(name, status)
        `)
        .eq("talent_id", talentId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setKyc(data as unknown as KycDetail)
        if (data.rejection_reason) setRejectionReason(data.rejection_reason)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  async function handleApprove() {
    if (!kyc) return
    setActionLoading(true)
    setMessage(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("kyc_submissions")
      .update({
        status: "approved",
        rejection_reason: null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", kyc.id)

    if (error) {
      setMessage({ type: "error", text: "承認に失敗しました: " + error.message })
    } else {
      // Advance talent status to pending_final if still pending_kyc
      await supabase
        .from("talents")
        .update({ status: "pending_final" })
        .eq("id", talentId)
        .eq("status", "pending_kyc")

      // Record audit log
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action: "approve_kyc",
        target_type: "kyc_submission",
        target_id: kyc.id,
      })

      setKyc((prev) => prev ? { ...prev, status: "approved", reviewed_at: new Date().toISOString() } : prev)
      setMessage({ type: "success", text: "KYCを承認しました" })
    }
    setActionLoading(false)
  }

  async function handleReject() {
    if (!kyc || !rejectionReason.trim()) return
    setActionLoading(true)
    setMessage(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("kyc_submissions")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason.trim(),
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", kyc.id)

    if (error) {
      setMessage({ type: "error", text: "却下に失敗しました: " + error.message })
    } else {
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action: "reject_kyc",
        target_type: "kyc_submission",
        target_id: kyc.id,
        note: rejectionReason.trim(),
      })

      setKyc((prev) => prev ? { ...prev, status: "rejected", rejection_reason: rejectionReason.trim() } : prev)
      setMessage({ type: "success", text: "KYCを却下しました" })
    }
    setActionLoading(false)
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
  }

  if (!kyc) {
    return (
      <div className="space-y-4">
        <Link href={`/admin/applications/${talentId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          審査詳細に戻る
        </Link>
        <p className="text-muted-foreground">KYC申請が見つかりません</p>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[kyc.status]
  const docs = Object.entries(kyc.document_urls ?? {})

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/applications/${talentId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          審査詳細に戻る
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">KYC審査</h1>
          <p className="text-muted-foreground text-sm mt-1">{kyc.talent?.name}</p>
        </div>
        <Badge className={`border ${statusConfig.color}`}>{statusConfig.label}</Badge>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200"
            : "bg-destructive/10 text-destructive border border-destructive/20"
        }`}>
          {message.text}
        </div>
      )}

      {/* KYC Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {kyc.kyc_type === "individual" ? <User className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
            申請情報
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground">KYC種別</p>
              <p className="font-medium">{KYC_TYPE_LABELS[kyc.kyc_type]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">提出日</p>
              <p className="font-medium">{new Date(kyc.submitted_at).toLocaleDateString("ja-JP")}</p>
            </div>
            {kyc.reviewed_at && (
              <div>
                <p className="text-muted-foreground">審査日</p>
                <p className="font-medium">{new Date(kyc.reviewed_at).toLocaleDateString("ja-JP")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            提出書類
          </CardTitle>
        </CardHeader>
        <CardContent>
          {docs.length === 0 ? (
            <p className="text-sm text-muted-foreground">書類が提出されていません</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {docs.map(([key, value]) => {
                const urls = Array.isArray(value) ? value : [value]
                return (
                  <div key={key} className="space-y-2">
                    <p className="text-sm font-medium">{DOCUMENT_LABELS[key] ?? key}</p>
                    <div className="flex flex-wrap gap-2">
                      {urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block"
                        >
                          {url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                            <img
                              src={url}
                              alt={`${DOCUMENT_LABELS[key] ?? key} ${i + 1}`}
                              className="w-32 h-24 object-cover rounded-lg border group-hover:opacity-80 transition-opacity"
                            />
                          ) : (
                            <div className="w-32 h-24 rounded-lg border bg-muted flex flex-col items-center justify-center gap-1 text-muted-foreground group-hover:bg-muted/80 transition-colors">
                              <FileText className="h-8 w-8" />
                              <span className="text-xs">書類を開く</span>
                            </div>
                          )}
                          <ExternalLink className="absolute top-1 right-1 h-3 w-3 text-white drop-shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection reason */}
      {kyc.status === "rejected" && kyc.rejection_reason && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-700">却下理由</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{kyc.rejection_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Action area — only shown for pending */}
      {kyc.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">審査アクション</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejection">却下理由（却下する場合は必須）</Label>
              <Textarea
                id="rejection"
                placeholder="不備の内容や再提出時の注意点を記入してください..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="resize-none min-h-[100px]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                承認する
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                却下する
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
