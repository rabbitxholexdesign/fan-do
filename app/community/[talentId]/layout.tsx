import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { MessageCircle, Users, FileText, Home } from "lucide-react"

interface Props {
  children: React.ReactNode
  params: Promise<{ talentId: string }>
}

export default async function CommunityLayout({ children, params }: Props) {
  const { talentId } = await params
  const supabase = await createClient()

  const { data: talent } = await supabase
    .from("talents")
    .select("id, name, category, fanc_score, supporter_count, cover_image_url")
    .eq("id", talentId)
    .eq("status", "active")
    .single()

  if (!talent) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // サブスク確認
  let isMember = false
  if (user) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("fan_id", user.id)
      .eq("talent_id", talentId)
      .eq("status", "active")
      .limit(1)
      .single()
    isMember = !!sub
  }

  const temperature = Math.min(100, Math.round((talent.fanc_score ?? 0) / 100))

  const CATEGORY_LABELS: Record<string, string> = { hito: "ひと", mono: "もの", koto: "こと" }

  const navItems = [
    { href: `/community/${talentId}`, label: "タイムライン", icon: Home },
    { href: `/community/${talentId}/chat`, label: "チャット", icon: MessageCircle },
    { href: `/community/${talentId}/content`, label: "限定コンテンツ", icon: FileText },
    { href: `/community/${talentId}/fans`, label: "ファン", icon: Users },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Talent Info */}
              <div className="p-4 rounded-xl border bg-card space-y-3">
                {talent.cover_image_url ? (
                  <img
                    src={talent.cover_image_url}
                    alt={talent.name}
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-video rounded-lg bg-muted flex items-center justify-center text-4xl">🌿</div>
                )}
                <div>
                  <Badge variant="outline" className="text-xs mb-1">
                    {CATEGORY_LABELS[talent.category] ?? talent.category}
                  </Badge>
                  <h2 className="font-bold text-lg leading-tight">{talent.name}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <FanTemperatureMeter temperature={temperature} size="sm" showLabel={false} />
                  <div>
                    <p className="text-xs text-muted-foreground">fan℃スコア</p>
                    <p className="font-semibold">{talent.fanc_score ?? 0}pt</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  サポーター {talent.supporter_count}人
                </p>
                {!isMember && (
                  <Button className="w-full" size="sm" asChild>
                    <Link href={`/talents/${talentId}`}>応援する</Link>
                  </Button>
                )}
                {isMember && (
                  <Badge className="w-full justify-center py-1">メンバー</Badge>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {!isMember && item.href !== `/community/${talentId}` && (
                      <span className="ml-auto text-xs">🔒</span>
                    )}
                  </Link>
                ))}
              </nav>

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/talents/${talentId}`}>タレントページへ</Link>
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  )
}
