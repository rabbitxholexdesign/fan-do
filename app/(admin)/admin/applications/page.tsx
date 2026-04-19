"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, CheckCircle, XCircle, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type ApplicationStatus =
  | "pending_review"
  | "pending_kyc"
  | "pending_final"
  | "active"
  | "rejected"

interface Application {
  id: string
  name: string
  category: string
  prefecture: string | null
  status: ApplicationStatus
  created_at: string
  operator: { display_name: string | null; email: string } | null
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_review: {
    label: "一次審査待ち",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="h-3 w-3" />,
  },
  pending_kyc: {
    label: "KYC審査待ち",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: <Clock className="h-3 w-3" />,
  },
  pending_final: {
    label: "最終承認待ち",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: <Clock className="h-3 w-3" />,
  },
  active: {
    label: "承認済み",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  rejected: {
    label: "却下",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="h-3 w-3" />,
  },
}

const actionButton: Record<ApplicationStatus, { label: string } | null> = {
  pending_review: { label: "審査する" },
  pending_kyc: { label: "KYC確認" },
  pending_final: { label: "承認・公開" },
  active: { label: "詳細" },
  rejected: { label: "詳細" },
}

const tabs: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "pending_review", label: "一次審査待ち" },
  { value: "pending_kyc", label: "KYC待ち" },
  { value: "pending_final", label: "最終承認待ち" },
]

const CATEGORY_LABELS: Record<string, string> = {
  hito: "ひと",
  mono: "もの",
  koto: "こと",
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<ApplicationStatus | "all">("all")
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchApplications() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("talents")
        .select(`
          id, name, category, prefecture, status, created_at,
          operator:operator_id ( display_name, email )
        `)
        .in("status", ["pending_review", "pending_kyc", "pending_final", "active", "rejected"])
        .order("created_at", { ascending: false })

      if (!error && data) {
        setApplications(data as unknown as Application[])
      }
      setIsLoading(false)
    }

    fetchApplications()
  }, [])

  const filtered = applications.filter((app) => {
    const matchesTab = activeTab === "all" || app.status === activeTab
    const matchesSearch =
      search === "" ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.operator?.display_name ?? "").toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesSearch
  })

  const countByStatus = (status: ApplicationStatus) =>
    applications.filter((a) => a.status === status).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">タレント申請管理</h1>
        <p className="text-muted-foreground">申請中・審査待ちのタレントを管理します</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "一次審査待ち", status: "pending_review" as ApplicationStatus, color: "text-yellow-600" },
          { label: "KYC待ち", status: "pending_kyc" as ApplicationStatus, color: "text-blue-600" },
          { label: "最終承認待ち", status: "pending_final" as ApplicationStatus, color: "text-orange-600" },
          { label: "承認済み", status: "active" as ApplicationStatus, color: "text-green-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{countByStatus(stat.status)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="タレント名・申請者名で検索..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">タレント名</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">申請者</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">カテゴリ</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">申請日</th>
                  <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">ステータス</th>
                  <th className="text-right text-sm font-medium text-muted-foreground px-4 py-3">アクション</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">読み込み中...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">該当する申請がありません</td>
                  </tr>
                ) : (
                  filtered.map((app) => {
                    const status = statusConfig[app.status]
                    const action = actionButton[app.status]
                    const isPending = ["pending_review", "pending_kyc", "pending_final"].includes(app.status)
                    return (
                      <tr key={app.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {app.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{app.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm">{app.operator?.display_name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{app.operator?.email ?? ""}</p>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs">
                            {CATEGORY_LABELS[app.category] ?? app.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {new Date(app.created_at).toLocaleDateString("ja-JP")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {action && (
                            <Button
                              size="sm"
                              variant={isPending ? "default" : "outline"}
                              asChild
                            >
                              <Link href={`/admin/applications/${app.id}`}>
                                {action.label}
                              </Link>
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
