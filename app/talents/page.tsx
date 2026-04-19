"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TalentCard, TalentGrid, type TalentData } from "@/components/talent-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Section } from "@/components/section"
import { createClient } from "@/lib/supabase/client"

interface TalentRow {
  id: string
  name: string
  description: string | null
  category: string
  tags: string[]
  prefecture: string | null
  city: string | null
  cover_image_url: string | null
  fanc_score: number
  supporter_count: number
  published_at: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  hito: "ひと",
  mono: "もの",
  koto: "こと",
}

const categories = ["すべて", "hito", "mono", "koto"]
const categoryLabels = ["すべて", "ひと", "もの", "こと"]

const prefectures = [
  "すべて",
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

export default function TalentsPage() {
  const [allTalents, setAllTalents] = useState<TalentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("すべて")
  const [selectedPrefecture, setSelectedPrefecture] = useState("すべて")
  const [sortBy, setSortBy] = useState("popular")

  useEffect(() => {
    async function fetchTalents() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("talents")
        .select("id, name, description, category, tags, prefecture, city, cover_image_url, fanc_score, supporter_count, published_at")
        .eq("status", "active")
        .order("fanc_score", { ascending: false })

      if (error || !data) {
        console.error("Failed to fetch talents:", error)
        setIsLoading(false)
        return
      }

      const rows = data as unknown as TalentRow[]
      const mapped: TalentData[] = rows.map((t) => ({
        id: t.id,
        name: t.name,
        tagline: t.description ?? "",
        category: CATEGORY_LABELS[t.category] ?? t.category,
        location: t.prefecture ?? "",
        imageUrl: t.cover_image_url ?? "",
        fanCount: t.supporter_count,
        temperature: Math.min(100, Math.round(t.fanc_score / 100)),
        tags: t.tags ?? [],
        isNew:
          t.published_at != null &&
          Date.now() - new Date(t.published_at).getTime() < 30 * 24 * 60 * 60 * 1000,
      }))

      setAllTalents(mapped)
      setIsLoading(false)
    }

    fetchTalents()
  }, [])

  // Filter
  const filtered = allTalents.filter((talent) => {
    const matchesSearch =
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.tagline.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "すべて" || talent.category === CATEGORY_LABELS[selectedCategory]
    const matchesPrefecture =
      selectedPrefecture === "すべて" || talent.location === selectedPrefecture
    return matchesSearch && matchesCategory && matchesPrefecture
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "popular": return b.fanCount - a.fanCount
      case "temperature": return b.temperature - a.temperature
      case "new": return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
      default: return 0
    }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">
            タレントを探す
          </h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            全国各地で活躍するタレントを見つけて、応援しましょう
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              type="search"
              placeholder="タレント名、キーワードで検索..."
              className="pl-12 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border sticky top-16 bg-background z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">カテゴリ:</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat, i) => (
                    <SelectItem key={cat} value={cat}>{categoryLabels[i]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Prefecture Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">地域:</span>
              <Select value={selectedPrefecture} onValueChange={setSelectedPrefecture}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {prefectures.map((pref) => (
                    <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">並び替え:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">人気順</SelectItem>
                  <SelectItem value="temperature">温度順</SelectItem>
                  <SelectItem value="new">新着順</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== "すべて" || selectedPrefecture !== "すべて" || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">絞り込み:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  {searchQuery}
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-foreground">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              )}
              {selectedCategory !== "すべて" && (
                <Badge variant="secondary" className="gap-1">
                  {CATEGORY_LABELS[selectedCategory] ?? selectedCategory}
                  <button onClick={() => setSelectedCategory("すべて")} className="ml-1 hover:text-foreground">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              )}
              {selectedPrefecture !== "すべて" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedPrefecture}
                  <button onClick={() => setSelectedPrefecture("すべて")} className="ml-1 hover:text-foreground">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("すべて")
                  setSelectedPrefecture("すべて")
                }}
                className="text-xs"
              >
                すべてクリア
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <Section className="flex-1">
        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">読み込み中...</div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">{sorted.length}</span> 件のタレントが見つかりました
              </p>
            </div>

            {sorted.length > 0 ? (
              <TalentGrid>
                {sorted.map((talent) => (
                  <TalentCard key={talent.id} talent={talent} />
                ))}
              </TalentGrid>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-2">タレントが見つかりませんでした</h3>
                <p className="text-muted-foreground mb-4">検索条件を変更してお試しください</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("すべて")
                    setSelectedPrefecture("すべて")
                  }}
                >
                  フィルターをリセット
                </Button>
              </div>
            )}
          </>
        )}
      </Section>

      <Footer />
    </div>
  )
}
