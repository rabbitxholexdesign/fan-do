import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "特定商取引法に基づく表記 | fan℃",
}

const items: { label: string; value: string }[] = [
  { label: "販売業者", value: "fan℃ 運営事務局" },
  { label: "代表責任者", value: "（お問い合わせよりご確認ください）" },
  { label: "所在地", value: "（お問い合わせよりご確認ください）" },
  { label: "電話番号", value: "（お問い合わせフォームよりご連絡ください）" },
  { label: "メールアドレス", value: "support@fanc.jp" },
  {
    label: "サービスの対価",
    value:
      "各支援プランに記載された金額（消費税込）。支払い方法はクレジットカード（Stripe経由）。",
  },
  {
    label: "支払い時期",
    value:
      "申し込み時に初回決済。以降は選択した課金サイクル（月次・年次）に従い自動更新。",
  },
  {
    label: "役務の提供時期",
    value: "決済完了後、即時にサロンへのアクセスが有効になります。",
  },
  {
    label: "返品・キャンセルについて",
    value:
      "サブスクリプションはマイページより次回更新日前日までにいつでも解約できます。既に支払い済みの期間分の返金は原則行いません。ただし、当社の都合によりサービスを停止した場合は、その月の日割り分を返金します。",
  },
  {
    label: "動作環境",
    value:
      "最新版のChrome、Firefox、Safari、Edgeに対応しています。Internet Explorerはサポート対象外です。",
  },
]

export default function CommercePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">特定商取引法に基づく表記</h1>
        <p className="text-sm text-muted-foreground mb-10">最終更新日：2026年4月19日</p>

        <div className="border rounded-xl overflow-hidden divide-y">
          {items.map(({ label, value }) => (
            <div key={label} className="flex flex-col sm:flex-row">
              <div className="sm:w-48 shrink-0 p-4 bg-muted/50 font-medium text-sm">
                {label}
              </div>
              <div className="p-4 text-sm text-muted-foreground leading-relaxed flex-1">
                {value}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
