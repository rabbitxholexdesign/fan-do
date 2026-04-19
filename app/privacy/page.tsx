import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "プライバシーポリシー | fan℃",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-muted-foreground mb-10">最終更新日：2026年4月19日</p>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">1. 個人情報の収集について</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              当社は、本サービスの提供にあたり、以下の個人情報を収集することがあります。
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>氏名・ニックネーム</li>
              <li>メールアドレス</li>
              <li>決済情報（クレジットカード情報はStripeが管理し、当社は保持しません）</li>
              <li>サービス利用履歴・行動ログ</li>
              <li>本人確認書類（タレント登録時）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. 個人情報の利用目的</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              収集した個人情報は、以下の目的で利用します。
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>本サービスの提供・運営</li>
              <li>ユーザーからのお問い合わせへの対応</li>
              <li>メンテナンス・重要なお知らせ等の通知</li>
              <li>不正利用の防止</li>
              <li>サービス改善・新機能開発のための統計・分析</li>
              <li>利用規約に違反したユーザーへの対応</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. 個人情報の第三者提供</h2>
            <p className="text-muted-foreground leading-relaxed">
              当社は、以下の場合を除いて、ユーザーの個人情報を第三者に提供することはありません。法令に基づく場合、人の生命・身体・財産の保護のために必要がある場合、公衆衛生の向上または児童の健全な育成の推進のために必要がある場合、国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. 個人情報の開示</h2>
            <p className="text-muted-foreground leading-relaxed">
              当社は、ユーザーから個人情報の開示を求められたときは、本人確認の上、遅滞なくこれを開示します。ただし、開示することにより以下のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4 mt-2">
              <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
              <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
              <li>法令に違反することとなる場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. 個人情報の訂正および削除</h2>
            <p className="text-muted-foreground leading-relaxed">
              ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、個人情報の訂正または削除を請求することができます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookieおよびアクセス解析</h2>
            <p className="text-muted-foreground leading-relaxed">
              本サービスでは、サービスの改善やユーザー体験の向上のためにCookieを使用しています。Cookieは、ブラウザの設定によって無効化することができますが、一部機能が利用できなくなる場合があります。また、当社は統計情報の収集・分析のためにGoogle Analyticsなどの解析ツールを使用することがあります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. プライバシーポリシーの変更</h2>
            <p className="text-muted-foreground leading-relaxed">
              当社は、法令の改正やサービス内容の変更に伴い、本プライバシーポリシーを変更することがあります。重要な変更を行う場合は、本サービス上での告知またはメールにてお知らせします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. お問い合わせ</h2>
            <p className="text-muted-foreground leading-relaxed">
              個人情報の取り扱いに関するお問い合わせは、下記の窓口までご連絡ください。
            </p>
            <div className="mt-3 p-4 rounded-lg bg-muted text-sm text-muted-foreground space-y-1">
              <p>fan℃ 運営事務局</p>
              <p>メール: privacy@fanc.jp</p>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
