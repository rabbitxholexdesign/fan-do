"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, RefreshCw, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AuditLog {
  id: string
  action: string
  target_type: string
  target_id: string
  note: string | null
  created_at: string
  admin: { display_name: string | null } | null
}

const ACTION_CONFIG: Record<string, { label: string; color: string }> = {
  approve_talent:  { label: "タレント承認", color: "bg-green-100 text-green-800" },
  reject_talent:   { label: "タレント却下", color: "bg-red-100 text-red-800" },
  approve_kyc:     { label: "KYC承認",      color: "bg-blue-100 text-blue-800" },
  reject_kyc:      { label: "KYC却下",      color: "bg-red-100 text-red-800" },
  suspend_talent:  { label: "タレント停止",  color: "bg-orange-100 text-orange-800" },
  restore_talent:  { label: "タレント復旧",  color: "bg-green-100 text-green-800" },
  delete_post:     { label: "投稿削除",      color: "bg-gray-100 text-gray-800" },
  update_settings: { label: "設定変更",      color: "bg-purple-100 text-purple-800" },
}

const PAGE_SIZE = 30

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  async function fetchLogs(reset = false) {
    const supabase = createClient()
    const currentPage = reset ? 0 : page

    let query = supabase
      .from("admin_audit_logs")
      .select("id, action, target_type, target_id, note, created_at, admin:admin_id(display_name)")
      .order("created_at", { ascending: false })
      .range(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE)

    if (actionFilter !== "all") {
      query = query.eq("action", actionFilter)
    }
    if (search.trim()) {
      query = query.ilike("note", `%${search.trim()}%`)
    }

    const { data } = await query

    if (data) {
      if (reset) {
        setLogs(data as unknown as AuditLog[])
        setPage(0)
      } else {
        setLogs((prev) => [...prev, ...(data as unknown as AuditLog[])])
      }
      setHasMore(data.length > PAGE_SIZE)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setIsLoading(true)
    fetchLogs(true)
  }, [actionFilter])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    fetchLogs(true)
  }

  function loadMore() {
    setPage((p) => p + 1)
    fetchLogs(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            監査ログ
          </h1>
          <p className="text-muted-foreground text-sm mt-1">管理者操作の記録</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setIsLoading(true); fetchLogs(true) }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="メモで検索..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">検索</Button>
            </form>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="アクション種別" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのアクション</SelectItem>
                {Object.entries(ACTION_CONFIG).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Log table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">操作記録</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">ログがありません</div>
          ) : (
            <>
              <div className="divide-y">
                {logs.map((log) => {
                  const actionInfo = ACTION_CONFIG[log.action] ?? {
                    label: log.action,
                    color: "bg-gray-100 text-gray-800",
                  }
                  return (
                    <div key={log.id} className="px-4 py-3 flex items-start gap-3">
                      <Badge className={`shrink-0 text-xs mt-0.5 ${actionInfo.color} border-0`}>
                        {actionInfo.label}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {log.admin?.display_name ?? "管理者"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.target_type} / {log.target_id.slice(0, 8)}...
                          </span>
                        </div>
                        {log.note && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{log.note}</p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString("ja-JP", {
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )
                })}
              </div>
              {hasMore && (
                <div className="p-4 text-center border-t">
                  <Button variant="outline" size="sm" onClick={loadMore}>
                    さらに読み込む
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
