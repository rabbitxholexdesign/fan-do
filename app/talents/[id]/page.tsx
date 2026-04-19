"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { SupportPlanCard, type SupportPlanData } from "@/components/support-plan-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const CATEGORY_LABELS: Record<string, string> = {
  hito: "ひと",
  mono: "もの",
  koto: "こと",
}

interface TalentDetail {
  id: string
  name: string
  description: string | null
  category: string
  tags: string[]
  prefecture: string | null
  city: string | null
  cover_image_url: string | null
  avatar_url: string | null
  fanc_score: number
  supporter_count: number
  published_at: string | null
  operator: {
    display_name: string | null
    avatar_url: string | null
    created_at: string
  } | null
}

interface PlanRow {
  id: string
  name: string
  description: string | null
  price: number
  billing_cycle: string
  fanc_bonus: number
  benefits: string[]
}

export default function TalentDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [talent, setTalent] = useState<TalentDetail | null>(null)
  const [plans, setPlans] = useState<SupportPlanData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState("about")
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteId, setFavoriteId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: talentData, error: talentError } = await supabase
        .from("talents")
        .select(`
          id, name, description, category, tags, prefecture, city,
          cover_image_url, avatar_url, fanc_score, supporter_count, published_at,
          operator:operator_id ( display_name, avatar_url, created_at )
        `)
        .eq("id", id)
        .eq("status", "active")
        .single()

      if (talentError || !talentData) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      setTalent(talentData as unknown as TalentDetail)

      // Check login & favorite status
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id ?? null)
      if (user) {
        const { data: fav } = await supabase
          .from("talent_favorites")
          .select("id")
          .eq("fan_id", user.id)
          .eq("talent_id", id)
          .single()
        if (fav) { setIsFavorited(true); setFavoriteId(fav.id) }
      }

      const { data: plansData } = await supabase
        .from("support_plans")
        .select("id, name, description, price, billing_cycle, fanc_bonus, benefits")
        .eq("talent_id", id)
        .eq("is_active", true)
        .order("price", { ascending: true })

      if (plansData) {
        const rows = plansData as unknown as PlanRow[]
        setPlans(
          rows.map((p, i) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            billingCycle: p.billing_cycle as "monthly" | "yearly",
            description: p.description ?? undefined,
            benefits: Array.isArray(p.benefits) ? p.benefits : [],
            isPopular: i === 1,
          }))
        )
      }

      setIsLoading(false)
    }

    fetchData()
  }, [id])

  async function toggleFavorite() {
    if (!currentUserId) return
    const supabase = createClient()
    if (isFavorited && favoriteId) {
      await supabase.from("talent_favorites").delete().eq("id", favoriteId)
      setIsFavorited(false)
      setFavoriteId(null)
    } else {
      const { data } = await supabase
        .from("talent_favorites")
        .insert({ fan_id: currentUserId, talent_id: id })
        .select("id")
        .single()
      if (data) { setIsFavorited(true); setFavoriteId(data.id) }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          読み込み中...
        </div>
        <Footer />
      </div>
    )
  }

  if (notFound || !talent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">タレントが見つかりませんでした</p>
          <Button asChild variant="outline">
            <Link href="/talents">タレント一覧に戻る</Link>
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  const temperature = Math.min(100, Math.round(talent.fanc_score / 100))
  const location = [talent.prefecture, talent.city].filter(Boolean).join(" ")
  const categoryLabel = CATEGORY_LABELS[talent.category] ?? talent.category
  const operatorName = talent.operator?.display_name ?? "運営者"
  const operatorSince = talent.operator?.created_at
    ? new Date(talent.operator.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
    : ""

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Cover Image */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden bg-muted">
        {talent.cover_image_url ? (
          <img
            src={talent.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">🌿</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Image */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-background shadow-lg bg-muted">
              {talent.avatar_url ? (
                <img
                  src={talent.avatar_url}
                  alt={talent.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🌿</div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary">{categoryLabel}</Badge>
                  {location && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {location}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{talent.name}</h1>
                <p className="text-muted-foreground">{talent.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <FanTemperatureMeter temperature={temperature} size="lg" animate />
                {currentUserId && (
                  <button
                    onClick={toggleFavorite}
                    className="p-2 rounded-full border hover:bg-muted transition-colors"
                    title={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}
                  >
                    <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border">
              <div>
                <div className="text-2xl font-bold">{talent.supporter_count.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">サポーター</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{talent.fanc_score.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">fan℃スコア</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                {["about", "community"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:bg-transparent px-4 py-3"
                  >
                    {tab === "about" ? "紹介" : "サロン"}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="about" className="mt-6">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {talent.description ?? "紹介文はまだ登録されていません。"}
                </div>

                {/* Tags */}
                {talent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-8">
                    {talent.tags.map((tag) => (
                      <Badge key={tag} variant="outline">#{tag}</Badge>
                    ))}
                  </div>
                )}

                {/* Operator */}
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle className="text-base">運営者</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={talent.operator?.avatar_url ?? ""} />
                        <AvatarFallback>{operatorName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{operatorName}</div>
                        {operatorSince && (
                          <div className="text-sm text-muted-foreground">
                            {operatorSince}から活動
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Legal Notice Link */}
                <div className="mt-6 text-center">
                  <Link
                    href={`/talents/${id}/legal`}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    特定商取引法に基づく表記
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="community" className="mt-6">
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-lg mb-2">サロンに参加しよう</h3>
                    <p className="text-muted-foreground mb-6">
                      支援プランに登録すると、限定サロンに参加できます
                    </p>
                    <Button asChild>
                      <a href="#plans">支援プランを見る</a>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Support Plans */}
          <div className="lg:col-span-1" id="plans">
            <div className="sticky top-24">
              <h2 className="font-semibold text-lg mb-4">支援プラン</h2>
              {plans.length > 0 ? (
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <SupportPlanCard
                      key={plan.id}
                      plan={plan}
                      onSelect={(planId) => {
                        window.location.href = `/talents/${id}/support?plan=${planId}`
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">支援プランはまだ登録されていません。</p>
              )}

              {/* Share */}
              <Card className="mt-6">
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3">このタレントをシェア</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" className="flex-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </Button>
                    <Button variant="outline" size="icon" className="flex-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
