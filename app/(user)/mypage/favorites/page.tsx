"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"

interface FavoriteTalent {
  id: string
  favoriteId: string
  name: string
  category: string
  cover_image_url: string | null
  fanc_score: number
  supporter_count: number
  isSubscribed: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  hito: "ひと", mono: "もの", koto: "こと",
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteTalent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data: favs } = await supabase
        .from("talent_favorites")
        .select(`
          id,
          talent:talent_id (
            id, name, category, cover_image_url, fanc_score, supporter_count
          )
        `)
        .eq("fan_id", user.id)
        .order("created_at", { ascending: false })

      if (!favs || favs.length === 0) {
        setIsLoading(false)
        return
      }

      // Check which ones the user is subscribed to
      const talentIds = (favs as unknown as Array<{ talent: { id: string } }>).map((f) => f.talent.id)
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("talent_id")
        .eq("fan_id", user.id)
        .eq("status", "active")
        .in("talent_id", talentIds)

      const subscribedIds = new Set((subs ?? []).map((s) => s.talent_id))

      setFavorites(
        (favs as unknown as Array<{ id: string; talent: { id: string; name: string; category: string; cover_image_url: string | null; fanc_score: number; supporter_count: number } }>).map((f) => ({
          id: f.talent.id,
          favoriteId: f.id,
          name: f.talent.name,
          category: f.talent.category,
          cover_image_url: f.talent.cover_image_url,
          fanc_score: f.talent.fanc_score,
          supporter_count: f.talent.supporter_count,
          isSubscribed: subscribedIds.has(f.talent.id),
        }))
      )
      setIsLoading(false)
    }
    fetchData()
  }, [])

  async function handleRemoveFavorite(favoriteId: string) {
    const supabase = createClient()
    await supabase.from("talent_favorites").delete().eq("id", favoriteId)
    setFavorites((prev) => prev.filter((f) => f.favoriteId !== favoriteId))
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">お気に入り</h1>
        <p className="text-muted-foreground">フォロー中のタレント</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
      ) : favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="font-medium">まだお気に入りがありません</p>
              <p className="text-sm text-muted-foreground mt-1">
                タレントページでハートボタンを押してお気に入りに追加しましょう
              </p>
            </div>
            <Button asChild>
              <Link href="/talents">タレントを探す</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((talent) => {
            const temperature = Math.min(100, Math.round((talent.fanc_score ?? 0) / 100))
            return (
              <Card key={talent.id} className="overflow-hidden">
                <div className="relative">
                  {talent.cover_image_url ? (
                    <img
                      src={talent.cover_image_url}
                      alt={talent.name}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-muted flex items-center justify-center text-4xl">
                      🌿
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFavorite(talent.favoriteId)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
                    title="お気に入りから削除"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <Badge variant="outline" className="text-xs mb-1">
                      {CATEGORY_LABELS[talent.category] ?? talent.category}
                    </Badge>
                    <h3 className="font-semibold">{talent.name}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <FanTemperatureMeter temperature={temperature} size="sm" showLabel={false} />
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{talent.fanc_score}pt</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                      <Users className="h-3 w-3" />
                      {talent.supporter_count}人
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <Link href={`/talents/${talent.id}`}>詳細を見る</Link>
                    </Button>
                    {talent.isSubscribed ? (
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/community/${talent.id}`}>サロンへ</Link>
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1" asChild>
                        <Link href={`/talents/${talent.id}#plans`}>応援する</Link>
                      </Button>
                    )}
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
