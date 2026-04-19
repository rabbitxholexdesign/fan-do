"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const CATEGORIES = [
  { value: "hito", label: "ひと", desc: "コミュニティ・交流" },
  { value: "mono", label: "もの", desc: "物品・送付" },
  { value: "koto", label: "こと", desc: "体験・参加権" },
]

const CYCLES = [
  { value: "monthly", label: "月額" },
  { value: "quarterly", label: "3ヶ月" },
  { value: "biannual", label: "半年" },
  { value: "yearly", label: "年額" },
  { value: "onetime", label: "買い切り" },
]

export default function NewPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const talentId = searchParams.get("talentId")

  const [name, setName] = useState("")
  const [category, setCategory] = useState("hito")
  const [price, setPrice] = useState("")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [maxSupporters, setMaxSupporters] = useState("")
  const [returnDesc, setReturnDesc] = useState("")
  const [fancBonus, setFancBonus] = useState("0")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [activeTalentId, setActiveTalentId] = useState<string | null>(talentId)

  useEffect(() => {
    if (talentId) { setActiveTalentId(talentId); return }
    async function getTalent() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("talents")
        .select("id")
        .eq("operator_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()
      if (data) setActiveTalentId(data.id)
    }
    getTalent()
  }, [talentId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeTalentId) { setError("タレントが見つかりません"); return }
    const priceNum = parseInt(price)
    if (isNaN(priceNum) || priceNum < 300) { setError("価格は300円以上で設定してください"); return }

    setIsSubmitting(true)
    setError("")
    const supabase = createClient()
    const { error: insertError } = await supabase.from("support_plans").insert({
      talent_id: activeTalentId,
      name: name.trim(),
      description: description.trim() || null,
      category,
      price: priceNum,
      billing_cycle: billingCycle,
      max_supporters: maxSupporters ? parseInt(maxSupporters) : null,
      return_description: returnDesc.trim() || null,
      fanc_bonus: parseInt(fancBonus) || 0,
      is_active: true,
    })

    if (insertError) {
      setError("プランの作成に失敗しました: " + insertError.message)
      setIsSubmitting(false)
      return
    }

    router.push(`/dashboard/plans${activeTalentId ? `?talentId=${activeTalentId}` : ""}`)
  }

  const previewPrice = parseInt(price) || 0
  const platformFee = Math.round(previewPrice * 0.2)
  const netAmount = previewPrice - platformFee

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/plans">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">新しいプランを作成</h1>
          <p className="text-muted-foreground">価格は自由に設定できます（最低300円〜）</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">プラン名 *</Label>
                  <Input
                    id="name"
                    placeholder="例：月額サポーター、シーズン応援プラン"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">プランの説明</Label>
                  <Textarea
                    id="description"
                    placeholder="このプランの概要を入力..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* カテゴリ */}
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ</CardTitle>
                <CardDescription>プランの種類を選択してください</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        category === cat.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-semibold">{cat.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 価格・課金サイクル */}
            <Card>
              <CardHeader>
                <CardTitle>価格設定</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">価格（円）*</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">¥</span>
                    <Input
                      id="price"
                      type="number"
                      min="300"
                      placeholder="1000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">最低価格：¥300</p>
                </div>

                <div className="space-y-2">
                  <Label>課金サイクル</Label>
                  <div className="flex flex-wrap gap-2">
                    {CYCLES.map((cycle) => (
                      <button
                        key={cycle.value}
                        type="button"
                        onClick={() => setBillingCycle(cycle.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                          billingCycle === cycle.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {cycle.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSupporters">上限人数（空欄=無制限）</Label>
                  <Input
                    id="maxSupporters"
                    type="number"
                    min="1"
                    placeholder="例：10（オーナー制度など）"
                    value={maxSupporters}
                    onChange={(e) => setMaxSupporters(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* リターン */}
            <Card>
              <CardHeader>
                <CardTitle>リターン内容</CardTitle>
                <CardDescription>サポーターへのお礼・特典を記入してください</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="例：・毎月の活動レポートを送付&#10;・限定サロンへの参加権&#10;・年1回のお礼の品を送付"
                  value={returnDesc}
                  onChange={(e) => setReturnDesc(e.target.value)}
                  rows={4}
                />
                <div className="space-y-2">
                  <Label htmlFor="fancBonus">fan℃ ボーナス（加算ポイント）</Label>
                  <div className="relative">
                    <Input
                      id="fancBonus"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={fancBonus}
                      onChange={(e) => setFancBonus(e.target.value)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">℃</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    このプランに参加したファンに付与するfan℃ボーナス
                  </p>
                </div>
              </CardContent>
            </Card>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>
            )}
          </div>

          {/* Sidebar: Preview & Actions */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>プレビュー</CardTitle>
                <CardDescription>ファンページでの表示イメージ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {CATEGORIES.find((c) => c.value === category)?.label ?? "ひと"}
                    </Badge>
                    {parseInt(fancBonus) > 0 && (
                      <Badge className="text-xs">+{fancBonus}℃</Badge>
                    )}
                  </div>
                  <h3 className="font-semibold">{name || "プラン名"}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      ¥{previewPrice > 0 ? previewPrice.toLocaleString() : "—"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {CYCLES.find((c) => c.value === billingCycle)?.label}
                    </span>
                  </div>
                  {returnDesc && (
                    <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-4">
                      {returnDesc}
                    </p>
                  )}
                  <Button className="w-full" size="sm" disabled>
                    このプランで応援する
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 収益シミュレーション */}
            {previewPrice >= 300 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">収益シミュレーション</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">設定価格</span>
                    <span>¥{previewPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">プラットフォーム手数料（20%）</span>
                    <span className="text-destructive">-¥{platformFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t">
                    <span>あなたの取り分</span>
                    <span>¥{netAmount.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !name.trim() || !price}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "作成中..." : "プランを作成・公開"}
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/plans">キャンセル</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
