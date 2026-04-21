"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-widest mb-1">マイページ</p>
        <h1 className="text-2xl font-bold text-slate-800">お気に入り</h1>
        <p className="text-slate-500 mt-1">フォロー中のタレント</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 h-64 animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 py-16 text-center">
          <Heart className="h-12 w-12 mx-auto mb-4 text-slate-200" />
          <p className="font-semibold text-slate-800 mb-1">まだお気に入りがありません</p>
          <p className="text-sm text-slate-500 mb-5">
            タレントページでハートボタンを押してお気に入りに追加しましょう
          </p>
          <Link
            href="/talents"
            className="bg-sky-500 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-sky-600 transition-colors inline-block"
          >
            タレントを探す
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {favorites.map((talent) => {
            const temperature = Math.min(100, Math.round((talent.fanc_score ?? 0) / 100))
            return (
              <div
                key={talent.id}
                className="rounded-2xl bg-white border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative">
                  {talent.cover_image_url ? (
                    <img
                      src={talent.cover_image_url}
                      alt={talent.name}
                      className="w-full aspect-video object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-slate-100 flex items-center justify-center text-4xl">
                      🌿
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFavorite(talent.favoriteId)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/85 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                    title="お気に入りから削除"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-white/85 backdrop-blur-sm text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {CATEGORY_LABELS[talent.category] ?? talent.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-slate-800">{talent.name}</h3>

                  <div className="flex items-center gap-3">
                    <FanTemperatureMeter temperature={temperature} size="sm" showLabel={false} />
                    <span className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{talent.fanc_score}pt</span>
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                      <Users className="h-3 w-3" />
                      {talent.supporter_count}人
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Link
                      href={`/talents/${talent.id}`}
                      className="flex-1 text-center border border-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-full hover:bg-slate-50 transition-colors"
                    >
                      詳細を見る
                    </Link>
                    {talent.isSubscribed ? (
                      <Link
                        href={`/community/${talent.id}`}
                        className="flex-1 text-center bg-sky-500 text-white text-sm font-medium px-3 py-2 rounded-full hover:bg-sky-600 transition-colors"
                      >
                        サロンへ
                      </Link>
                    ) : (
                      <Link
                        href={`/talents/${talent.id}#plans`}
                        className="flex-1 text-center bg-sky-500 text-white text-sm font-medium px-3 py-2 rounded-full hover:bg-sky-600 transition-colors"
                      >
                        応援する
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
