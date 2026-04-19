"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Send, Heart, Lock, MoreHorizontal, Trash2, MessageCircle, ChevronDown, ChevronUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Comment {
  id: string
  content: string
  created_at: string
  author: { display_name: string | null } | null
  author_id: string
}

interface Post {
  id: string
  content: string
  is_member_only: boolean
  created_at: string
  author: { display_name: string | null } | null
  author_id: string
  likeCount: number
  commentCount: number
  likedByMe: boolean
}

function PostCard({
  post,
  currentUserId,
  operatorId,
  isMember,
  onDelete,
  onToggleLike,
}: {
  post: Post
  currentUserId: string | null
  operatorId: string | null
  isMember: boolean
  onDelete: (id: string) => void
  onToggleLike: (id: string, liked: boolean) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [loadingComments, setLoadingComments] = useState(false)
  const [posting, setPosting] = useState(false)

  const isOperator = currentUserId === operatorId
  const canDelete = currentUserId === post.author_id || isOperator

  async function loadComments() {
    if (loadingComments) return
    setLoadingComments(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("community_comments")
      .select("id, content, created_at, author_id, author:author_id(display_name)")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true })
    if (data) setComments(data as unknown as Comment[])
    setLoadingComments(false)
  }

  async function toggleComments() {
    if (!showComments && comments.length === 0) {
      await loadComments()
    }
    setShowComments(!showComments)
  }

  async function submitComment() {
    if (!commentText.trim() || !currentUserId) return
    setPosting(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("community_comments")
      .insert({ post_id: post.id, author_id: currentUserId, content: commentText.trim() })
      .select("id, content, created_at, author_id, author:author_id(display_name)")
      .single()
    if (!error && data) {
      setComments([...comments, data as unknown as Comment])
      setCommentText("")
    }
    setPosting(false)
  }

  async function deleteComment(commentId: string) {
    const supabase = createClient()
    await supabase.from("community_comments").delete().eq("id", commentId)
    setComments(comments.filter((c) => c.id !== commentId))
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {(post.author?.display_name ?? "?")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-medium text-sm">
                {post.author?.display_name ?? "匿名"}
              </span>
              {post.author_id === operatorId && (
                <Badge variant="secondary" className="text-xs">タレント</Badge>
              )}
              {post.is_member_only && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Lock className="h-2.5 w-2.5" />
                  限定
                </Badge>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(post.created_at).toLocaleDateString("ja-JP")}
              </span>
              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
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
              )}
            </div>

            {/* Content */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3">
              <button
                onClick={() => onToggleLike(post.id, post.likedByMe)}
                disabled={!currentUserId}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  post.likedByMe
                    ? "text-red-500"
                    : "text-muted-foreground hover:text-red-400"
                } disabled:opacity-40 disabled:cursor-default`}
              >
                <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} />
                <span>{post.likeCount}</span>
              </button>

              <button
                onClick={isMember ? toggleComments : undefined}
                disabled={!isMember}
                className={`flex items-center gap-1.5 text-sm transition-colors ${
                  isMember
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground opacity-40 cursor-default"
                }`}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{post.commentCount + comments.filter(c => !comments.find(cc => cc.id !== c.id)).length > post.commentCount ? comments.length : post.commentCount}</span>
                {isMember && (showComments
                  ? <ChevronUp className="h-3 w-3" />
                  : <ChevronDown className="h-3 w-3" />
                )}
              </button>
            </div>

            {/* Comments section */}
            {showComments && (
              <div className="mt-4 space-y-3 pl-2 border-l-2 border-muted">
                {loadingComments ? (
                  <p className="text-xs text-muted-foreground py-2">読み込み中...</p>
                ) : comments.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">まだコメントがありません</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-xs bg-muted">
                          {(comment.author?.display_name ?? "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {comment.author?.display_name ?? "匿名"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString("ja-JP")}
                          </span>
                          {(comment.author_id === currentUserId || isOperator) && (
                            <button
                              onClick={() => deleteComment(comment.id)}
                              className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm mt-0.5 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}

                {/* Comment form */}
                {currentUserId && (
                  <div className="flex gap-2 pt-1">
                    <Textarea
                      placeholder="コメントを入力..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="resize-none min-h-[60px] text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          submitComment()
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      className="self-end"
                      onClick={submitComment}
                      disabled={!commentText.trim() || posting}
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function SalonTimelinePage() {
  const { talentId } = useParams<{ talentId: string }>()

  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [isMember, setIsMember] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [operatorId, setOperatorId] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [talentId])

  async function fetchData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id ?? null)

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

    let query = supabase
      .from("community_posts")
      .select("id, content, is_member_only, created_at, author_id, author:author_id(display_name)")
      .eq("talent_id", talentId)
      .order("created_at", { ascending: false })
      .limit(30)

    if (!member) {
      query = query.eq("is_member_only", false)
    }

    const { data: postsData } = await query
    if (!postsData) { setIsLoading(false); return }

    const postIds = postsData.map((p) => p.id)

    // いいね数とコメント数を一括取得
    const [reactionsRes, commentsRes, myReactionsRes] = await Promise.all([
      supabase
        .from("community_reactions")
        .select("post_id")
        .in("post_id", postIds)
        .eq("reaction_type", "like"),
      supabase
        .from("community_comments")
        .select("post_id")
        .in("post_id", postIds),
      user
        ? supabase
            .from("community_reactions")
            .select("post_id")
            .in("post_id", postIds)
            .eq("user_id", user.id)
            .eq("reaction_type", "like")
        : Promise.resolve({ data: [] }),
    ])

    const likeMap: Record<string, number> = {}
    const commentMap: Record<string, number> = {}
    const myLikeSet = new Set<string>()

    for (const r of reactionsRes.data ?? []) likeMap[r.post_id] = (likeMap[r.post_id] ?? 0) + 1
    for (const c of commentsRes.data ?? []) commentMap[c.post_id] = (commentMap[c.post_id] ?? 0) + 1
    for (const r of (myReactionsRes as { data: { post_id: string }[] | null }).data ?? []) myLikeSet.add(r.post_id)

    setPosts(
      postsData.map((p) => ({
        ...(p as unknown as Omit<Post, "likeCount" | "commentCount" | "likedByMe">),
        likeCount: likeMap[p.id] ?? 0,
        commentCount: commentMap[p.id] ?? 0,
        likedByMe: myLikeSet.has(p.id),
      }))
    )
    setIsLoading(false)
  }

  async function handlePost() {
    if (!newPost.trim() || !currentUserId) return
    setIsPosting(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        talent_id: talentId,
        author_id: currentUserId,
        content: newPost.trim(),
        is_member_only: true,
      })
      .select("id, content, is_member_only, created_at, author_id, author:author_id(display_name)")
      .single()

    if (!error && data) {
      const newP: Post = {
        ...(data as unknown as Omit<Post, "likeCount" | "commentCount" | "likedByMe">),
        likeCount: 0,
        commentCount: 0,
        likedByMe: false,
      }
      setPosts([newP, ...posts])
      setNewPost("")
    }
    setIsPosting(false)
  }

  async function handleDelete(postId: string) {
    const supabase = createClient()
    await supabase.from("community_posts").delete().eq("id", postId)
    setPosts(posts.filter((p) => p.id !== postId))
  }

  async function handleToggleLike(postId: string, liked: boolean) {
    if (!currentUserId) return
    const supabase = createClient()

    if (liked) {
      await supabase
        .from("community_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUserId)
        .eq("reaction_type", "like")
    } else {
      await supabase
        .from("community_reactions")
        .insert({ post_id: postId, user_id: currentUserId, reaction_type: "like" })
    }

    setPosts(posts.map((p) =>
      p.id === postId
        ? { ...p, likedByMe: !liked, likeCount: p.likeCount + (liked ? -1 : 1) }
        : p
    ))
  }

  const isOperator = currentUserId === operatorId

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">タイムライン</h1>

      {/* 投稿フォーム */}
      {(isOperator || isMember) && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <Textarea
              placeholder="メッセージを投稿..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="resize-none min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handlePost}
                disabled={!newPost.trim() || isPosting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isPosting ? "投稿中..." : "投稿する"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 投稿一覧 */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isMember ? "まだ投稿がありません" : "公開投稿がありません"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              operatorId={operatorId}
              isMember={isMember}
              onDelete={handleDelete}
              onToggleLike={handleToggleLike}
            />
          ))}
        </div>
      )}

      {/* 非メンバー向けCTA */}
      {!isMember && !isLoading && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-8 text-center space-y-3">
            <Lock className="h-8 w-8 mx-auto text-primary" />
            <h3 className="font-semibold">サロンに参加してもっと楽しもう</h3>
            <p className="text-sm text-muted-foreground">
              メンバー限定の投稿・チャット・限定コンテンツが閲覧できます
            </p>
            <Button asChild>
              <Link href={`/talents/${talentId}#plans`}>応援プランを見る</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
