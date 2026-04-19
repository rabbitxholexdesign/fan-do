"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Camera, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  User,
  Building2,
  Users,
  Upload,
  Plus,
  Trash2,
  AlertCircle
} from "lucide-react"

const steps = [
  { id: 1, title: "基本情報", description: "タレントの基本情報を入力" },
  { id: 2, title: "本人確認", description: "KYC認証を行います" },
  { id: 3, title: "口座情報", description: "振込先口座を登録" },
  { id: 4, title: "支援プラン", description: "支援プランを設定" },
  { id: 5, title: "確認・申請", description: "内容を確認して申請" },
]

const categories = [
  "伝統工芸",
  "アート・クリエイティブ",
  "音楽・エンターテイメント",
  "飲食・フード",
  "地域振興・まちづくり",
  "スポーツ・健康",
  "教育・学び",
  "その他",
]

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
]

interface SupportPlan {
  id: string
  name: string
  price: string
  description: string
}

export default function TalentRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [entityType, setEntityType] = useState<string>("")
  const [supportPlans, setSupportPlans] = useState<SupportPlan[]>([
    { id: "1", name: "", price: "", description: "" },
  ])

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const addPlan = () => {
    setSupportPlans([
      ...supportPlans,
      { id: Date.now().toString(), name: "", price: "", description: "" },
    ])
  }

  const removePlan = (id: string) => {
    if (supportPlans.length > 1) {
      setSupportPlans(supportPlans.filter((plan) => plan.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            ステップ {currentStep} / {steps.length}
          </span>
          <span className="text-muted-foreground">
            {steps[currentStep - 1].title}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        
        {/* Step Indicators */}
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id <= currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id < currentStep
                    ? "bg-primary text-primary-foreground"
                    : step.id === currentStep
                    ? "border-2 border-primary text-primary"
                    : "border-2 border-muted text-muted-foreground"
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="font-medium">プロフィール画像</p>
                  <p className="text-sm text-muted-foreground">
                    推奨: 400x400px、JPGまたはPNG
                  </p>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <Label>カバー画像</Label>
                <div className="aspect-[3/1] rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">クリックして画像をアップロード</span>
                  <span className="text-xs">推奨: 1200x400px</span>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="talent-name">タレント名 *</Label>
                <Input id="talent-name" placeholder="例：山田工房" />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">カテゴリ *</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">活動地域 *</Label>
                <Select>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="都道府県を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {prefectures.map((pref) => (
                      <SelectItem key={pref} value={pref}>
                        {pref}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">紹介文 *</Label>
                <Textarea
                  id="description"
                  placeholder="タレントの魅力や活動内容を紹介してください..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  200文字以上推奨
                </p>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <Label>SNS・Webサイト（任意）</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="Webサイト URL" />
                  <Input placeholder="X (Twitter)" />
                  <Input placeholder="Instagram" />
                  <Input placeholder="YouTube" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: KYC */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Entity Type */}
              <div className="space-y-4">
                <Label>事業形態 *</Label>
                <RadioGroup value={entityType} onValueChange={setEntityType}>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        entityType === "individual"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/50"
                      }`}
                    >
                      <RadioGroupItem value="individual" className="sr-only" />
                      <User className="h-8 w-8" />
                      <span className="font-medium">個人</span>
                    </label>
                    <label
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        entityType === "corporate"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/50"
                      }`}
                    >
                      <RadioGroupItem value="corporate" className="sr-only" />
                      <Building2 className="h-8 w-8" />
                      <span className="font-medium">法人</span>
                    </label>
                    <label
                      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        entityType === "organization"
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-muted-foreground/50"
                      }`}
                    >
                      <RadioGroupItem value="organization" className="sr-only" />
                      <Users className="h-8 w-8" />
                      <span className="font-medium">団体</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {entityType === "individual" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="last-name">姓 *</Label>
                      <Input id="last-name" placeholder="山田" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="first-name">名 *</Label>
                      <Input id="first-name" placeholder="太郎" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth-date">生年月日 *</Label>
                    <Input id="birth-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">住所 *</Label>
                    <Textarea id="address" placeholder="郵便番号、都道府県、市区町村、番地" rows={2} />
                  </div>
                  <div className="space-y-4">
                    <Label>本人確認書類 *</Label>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm mb-3">以下のいずれかの書類をアップロードしてください：</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
                        <li>運転免許証（表・裏）</li>
                        <li>マイナンバーカード（表面のみ）</li>
                        <li>パスポート（顔写真ページ）</li>
                      </ul>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                          <Upload className="h-6 w-6" />
                          <span className="text-xs">表面</span>
                        </div>
                        <div className="aspect-[3/2] rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                          <Upload className="h-6 w-6" />
                          <span className="text-xs">裏面</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {entityType === "corporate" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company-name">法人名 *</Label>
                    <Input id="company-name" placeholder="株式会社○○" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="corporate-number">法人番号 *</Label>
                    <Input id="corporate-number" placeholder="13桁の法人番号" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="representative">代表者名 *</Label>
                    <Input id="representative" placeholder="山田 太郎" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-address">所在地 *</Label>
                    <Textarea id="company-address" rows={2} />
                  </div>
                  <div className="space-y-4">
                    <Label>登記簿謄本（履歴事項全部証明書）*</Label>
                    <div className="aspect-[3/2] max-w-sm rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">PDF または画像をアップロード</span>
                    </div>
                  </div>
                </>
              )}

              {entityType === "organization" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="org-name">団体名 *</Label>
                    <Input id="org-name" placeholder="○○協会" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-representative">代表者名 *</Label>
                    <Input id="org-representative" placeholder="山田 太郎" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-address">所在地 *</Label>
                    <Textarea id="org-address" rows={2} />
                  </div>
                  <div className="space-y-4">
                    <Label>団体の活動を証明する書類 *</Label>
                    <p className="text-sm text-muted-foreground">
                      規約、会則、または活動報告書などをアップロードしてください
                    </p>
                    <div className="aspect-[3/2] max-w-sm rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">PDF または画像をアップロード</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Bank Account */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">振込先口座について</p>
                  <p>収益は毎月末日に締め、翌月15日に振り込まれます。</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank-name">金融機関名 *</Label>
                <Input id="bank-name" placeholder="○○銀行" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">支店名 *</Label>
                  <Input id="branch-name" placeholder="○○支店" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch-code">支店コード *</Label>
                  <Input id="branch-code" placeholder="123" maxLength={3} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>口座種別 *</Label>
                <RadioGroup defaultValue="savings" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="savings" id="savings" />
                    <Label htmlFor="savings" className="font-normal">普通</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="checking" id="checking" />
                    <Label htmlFor="checking" className="font-normal">当座</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-number">口座番号 *</Label>
                <Input id="account-number" placeholder="1234567" maxLength={7} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account-holder">口座名義（カタカナ）*</Label>
                <Input id="account-holder" placeholder="ヤマダ タロウ" />
                <p className="text-xs text-muted-foreground">
                  通帳に記載の名義と同じカタカナで入力してください
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Support Plans */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm">
                  サポーター向けの支援プランを設定します。
                  最低1つのプランが必要です。後から追加・変更もできます。
                </p>
              </div>

              {supportPlans.map((plan, index) => (
                <Card key={plan.id}>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-base">プラン {index + 1}</CardTitle>
                    {supportPlans.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => removePlan(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>プラン名 *</Label>
                        <Input placeholder="例：スタンダードプラン" />
                      </div>
                      <div className="space-y-2">
                        <Label>月額（円）*</Label>
                        <Input type="number" placeholder="1000" min={100} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>特典・内容 *</Label>
                      <Textarea
                        placeholder="このプランの特典や内容を説明してください..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={addPlan} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                プランを追加
              </Button>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">入力が完了しました</p>
                    <p className="text-sm text-green-700">
                      以下の内容を確認し、問題なければ申請してください。
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">基本情報</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">タレント名</dt>
                    <dd>山田工房</dd>
                    <dt className="text-muted-foreground">カテゴリ</dt>
                    <dd>伝統工芸</dd>
                    <dt className="text-muted-foreground">活動地域</dt>
                    <dd>石川県</dd>
                  </dl>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">本人確認</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">事業形態</dt>
                    <dd>個人</dd>
                    <dt className="text-muted-foreground">氏名</dt>
                    <dd>山田 太郎</dd>
                    <dt className="text-muted-foreground">書類</dt>
                    <dd>アップロード済み</dd>
                  </dl>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">振込先口座</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">金融機関</dt>
                    <dd>○○銀行 ○○支店</dd>
                    <dt className="text-muted-foreground">口座番号</dt>
                    <dd>普通 *****67</dd>
                    <dt className="text-muted-foreground">名義</dt>
                    <dd>ヤマダ タロウ</dd>
                  </dl>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">支援プラン</h4>
                  <div className="space-y-2 text-sm">
                    <p>スタンダードプラン: ¥1,000/月</p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      利用規約に同意する *
                    </label>
                    <p className="text-xs text-muted-foreground">
                      <Link href="/terms" className="underline">利用規約</Link>、
                      <Link href="/privacy" className="underline">プライバシーポリシー</Link>、
                      <Link href="/guidelines" className="underline">コミュニティガイドライン</Link>
                      を確認し、同意します。
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="fee" />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="fee"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      手数料について理解しました *
                    </label>
                    <p className="text-xs text-muted-foreground">
                      サポーターからの支援金から20%のプラットフォーム手数料が差し引かれます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        {currentStep < steps.length ? (
          <Button onClick={handleNext}>
            次へ
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button className="bg-primary">
            <CheckCircle className="h-4 w-4 mr-2" />
            申請する
          </Button>
        )}
      </div>
    </div>
  )
}
