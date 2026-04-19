import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TalentCard, TalentGrid, type TalentData } from "@/components/talent-card"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  params: Promise<{ prefecture: string }>
}

export async function generateMetadata({ params }: Props) {
  const { prefecture } = await params
  const name = decodeURIComponent(prefecture)
  return {
    title: `${name}のタレント | fan℃`,
    description: `${name}で活躍するタレント一覧`,
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  hito: "ひと",
  mono: "もの",
  koto: "こと",
}

export default async function PrefecturePage({ params }: Props) {
  const { prefecture } = await params
  const prefectureName = decodeURIComponent(prefecture)

  const supabase = await createClient()

  const { data } = await supabase
    .from("talents")
    .select("id, name, description, category, tags, prefecture, city, cover_image_url, fanc_score, supporter_count, published_at")
    .eq("status", "active")
    .eq("prefecture", prefectureName)
    .order("fanc_score", { ascending: false })

  // 都道府県名が有効かチェック（タレントゼロでも存在するページとして扱う）
  const VALID_PREFECTURES = [
    "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
    "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
    "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
    "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
    "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
    "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
    "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
  ]

  if (!VALID_PREFECTURES.includes(prefectureName)) notFound()

  const talents: TalentData[] = (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    tagline: t.description ?? "",
    category: CATEGORY_LABELS[t.category] ?? t.category,
    location: [t.prefecture, t.city].filter(Boolean).join(" "),
    imageUrl: t.cover_image_url ?? "",
    fanCount: t.supporter_count,
    temperature: Math.min(100, Math.round(t.fanc_score / 100)),
    tags: t.tags ?? [],
    isNew:
      t.published_at != null &&
      Date.now() - new Date(t.published_at).getTime() < 30 * 24 * 60 * 60 * 1000,
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="bg-muted/30 py-10">
        <div className="container mx-auto px-4">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/region">
              <ArrowLeft className="h-4 w-4 mr-1" />
              地域一覧に戻る
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">{prefectureName}</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            {talents.length > 0
              ? `${talents.length}人のタレントが活動しています`
              : "まだタレントが登録されていません"}
          </p>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-10">
        {talents.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-muted-foreground">
              {prefectureName}にはまだタレントが登録されていません
            </p>
            <Button asChild variant="outline">
              <Link href="/talents">すべてのタレントを見る</Link>
            </Button>
          </div>
        ) : (
          <TalentGrid>
            {talents.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </TalentGrid>
        )}
      </main>

      <Footer />
    </div>
  )
}
