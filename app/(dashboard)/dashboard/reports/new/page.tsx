"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Send, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function NewReportPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talentId")

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [activeTalentId, setActiveTalentId] = useState<string | null>(talentId)

  useEffect(() => {
    if (talentId) { setActiveTalentId(talentId); return }
    async function getTalent() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("talents")
        .select("id")
        .eq("operator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      if (data) setActiveTalentId(data.id)
    }
    getTalent()
  }, [talentId])

  async function handleSubmit(isDraft: boolean) {
    if (!title.trim() || !content.trim()) return
    if (!activeTalentId) { setError("タレントが見つかりません"); return }

    setIsSubmitting(true)
    setError("")
    const supabase = createClient()
    const { error: insertError } = await supabase.from("reports").insert({
      talent_id: activeTalentId,
      title: title.trim(),
      body: content.trim(),
      is_public: isDraft ? false : isPublic,
    })

    if (insertError) {
      setError("投稿に失敗しました: " + insertError.message)
      setIsSubmitting(false)
      return
    }

    router.push(`/dashboard/reports${activeTalentId ? `?talentId=${activeTalentId}` : ""}`)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/reports">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">新しい活動報告</h1>
          <p className="text-muted-foreground">サポーターへの活動報告を作成します</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>内容</CardTitle>
              <CardDescription>活動報告の内容を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  placeholder="活動報告のタイトルを入力"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">本文 *</Label>
                <Textarea
                  id="content"
                  placeholder="活動報告の内容を入力..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>公開設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>一般公開</Label>
                  <p className="text-xs text-muted-foreground">
                    {isPublic ? "誰でも閲覧できます" : "サポーターのみ閲覧できます"}
                  </p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>
          )}

          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                className="w-full"
                disabled={!title.trim() || !content.trim() || isSubmitting}
                onClick={() => handleSubmit(false)}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "投稿中..." : "投稿する"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={!title.trim() || !content.trim() || isSubmitting}
                onClick={() => handleSubmit(true)}
              >
                <Save className="h-4 w-4 mr-2" />
                下書き保存
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/dashboard/reports">キャンセル</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
