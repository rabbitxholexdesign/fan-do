import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "利用規約 | fan℃",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">利用規約</h1>
        <p className="text-sm text-muted-foreground mb-10">最終更新日：2026年4月19日</p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold mb-3">第1条（適用）</h2>
            <p className="text-muted-foreground leading-relaxed">
              本利用規約（以下「本規約」）は、fan℃運営事務局（以下「当社」）が提供するファンコミュニティサービス「fan℃」（以下「本サービス」）の利用条件を定めるものです。ユーザーの皆さまには、本規約に従って本サービスをご利用いただきます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第2条（利用登録）</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              本サービスにおいては、登録希望者が本規約に同意の上、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              当社は、利用登録の申請者に以下の事由があると判断した場合、利用登録の申請を承認しないことがあります。
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2 ml-4">
              <li>虚偽の事項を届け出た場合</li>
              <li>本規約に違反したことがある者からの申請である場合</li>
              <li>その他、当社が利用登録を相当でないと判断した場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第3条（ユーザーIDおよびパスワードの管理）</h2>
            <p className="text-muted-foreground leading-relaxed">
              ユーザーは、自己の責任において、本サービスのユーザーIDおよびパスワードを適切に管理するものとします。ユーザーは、いかなる場合にも、ユーザーIDおよびパスワードを第三者に譲渡または貸与し、もしくは第三者と共用することはできません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第4条（料金および支払方法）</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">
              ユーザーは、本サービスの有料部分の対価として、当社が別途定め、本サービス上に表示する利用料金を、当社が指定する方法により支払うものとします。
            </p>
            <p className="text-muted-foreground leading-relaxed">
              支援プランの解約は、ユーザーがマイページより行えます。解約は次回更新日の前日まで有効であり、解約後の返金は行いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第5条（禁止事項）</h2>
            <p className="text-muted-foreground leading-relaxed mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当社、本サービスの他のユーザー、またはその他の第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
              <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
              <li>当社のネットワークまたはシステム等への不正アクセス</li>
              <li>反社会的勢力等への利益供与</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第6条（本サービスの提供の停止等）</h2>
            <p className="text-muted-foreground leading-relaxed">
              当社は、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。システムの保守点検または更新を行う場合、地震・落雷・火災・停電または天災などの不可抗力により本サービスの提供が困難となった場合、コンピュータまたは通信回線等が事故により停止した場合、その他当社が本サービスの提供が困難と判断した場合。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第7条（著作権）</h2>
            <p className="text-muted-foreground leading-relaxed">
              ユーザーは、自ら著作権等の必要な知的財産権を有するか、または必要な権利者の許諾を得た文章、画像や映像等の情報のみ、本サービスを利用して投稿・掲載することができるものとします。ユーザーが本サービスを利用して投稿・掲載したコンテンツの著作権はユーザーに帰属します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第8条（免責事項）</h2>
            <p className="text-muted-foreground leading-relaxed">
              当社は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないことを明示的にも黙示的にも保証しておりません。当社は、本サービスに起因してユーザーに生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第9条（サービス内容の変更等）</h2>
            <p className="text-muted-foreground leading-relaxed">
              当社は、ユーザーへの事前の告知をもって、本サービスの内容を変更、追加または廃止することがあり、ユーザーはこれを承諾するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第10条（利用規約の変更）</h2>
            <p className="text-muted-foreground leading-relaxed">
              当社は以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。本規約の変更がユーザーの一般の利益に適合するとき、および本規約の変更がサービス利用契約の目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">第11条（準拠法・裁判管轄）</h2>
            <p className="text-muted-foreground leading-relaxed">
              本規約の解釈にあたっては、日本法を準拠法とします。本サービスに関して紛争が生じた場合には、当社の本店所在地を管轄する裁判所を専属的合意管轄とします。
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}
