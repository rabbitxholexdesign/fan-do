import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { MapPin, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "地域から探す | fan℃",
  description: "都道府県からタレントを探しましょう",
}

const REGIONS: { name: string; prefectures: string[] }[] = [
  { name: "北海道・東北", prefectures: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { name: "関東", prefectures: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { name: "中部", prefectures: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { name: "近畿", prefectures: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { name: "中国・四国", prefectures: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"] },
  { name: "九州・沖縄", prefectures: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
]

export default async function RegionIndexPage() {
  const supabase = await createClient()

  // 都道府県ごとのタレント数を取得
  const { data: talents } = await supabase
    .from("talents")
    .select("prefecture")
    .eq("status", "active")
    .not("prefecture", "is", null)

  const countMap: Record<string, number> = {}
  for (const t of talents ?? []) {
    if (t.prefecture) countMap[t.prefecture] = (countMap[t.prefecture] ?? 0) + 1
  }

  const totalActive = Object.values(countMap).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">地域から探す</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            全国 {totalActive} 人のタレントが登録されています。お住まいの地域や気になる場所のタレントを応援しましょう。
          </p>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-10">
          {REGIONS.map((region) => {
            const regionCount = region.prefectures.reduce((sum, pref) => sum + (countMap[pref] ?? 0), 0)
            return (
              <section key={region.name}>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">{region.name}</h2>
                  <span className="text-sm text-muted-foreground">（{regionCount}人）</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {region.prefectures.map((pref) => {
                    const count = countMap[pref] ?? 0
                    return (
                      <Link
                        key={pref}
                        href={`/region/${encodeURIComponent(pref)}`}
                        className={`group ${count === 0 ? "pointer-events-none" : ""}`}
                      >
                        <Card className={`transition-shadow ${count > 0 ? "hover:shadow-md cursor-pointer" : "opacity-40"}`}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{pref}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {count > 0 ? `${count}人` : "登録なし"}
                              </p>
                            </div>
                            {count > 0 && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}
