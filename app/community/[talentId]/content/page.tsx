"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Lock, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Post {
  id: string
  content: string
  created_at: string
  author_id: string
  author: { display_name: string | null } | null
}

export default function SalonContentPage() {
  const { talentId } = useParams<{ talentId: string }>()

  const [posts, setPosts] = useState<Post[]>([])
  const [isMember, setIsMember] = useState(false)
  const [operatorId, setOperatorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: talent } = await supabase
        .from("talents")
        .select("operator_id")
        .eq("id", talentId)
        .single()
      setOperatorId(talent?.operator_id ?? null)

      let member = false
      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("fan_id", user.id)
          .eq("talent_id", talentId)
          .eq("status", "active")
          .limit(1)
          .single()
        member = !!sub || talent?.operator_id === user.id
      }
      setIsMember(member)

      if (member) {
        const { data } = await supabase
          .from("community_posts")
          .select("id, content, created_at, author_id, author:author_id(display_name)")
          .eq("talent_id", talentId)
          .eq("is_member_only", true)
          .order("created_at", { ascending: false })
          .limit(50)

        if (data) setPosts(data as unknown as Post[])
      }

      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
  }

  if (!isMember) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold">限定コンテンツ</h1>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-12 text-center space-y-3">
            <Lock className="h-10 w-10 mx-auto text-primary" />
            <h3 className="font-semibold text-lg">メンバー限定コンテンツ</h3>
            <p className="text-sm text-muted-foreground">
              サロンに参加すると、限定投稿や特別なコンテンツが閲覧できます
            </p>
            <Button asChild>
              <Link href={`/talents/${talentId}#plans`}>応援プランを見る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">限定コンテンツ</h1>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">限定コンテンツはまだありません</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const name = post.author?.display_name ?? "匿名"
            const isFromOperator = post.author_id === operatorId
            return (
              <Card key={post.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{name}</span>
                        {isFromOperator && (
                          <Badge variant="secondary" className="text-xs">タレント</Badge>
                        )}
                        <Badge variant="outline" className="text-xs gap-1 ml-auto shrink-0">
                          <Lock className="h-2.5 w-2.5" />
                          限定
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
