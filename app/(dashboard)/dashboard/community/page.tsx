"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Image as ImageIcon, 
  Send, 
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Trash2,
  Users,
  TrendingUp
} from "lucide-react"

// Mock data
const posts = [
  {
    id: "1",
    content: "新作の輪島塗のお椀が完成しました！サポーター限定で先行予約を受け付けます。詳細は後日お知らせしますね。",
    image: "/placeholder.svg?height=300&width=400",
    postedAt: "2時間前",
    likes: 24,
    comments: 8,
    isPinned: true,
  },
  {
    id: "2",
    content: "今週末のワークショップの準備をしています。参加される方はお楽しみに！",
    postedAt: "1日前",
    likes: 18,
    comments: 5,
    isPinned: false,
  },
  {
    id: "3",
    content: "制作過程の動画を限定公開しました。普段見られない工程をお見せしています。",
    postedAt: "3日前",
    likes: 32,
    comments: 12,
    isPinned: false,
  },
]

const recentComments = [
  {
    id: "1",
    author: "佐藤 花子",
    avatar: "/placeholder.svg?height=32&width=32",
    content: "素敵ですね！予約楽しみにしています。",
    postTitle: "新作の輪島塗のお椀が完成しました",
    postedAt: "30分前",
  },
  {
    id: "2",
    author: "鈴木 一郎",
    avatar: "/placeholder.svg?height=32&width=32",
    content: "ワークショップ参加します！",
    postTitle: "今週末のワークショップの準備をしています",
    postedAt: "2時間前",
  },
  {
    id: "3",
    author: "高橋 美咲",
    avatar: "/placeholder.svg?height=32&width=32",
    content: "動画拝見しました。職人技に感動です。",
    postTitle: "制作過程の動画を限定公開しました",
    postedAt: "5時間前",
  },
]

function PostCard({ post }: { post: typeof posts[0] }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>山</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">山田工房</span>
                {post.isPinned && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Pin className="h-3 w-3" />
                    固定
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">{post.postedAt}</span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pin className="h-4 w-4 mr-2" />
                {post.isPinned ? "固定を解除" : "投稿を固定"}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                削除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm leading-relaxed mb-4">{post.content}</p>

        {post.image && (
          <div className="relative aspect-video rounded-lg overflow-hidden mb-4">
            <Image
              src={post.image}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {post.comments}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CommunityPage() {
  const [newPost, setNewPost] = useState("")

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">コミュニティ</h1>
        <p className="text-muted-foreground">サポーター向けコミュニティの管理</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">メンバー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156人</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今月の投稿</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12件</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">エンゲージメント</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">投稿</TabsTrigger>
          <TabsTrigger value="comments">コメント</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* New Post */}
          <Card>
            <CardHeader>
              <CardTitle>新しい投稿</CardTitle>
              <CardDescription>サポーター限定の投稿を作成します</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="サポーターに向けてメッセージを投稿..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-between items-center">
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <Button disabled={!newPost.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    投稿する
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近のコメント</CardTitle>
              <CardDescription>投稿へのコメント一覧</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-4 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{comment.postedAt}</span>
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <p className="text-xs text-muted-foreground">
                        「{comment.postTitle}」へのコメント
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      返信
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
