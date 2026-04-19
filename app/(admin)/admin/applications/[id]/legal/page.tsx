"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, Scale } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface LegalNotice {
  id: string
  seller_name: string
  address: string
  phone: string
  email: string
  cancel_policy: string
  delivery_timing: string
  verified: boolean | null
  created_at: string
}

interface TalentBasic {
  name: string
  status: string
}

export default function AdminLegalVerifyPage() {
  const params = useParams()
  const talentId = params.id as string

  const [legal, setLegal] = useState<LegalNotice | null>(null)
  const [talent, setTalent] = useState<TalentBasic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [note, setNote] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const [legalRes, talentRes] = await Promise.all([
        supabase
          .from("legal_notices")
          .select("id, seller_name, address, phone, email, cancel_policy, delivery_timing, verified, created_at")
          .eq("talent_id", talentId)
          .maybeSingle(),
        supabase
          .from("talents")
          .select("name, status")
          .eq("id", talentId)
          .single(),
      ])
      if (legalRes.data) setLegal(legalRes.data as LegalNotice)
      if (talentRes.data) setTalent(talentRes.data as TalentBasic)
      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  async function handleAction(action: "verify" | "flag") {
    if (!legal) return
    setActionLoading(true)
    setMessage(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from("legal_notices")
      .update({ verified: action === "verify" })
      .eq("id", legal.id)

    if (error) {
      setMessage({ type: "error", text: "更新に失敗しました: " + error.message })
    } else {
      await supabase.from("admin_audit_logs").insert({
        admin_id: user?.id,
        action: action === "verify" ? "verify_legal" : "flag_legal",
        target_type: "legal_notice",
        target_id: legal.id,
        note: note.trim() || null,
      })
      setLegal((prev) => prev ? { ...prev, verified: action === "verify" } : prev)
      setMessage({
        type: "success",
        text: action === "verify" ? "特定商取引法情報を確認済みにしました" : "特定商取引法情報に要確認フラグを立てました",
      })
    }
    setActionLoading(false)
  }

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link
        href={`/admin/applications/${talentId}`}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        審査詳細に戻る
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="h-6 w-6" />
            特定商取引法情報の確認
          </h1>
          {talent && <p className="text-sm text-muted-foreground mt-1">{talent.name}</p>}
        </div>
        {legal && (
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
            legal.verified === true
              ? "bg-green-50 text-green-700 border-green-200"
              : legal.verified === false
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-yellow-50 text-yellow-700 border-yellow-200"
          }`}>
            {legal.verified === true ? "確認済み" : legal.verified === false ? "要確認" : "未確認"}
          </span>
        )}
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

      {!legal ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            特定商取引法情報が未登録です
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">特定商取引法に基づく表記</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow label="販売業者名" value={legal.seller_name} />
              <InfoRow label="所在地" value={legal.address} />
              <InfoRow label="電話番号" value={legal.phone} />
              <InfoRow label="メールアドレス" value={legal.email} />
              <InfoRow label="役務の提供時期" value={legal.delivery_timing} />
              <div className="text-sm">
                <dt className="text-muted-foreground mb-1">キャンセルポリシー</dt>
                <dd className="whitespace-pre-wrap font-medium">{legal.cancel_policy}</dd>
              </div>
              <InfoRow
                label="登録日"
                value={new Date(legal.created_at).toLocaleDateString("ja-JP")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">審査アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note">メモ（任意）</Label>
                <Textarea
                  id="note"
                  placeholder="確認内容や特記事項を入力..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none min-h-[80px]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleAction("verify")}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  確認済みにする
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => handleAction("flag")}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  要確認フラグ
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
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
