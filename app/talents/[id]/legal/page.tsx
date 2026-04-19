import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: talent } = await supabase.from("talents").select("name").eq("id", id).single()
  return {
    title: talent ? `特定商取引法に基づく表記 | ${talent.name} | fan℃` : "特定商取引法に基づく表記 | fan℃",
  }
}

export default async function TalentLegalPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [talentRes, legalRes, plansRes] = await Promise.all([
    supabase.from("talents").select("id, name").eq("id", id).eq("status", "active").single(),
    supabase.from("legal_notices").select("seller_name, address, phone, email, cancel_policy, delivery_timing, created_at").eq("talent_id", id).maybeSingle(),
    supabase.from("support_plans").select("name, price, billing_cycle").eq("talent_id", id).eq("is_active", true).order("price", { ascending: true }),
  ])

  if (!talentRes.data) notFound()

  const talent = talentRes.data
  const legal = legalRes.data
  const plans = plansRes.data ?? []

  const cycleLabel = (cycle: string) => {
    if (cycle === "monthly") return "月次課金"
    if (cycle === "yearly") return "年次課金"
    if (cycle === "quarterly") return "四半期課金"
    return cycle
  }

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "販売業者", value: legal?.seller_name ?? "—" },
    { label: "所在地", value: legal?.address ?? "—" },
    { label: "電話番号", value: legal?.phone ?? "—" },
    { label: "メールアドレス", value: legal?.email ?? "—" },
    {
      label: "サービスの価格",
      value: plans.length > 0 ? (
        <ul className="space-y-1">
          {plans.map((p, i) => (
            <li key={i}>
              {p.name}: <strong>¥{p.price.toLocaleString()}</strong>（{cycleLabel(p.billing_cycle)}）
            </li>
          ))}
        </ul>
      ) : "—",
    },
    { label: "支払い方法", value: "クレジットカード（Stripe経由）" },
    { label: "サービス提供時期", value: legal?.delivery_timing ?? "決済完了後、即時にサロンへのアクセスが有効になります。" },
    { label: "返品・キャンセルポリシー", value: legal?.cancel_policy ?? "マイページより次回更新日前日までにいつでも解約できます。既に支払い済みの期間分の返金は原則行いません。" },
    { label: "動作環境", value: "最新版のChrome、Firefox、Safari、Edgeに対応しています。" },
  ]

  const updatedAt = legal?.created_at
    ? new Date(legal.created_at).toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" })
    : null

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/talents/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {talent.name}のページに戻る
            </Link>
          </Button>
        </div>

        <h1 className="text-2xl font-bold mb-2">特定商取引法に基づく表記</h1>
        <p className="text-muted-foreground text-sm mb-8">
          {talent.name} の支援プランに関する特定商取引法上の表記です
        </p>

        <div className="divide-y divide-border border rounded-xl overflow-hidden">
          {rows.map((item, i) => (
            <div key={i} className="grid sm:grid-cols-3 gap-2 p-4 bg-card">
              <dt className="font-medium text-sm text-muted-foreground sm:col-span-1">
                {item.label}
              </dt>
              <dd className="text-sm sm:col-span-2 leading-relaxed">
                {item.value}
              </dd>
            </div>
          ))}
        </div>

        {updatedAt && (
          <p className="text-xs text-muted-foreground mt-6">最終更新日: {updatedAt}</p>
        )}
      </main>
      <Footer />
    </div>
  )
}
