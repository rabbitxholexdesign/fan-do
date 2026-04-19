"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MessageCircle, 
  Image as ImageIcon, 
  Heart, 
  Send,
  Lock,
  Users,
  Bell
} from "lucide-react"

// Mock data
const communities = [
  {
    id: "1",
    talentName: "山田工房",
    talentImage: "/placeholder.svg?height=48&width=48",
    memberCount: 156,
    unreadCount: 3,
    lastActivity: "2時間前",
    posts: [
      {
        id: "p1",
        author: "山田工房",
        authorImage: "/placeholder.svg?height=40&width=40",
        isOwner: true,
        content: "新作の輪島塗のお椀が完成しました！サポーター限定で先行予約を受け付けます。詳細は後日お知らせしますね。",
        image: "/placeholder.svg?height=300&width=400",
        postedAt: "2時間前",
        likes: 24,
        comments: 8,
      },
      {
        id: "p2",
        author: "山田工房",
        authorImage: "/placeholder.svg?height=40&width=40",
        isOwner: true,
        content: "今週末のワークショップの準備をしています。参加される方はお楽しみに！",
        postedAt: "1日前",
        likes: 18,
        comments: 5,
      },
    ],
  },
  {
    id: "2",
    talentName: "cafe irodori",
    talentImage: "/placeholder.svg?height=48&width=48",
    memberCount: 89,
    unreadCount: 0,
    lastActivity: "1日前",
    posts: [
      {
        id: "p3",
        author: "cafe irodori",
        authorImage: "/placeholder.svg?height=40&width=40",
        isOwner: true,
        content: "新メニュー「季節の和パフェ」の試作中です。サポーターの皆さんに試食会を開催しようと思っています。",
        image: "/placeholder.svg?height=300&width=400",
        postedAt: "1日前",
        likes: 32,
        comments: 12,
      },
    ],
  },
]

function PostCard({ post }: { post: typeof communities[0]["posts"][0] }) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={post.authorImage} />
            <AvatarFallback>{post.author[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.author}</span>
              {post.isOwner && (
                <Badge className="text-xs bg-temperature-medium text-white">
                  運営
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{post.postedAt}</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm leading-relaxed mb-4">{post.content}</p>

        {/* Image */}
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

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm transition-colors ${
              liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </button>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <MessageCircle className="h-4 w-4" />
            {post.comments}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function CommunityFeed({ community }: { community: typeof communities[0] }) {
  const [newPost, setNewPost] = useState("")

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={community.talentImage} />
                <AvatarFallback>{community.talentName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{community.talentName}</h2>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {community.memberCount}人のメンバー
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    サポーター限定
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* New Post (optional for supporters) */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>田</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="コメントを投稿..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[80px] resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <Button variant="ghost" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button size="sm" disabled={!newPost.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  投稿
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {community.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  )
}

export default function CommunitiesPage() {
  const [selectedCommunity, setSelectedCommunity] = useState(communities[0])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">コミュニティ</h1>
        <p className="text-muted-foreground">
          応援中のタレントとの限定コミュニケーション
        </p>
      </div>

      {/* Desktop: Side-by-side layout */}
      <div className="hidden lg:grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Community List */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            参加中のコミュニティ
          </h3>
          {communities.map((community) => (
            <button
              key={community.id}
              onClick={() => setSelectedCommunity(community)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                selectedCommunity.id === community.id
                  ? "bg-primary/10"
                  : "hover:bg-muted"
              }`}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={community.talentImage} />
                  <AvatarFallback>{community.talentName[0]}</AvatarFallback>
                </Avatar>
                {community.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                    {community.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{community.talentName}</p>
                <p className="text-xs text-muted-foreground">
                  {community.lastActivity}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Feed */}
        <CommunityFeed community={selectedCommunity} />
      </div>

      {/* Mobile: Tabs layout */}
      <div className="lg:hidden">
        <Tabs defaultValue={communities[0].id}>
          <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${communities.length}, 1fr)` }}>
            {communities.map((community) => (
              <TabsTrigger key={community.id} value={community.id} className="relative">
                {community.talentName}
                {community.unreadCount > 0 && (
                  <span className="ml-1 h-4 w-4 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                    {community.unreadCount}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {communities.map((community) => (
            <TabsContent key={community.id} value={community.id} className="mt-6">
              <CommunityFeed community={community} />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {communities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              参加中のコミュニティがありません
            </h3>
            <p className="text-muted-foreground mb-4">
              タレントを応援するとコミュニティに参加できます
            </p>
            <Button asChild>
              <Link href="/talents">タレントを探す</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
