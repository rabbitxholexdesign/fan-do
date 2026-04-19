"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Search, Users, TrendingUp, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Supporter {
  id: string
  created_at: string
  fan: { display_name: string | null; email: string } | null
  plan: { name: string; price: number } | null
}

export default function SupportersPage() {
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talentId")

  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [plans, setPlans] = useState<string[]>([])

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

      const { data } = await supabase
        .from("subscriptions")
        .select(`
          id, created_at,
          fan:fan_id(display_name, email),
          plan:plan_id(name, price)
        `)
        .eq("talent_id", tid)
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (data) {
        setSupporters(data as unknown as Supporter[])
        const uniquePlans = [...new Set((data as unknown as Supporter[]).map((s) => s.plan?.name ?? "").filter(Boolean))]
        setPlans(uniquePlans)
      }
      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  const filtered = supporters.filter((s) => {
    const name = s.fan?.display_name ?? ""
    const email = s.fan?.email ?? ""
    const matchesSearch = searchQuery === "" ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlan = planFilter === "all" || s.plan?.name === planFilter
    return matchesSearch && matchesPlan
  })

  const totalMonthly = supporters.reduce((sum, s) => sum + (s.plan?.price ?? 0), 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">サポーター</h1>
          <p className="text-muted-foreground">サポーターの一覧と管理</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">総サポーター数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supporters.length}人</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">月間収益（概算）</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalMonthly.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">プラン数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}種類</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="名前やメールで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="プランで絞り込み" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのプラン</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>サポーター一覧</CardTitle>
          <CardDescription>{filtered.length}人のサポーター</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">サポーターが見つかりません</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>サポーター</TableHead>
                    <TableHead>プラン</TableHead>
                    <TableHead className="text-right">月額</TableHead>
                    <TableHead>参加日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {(s.fan?.display_name ?? "?")[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{s.fan?.display_name ?? "匿名"}</p>
                            <p className="text-xs text-muted-foreground">{s.fan?.email ?? ""}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{s.plan?.name ?? "—"}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{(s.plan?.price ?? 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(s.created_at).toLocaleDateString("ja-JP")}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
