"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TalentInfo {
  name: string
}

export default function SupportSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const talentId = params.id as string
  const sessionId = searchParams.get("session_id")

  const [talent, setTalent] = useState<TalentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const supabase = createClient()
      const { data } = await supabase
        .from("talents")
        .select("name")
        .eq("id", talentId)
        .single()
      if (data) setTalent(data as TalentInfo)
      setIsLoading(false)
    }
    fetch()
  }, [talentId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, var(--temp-warm), var(--temp-hot))" }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold mb-2">応援ありがとうございます!</h1>
          <p className="text-muted-foreground mb-8">
            {talent ? `${talent.name}への支援が完了しました` : "支援が完了しました"}
          </p>

          <Card className="mb-8 text-left">
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">次のステップ</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-accent">1</span>
                  </div>
                  <div>
                    <p className="font-medium">サロンに参加</p>
                    <p className="text-sm text-muted-foreground">限定コンテンツやファン同士の交流をお楽しみください</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-accent">2</span>
                  </div>
                  <div>
                    <p className="font-medium">活動報告をチェック</p>
                    <p className="text-sm text-muted-foreground">タレントの最新情報をいち早くお届けします</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-accent">3</span>
                  </div>
                  <div>
                    <p className="font-medium">応援を広めよう</p>
                    <p className="text-sm text-muted-foreground">SNSでシェアして、もっと多くの人に知ってもらいましょう</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href={`/community/${talentId}`}>サロンへ</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/mypage">マイページへ</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
