"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, ShieldCheck, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TalentSummary {
  id: string
  name: string
  category: string
  status: string
}

interface CheckItem {
  label: string
  verified: boolean | null
}

const CATEGORY_LABELS: Record<string, string> = {
  hito: "ひと",
  mono: "もの",
  koto: "こと",
}

export default function AdminApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const talentId = params.id as string

  const [talent, setTalent] = useState<TalentSummary | null>(null)
  const [checks, setChecks] = useState<CheckItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [note, setNote] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const [talentRes, kycRes, bankRes, legalRes] = await Promise.all([
        supabase.from("talents").select("id, name, category, status").eq("id", talentId).single(),
        supabase.from("kyc_submissions").select("status").eq("talent_id", talentId).order("submitted_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("bank_accounts").select("verified").eq("talent_id", talentId).maybeSingle(),
        supabase.from("legal_notices").select("verified").eq("talent_id", talentId).maybeSingle(),
      ])

      if (talentRes.data) setTalent(talentRes.data as TalentSummary)

      setChecks([
        {
          label: "KYC審査",
          verified: kycRes.data ? kycRes.data.status === "approved" : null,
        },
        {
          label: "振込先口座",
          verified: bankRes.data ? bankRes.data.verified === true : null,
        },
        {
          label: "特定商取引法",
          verified: legalRes.data ? legalRes.data.verified === true : null,
        },
      ])

      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  const allPassed = checks.length > 0 && checks.every((c) => c.verified === true)

  async function handleApprove() {
    setActionLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: updateError } = await supabase
      .from("talents")
      .update({ status: "active" })
      .eq("id", talentId)

    if (updateError) {
      setError("承認に失敗しました: " + updateError.message)
      setActionLoading(false)
      return
    }

    await supabase.from("admin_audit_logs").insert({
      admin_id: user?.id,
      action: "approve_talent",
      target_type: "talent",
      target_id: talentId,
      after_state: { status: "active" },
      note: note.trim() || null,
    })

    router.push("/admin/applications")
  }

  async function handleReject() {
    if (!note.trim()) {
      setError("却下理由を入力してください")
      return
    }
    setActionLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: updateError } = await supabase
      .from("talents")
      .update({ status: "rejected" })
      .eq("id", talentId)

    if (updateError) {
      setError("却下に失敗しました: " + updateError.message)
      setActionLoading(false)
      return
    }

    await supabase.from("admin_audit_logs").insert({
      admin_id: user?.id,
      action: "reject_talent",
      target_type: "talent",
      target_id: talentId,
      after_state: { status: "rejected" },
      note: note.trim(),
    })

    router.push("/admin/applications")
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
  }

  if (!talent) {
    return (
      <div className="space-y-4">
        <Link href="/admin/applications" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          一覧に戻る
        </Link>
        <p className="text-muted-foreground">申請が見つかりません</p>
      </div>
    )
  }

  const isAlreadyProcessed = talent.status === "active" || talent.status === "rejected"

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href={`/admin/applications/${talentId}`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        審査詳細に戻る
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" />
          最終承認
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {talent.name}（{CATEGORY_LABELS[talent.category] ?? talent.category}）
        </p>
      </div>

      {/* Check list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">審査チェックリスト</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm font-medium">{item.label}</span>
              {item.verified === true ? (
                <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  確認済み
                </span>
              ) : item.verified === false ? (
                <span className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  <XCircle className="h-3 w-3" />
                  要確認
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="h-3 w-3" />
                  未確認
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {!allPassed && !isAlreadyProcessed && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>全ての審査項目が確認済みになっていません。各サブページで確認を完了してから承認してください。</p>
        </div>
      )}

      {isAlreadyProcessed ? (
        <div className="p-4 rounded-lg bg-muted text-sm text-muted-foreground text-center">
          {talent.status === "active" ? "このタレントはすでに公開済みです" : "このタレントはすでに却下済みです"}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">最終判断</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">審査メモ / 却下理由（却下する場合は必須）</Label>
              <Textarea
                id="note"
                placeholder="特記事項や却下理由を入力..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none min-h-[100px]"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleApprove}
                disabled={actionLoading || !allPassed}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                承認・公開する
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                却下する
              </Button>
            </div>

            {!allPassed && (
              <p className="text-xs text-muted-foreground text-center">
                ※ 全項目確認済みになると「承認・公開」が有効になります
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
