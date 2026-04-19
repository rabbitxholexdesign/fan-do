"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Eye, Heart, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Report {
  id: string
  title: string
  body: string
  is_public: boolean
  created_at: string
}

export default function ReportsPage() {
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talentId")

  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTalentId, setActiveTalentId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      let tid = talentId
      if (!tid) {
        const { data } = await supabase
          .from("talents")
          .select("id")
          .eq("operator_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
        tid = data?.id ?? null
      }
      if (!tid) { setIsLoading(false); return }
      setActiveTalentId(tid)

      const { data } = await supabase
        .from("reports")
        .select("id, title, body, is_public, created_at")
        .eq("talent_id", tid)
        .order("created_at", { ascending: false })

      if (data) setReports(data as Report[])
      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  async function deleteReport(id: string) {
    if (!confirm("この活動報告を削除しますか？")) return
    const supabase = createClient()
    await supabase.from("reports").delete().eq("id", id)
    setReports(reports.filter((r) => r.id !== id))
  }

  const newLink = `/dashboard/reports/new${activeTalentId ? `?talentId=${activeTalentId}` : ""}`

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">活動報告</h1>
          <p className="text-muted-foreground">サポーターへの活動報告を管理</p>
        </div>
        <Button asChild>
          <Link href={newLink}>
            <Plus className="h-4 w-4 mr-2" />
            新しい報告を作成
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center space-y-4">
            <p className="text-muted-foreground">活動報告がありません</p>
            <Button asChild>
              <Link href={newLink}>
                <Plus className="h-4 w-4 mr-2" />
                最初の活動報告を作成
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={report.is_public ? "secondary" : "outline"}>
                        {report.is_public ? "公開" : "サポーター限定"}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{report.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString("ja-JP")}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive" onSelect={() => deleteReport(report.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
