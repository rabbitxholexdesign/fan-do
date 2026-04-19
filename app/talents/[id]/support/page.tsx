"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SupportPlanRow, type SupportPlanData } from "@/components/support-plan-card"
import { FanTemperatureBadge } from "@/components/fan-temperature-meter"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface TalentInfo {
  id: string
  name: string
  cover_image_url: string | null
  fanc_score: number
}

interface PlanRow {
  id: string
  name: string
  description: string | null
  price: number
  billing_cycle: string
  fanc_bonus: number
  benefits: string[]
  max_supporters: number | null
  current_supporters: number | null
}

type Step = "plan" | "confirm" | "complete"

export default function SupportFlowPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const talentId = params.id as string
  const initialPlan = searchParams.get("plan") ?? ""

  const [talent, setTalent] = useState<TalentInfo | null>(null)
  const [plans, setPlans] = useState<SupportPlanData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [step, setStep] = useState<Step>("plan")
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan)
  const [isProcessing, setIsProcessing] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      const [{ data: talentData }, { data: plansData }] = await Promise.all([
        supabase
          .from("talents")
          .select("id, name, cover_image_url, fanc_score")
          .eq("id", talentId)
          .eq("status", "active")
          .single(),
        supabase
          .from("support_plans")
          .select("id, name, description, price, billing_cycle, fanc_bonus, benefits, max_supporters, current_supporters")
          .eq("talent_id", talentId)
          .eq("is_active", true)
          .order("price", { ascending: true }),
      ])

      if (talentData) setTalent(talentData as TalentInfo)

      if (plansData) {
        const rows = plansData as unknown as PlanRow[]
        setPlans(
          rows.map((p, i) => {
            const maxS = p.max_supporters ?? null
            const curS = p.current_supporters ?? 0
            return {
              id: p.id,
              name: p.name,
              price: p.price,
              billingCycle: p.billing_cycle as "monthly" | "yearly" | "quarterly" | "onetime",
              description: p.description ?? "",
              benefits: Array.isArray(p.benefits) ? p.benefits : [],
              supporterCount: curS,
              isPopular: rows.length >= 3 && i === 1,
              isLimited: maxS !== null,
              limitCount: maxS ?? undefined,
              remainingCount: maxS !== null ? Math.max(0, maxS - curS) : undefined,
            }
          })
        )
      }

      setIsLoading(false)
    }
    fetchData()
  }, [talentId])

  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("ja-JP").format(price)

  const getBillingLabel = (cycle: string) => {
    if (cycle === "yearly") return "/ 年"
    if (cycle === "quarterly") return "/ 3ヶ月"
    if (cycle === "onetime") return "（買い切り）"
    return "/ 月"
  }

  async function handleConfirmPurchase() {
    if (!selectedPlan) return
    setIsProcessing(true)
    setCheckoutError(null)

    // If not logged in, redirect to login
    if (!isLoggedIn) {
      router.push(`/login?next=/talents/${talentId}/support?plan=${selectedPlanId}`)
      return
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlanId, talentId }),
      })
      const json = await res.json()

      if (!res.ok) {
        setCheckoutError(json.error ?? "エラーが発生しました")
        setIsProcessing(false)
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = json.url
    } catch {
      setCheckoutError("通信エラーが発生しました。もう一度お試しください。")
      setIsProcessing(false)
    }
  }

  const steps = [
    { id: "plan", label: "プラン選択" },
    { id: "confirm", label: "確認・決済" },
  ]
  const currentStepIndex = steps.findIndex((s) => s.id === step)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!talent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">タレントが見つかりません</p>
      </div>
    )
  }

  const temperature = Math.min(100, Math.round((talent.fanc_score ?? 0) / 100))

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/talents/${talentId}`}>キャンセル</Link>
          </Button>
        </div>
      </header>

      {/* Progress Steps */}
      {step !== "complete" && (
        <div className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-4 max-w-lg mx-auto">
              {steps.map((s, index) => (
                <div key={s.id} className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        index < currentStepIndex
                          ? "bg-accent text-accent-foreground"
                          : index === currentStepIndex
                          ? "bg-foreground text-background"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {index < currentStepIndex ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-sm hidden sm:inline ${
                        index === currentStepIndex ? "font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 ${index < currentStepIndex ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Plan Selection */}
          {step === "plan" && (
            <div>
              {/* Talent Info */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {talent.cover_image_url ? (
                      <img
                        src={talent.cover_image_url}
                        alt={talent.name}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                        🌿
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="font-semibold">{talent.name}</h2>
                      <p className="text-sm text-muted-foreground">を応援します</p>
                    </div>
                    <FanTemperatureBadge temperature={temperature} />
                  </div>
                </CardContent>
              </Card>

              <h1 className="text-2xl font-bold mb-6">支援プランを選択</h1>

              {plans.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    現在募集中の支援プランがありません
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {plans.map((plan) => (
                    <SupportPlanRow
                      key={plan.id}
                      plan={plan}
                      selected={selectedPlanId === plan.id}
                      onSelect={setSelectedPlanId}
                    />
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <Button
                  size="lg"
                  disabled={!selectedPlanId || plans.length === 0}
                  onClick={() => setStep("confirm")}
                >
                  確認へ進む
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm & Checkout */}
          {step === "confirm" && selectedPlan && (
            <div>
              <button
                onClick={() => setStep("plan")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                プラン選択に戻る
              </button>

              <h1 className="text-2xl font-bold mb-6">内容確認</h1>

              <Card className="mb-6">
                <CardContent className="p-6">
                  {/* Talent */}
                  <div className="flex items-center gap-4 pb-4 border-b border-border">
                    {talent.cover_image_url ? (
                      <img
                        src={talent.cover_image_url}
                        alt={talent.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl">🌿</div>
                    )}
                    <div>
                      <p className="font-medium">{talent.name}</p>
                      <p className="text-sm text-muted-foreground">を応援</p>
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="py-4 border-b border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">選択プラン</h3>
                    <p className="font-medium">{selectedPlan.name}</p>
                    {selectedPlan.description && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedPlan.description}</p>
                    )}
                    {selectedPlan.benefits.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {selectedPlan.benefits.map((benefit, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <svg className="w-3 h-3 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-muted-foreground">料金</span>
                      <span>
                        ¥{formatPrice(selectedPlan.price)}{" "}
                        {getBillingLabel(selectedPlan.billingCycle)}
                      </span>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">お支払い金額</span>
                      <span className="text-xl font-bold">¥{formatPrice(selectedPlan.price)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ※ Stripeの安全な決済ページに移動します。
                      {selectedPlan.billingCycle === "onetime"
                        ? "一度の決済で永続的なアクセスが得られます。"
                        : "いつでも解約可能です。"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {checkoutError && (
                <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {checkoutError}
                </div>
              )}

              {!isLoggedIn && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                  支援するにはログインが必要です。確定ボタンを押すとログインページに移動します。
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep("plan")}>
                  戻る
                </Button>
                <Button
                  size="lg"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="min-w-[160px]"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : selectedPlan.billingCycle === "onetime" ? (
                    "Stripeで購入する"
                  ) : (
                    "Stripeで支払う"
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                「{selectedPlan.billingCycle === "onetime" ? "Stripeで購入する" : "Stripeで支払う"}」をクリックすると、
                <Link href="/terms" className="text-accent hover:underline">利用規約</Link>
                に同意したことになります。
              </p>
            </div>
          )}

          {/* Step 3: Complete (Stripe success redirect) */}
          {step === "complete" && (
            <div className="text-center py-12">
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
                {talent.name}への支援が完了しました
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
          )}
        </div>
      </main>
    </div>
  )
}
