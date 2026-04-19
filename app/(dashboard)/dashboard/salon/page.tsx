"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, Heart, MessageCircle, MoreHorizontal, Pin, Trash2, Users, TrendingUp, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Post {
  id: string
  content: string
  is_member_only: boolean
  created_at: string
  author: { display_name: string | null } | null
}

interface Comment {
  id: string
  content: string
  created_at: string
  author: { display_name: string | null } | null
  post: { content: string } | null
}

function PostCard({ post, talentName, onDelete }: {
  post: Post
  talentName: string
  onDelete: (id: string) => void
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {(post.author?.display_name ?? talentName)[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{post.author?.display_name ?? talentName}</span>
                {post.is_member_only && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Lock className="h-3 w-3" />
                    サポーター限定
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => onDelete(post.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-sm leading-relaxed">{post.content}</p>
      </CardContent>
    </Card>
  )
}

export default function SalonPage() {
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talentId")

  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [isMemberOnly, setIsMemberOnly] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [talentName, setTalentName] = useState("")
  const [memberCount, setMemberCount] = useState(0)
  const [postCount, setPostCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTalentId, setActiveTalentId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      // タレント特定
      let tid = talentId
      if (!tid) {
        const { data: talentData } = await supabase
          .from("talents")
          .select("id, name")
          .eq("operator_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
        if (talentData) {
          tid = talentData.id
          setTalentName(talentData.name)
        }
      } else {
        const { data: t } = await supabase
          .from("talents")
          .select("name")
          .eq("id", tid)
          .single()
        if (t) setTalentName(t.name)
      }

      if (!tid) { setIsLoading(false); return }
      setActiveTalentId(tid)

      const [{ data: postsData }, { count: members }, { count: posts }] = await Promise.all([
        supabase
          .from("community_posts")
          .select("id, content, is_member_only, created_at, author:author_id(display_name)")
          .eq("talent_id", tid)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("talent_id", tid)
          .eq("status", "active"),
        supabase
          .from("community_posts")
          .select("id", { count: "exact", head: true })
          .eq("talent_id", tid),
      ])

      if (postsData) setPosts(postsData as unknown as Post[])
      setMemberCount(members ?? 0)
      setPostCount(posts ?? 0)
      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  async function handlePost() {
    if (!newPost.trim() || !activeTalentId) return
    setIsPosting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setIsPosting(false); return }

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        talent_id: activeTalentId,
        author_id: user.id,
        content: newPost.trim(),
        is_member_only: isMemberOnly,
      })
      .select("id, content, is_member_only, created_at, author:author_id(display_name)")
      .single()

    if (!error && data) {
      setPosts([data as unknown as Post, ...posts])
      setNewPost("")
      setPostCount((c) => c + 1)
    }
    setIsPosting(false)
  }

  async function handleDelete(postId: string) {
    const supabase = createClient()
    await supabase.from("community_posts").delete().eq("id", postId)
    setPosts(posts.filter((p) => p.id !== postId))
    setPostCount((c) => Math.max(0, c - 1))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">サロン</h1>
        <p className="text-muted-foreground">サポーター向けサロンの管理</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">メンバー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}人</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">投稿数</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postCount}件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">公開サロン</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button size="sm" variant="outline" asChild>
              <Link href={activeTalentId ? `/community/${activeTalentId}` : "#"}>
                サロンを見る
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">投稿</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* New Post */}
          <Card>
            <CardHeader>
              <CardTitle>新しい投稿</CardTitle>
              <CardDescription>サロンへの投稿を作成します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="サポーターへメッセージを投稿..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isMemberOnly}
                      onChange={(e) => setIsMemberOnly(e.target.checked)}
                      className="rounded"
                    />
                    <Lock className="h-3 w-3" />
                    サポーター限定
                  </label>
                  <Button
                    onClick={handlePost}
                    disabled={!newPost.trim() || isPosting}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isPosting ? "投稿中..." : "投稿する"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">読み込み中...</div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                まだ投稿がありません
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  talentName={talentName}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
