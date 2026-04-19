"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  AlertCircle,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const steps = [
  { id: 1, title: "基本情報", description: "タレントの基本情報を入力" },
  { id: 2, title: "本人確認", description: "KYC認証を行います" },
  { id: 3, title: "口座情報", description: "振込先口座を登録" },
  { id: 4, title: "支援プラン", description: "支援プランを設定" },
  { id: 5, title: "確認・申請", description: "内容を確認して申請" },
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
  billingCycle: string
  description: string
  fancBonus: string
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s　]+/g, "-")
    .replace(/[^\w\-]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36)
}

export default function NewTalentPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Step 1: Basic info
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    category: "" as "hito" | "mono" | "koto" | "",
    prefecture: "",
    city: "",
    tags: "",
    description: "",
  })

  // Step 2: KYC
  const [kyc, setKyc] = useState({
    entityType: "" as "individual" | "corporate" | "organization" | "",
    lastName: "",
    firstName: "",
    birthDate: "",
    address: "",
    phone: "",
    companyName: "",
    corporateNumber: "",
    representative: "",
    orgName: "",
    orgRepresentative: "",
  })

  // Step 3: Bank + Legal
  const [bank, setBank] = useState({
    bankName: "",
    branchName: "",
    branchCode: "",
    accountType: "普通",
    accountNumber: "",
    accountHolder: "",
  })
  const [legal, setLegal] = useState({
    sellerName: "",
    email: "",
    cancelPolicy: "",
    deliveryTiming: "",
    hideAddress: false,
  })

  // Step 4: Support plans
  const [supportPlans, setSupportPlans] = useState<SupportPlan[]>([
    { id: "1", name: "", price: "", billingCycle: "monthly", description: "", fancBonus: "0" },
  ])

  // Step 5: Agreements
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeFee, setAgreeFee] = useState(false)

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1)
  }
  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const addPlan = () => {
    setSupportPlans([
      ...supportPlans,
      { id: Date.now().toString(), name: "", price: "", billingCycle: "monthly", description: "", fancBonus: "0" },
    ])
  }
  const removePlan = (id: string) => {
    if (supportPlans.length > 1) setSupportPlans(supportPlans.filter((p) => p.id !== id))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitError("ログインが必要です")
      setIsSubmitting(false)
      return
    }

    const slug = generateSlug(basicInfo.name)

    // 1. Create talent
    const { data: talent, error: talentError } = await supabase
      .from("talents")
      .insert({
        operator_id: user.id,
        name: basicInfo.name,
        slug,
        category: basicInfo.category as "hito" | "mono" | "koto",
        tags: basicInfo.tags ? basicInfo.tags.split(/[,、]/).map((t) => t.trim()).filter(Boolean) : [],
        prefecture: basicInfo.prefecture || null,
        city: basicInfo.city || null,
        description: basicInfo.description || null,
        status: "pending_review",
      })
      .select("id")
      .single()

    if (talentError || !talent) {
      setSubmitError("タレントの作成に失敗しました: " + talentError?.message)
      setIsSubmitting(false)
      return
    }

    const talentId = talent.id

    // 2. KYC submission
    await supabase.from("kyc_submissions").insert({
      talent_id: talentId,
      kyc_type: kyc.entityType as "individual" | "corporate" | "organization",
      status: "pending",
      document_urls: {},
    })

    // 3. Bank account
    if (bank.bankName && bank.accountNumber) {
      await supabase.from("bank_accounts").insert({
        talent_id: talentId,
        bank_name: bank.bankName,
        branch_name: bank.branchName,
        account_type: bank.accountType,
        account_number: bank.accountNumber,
        account_holder: bank.accountHolder,
      })
    }

    // 4. Legal notice
    if (legal.sellerName && legal.email) {
      await supabase.from("legal_notices").insert({
        talent_id: talentId,
        seller_name: legal.sellerName,
        address: legal.hideAddress
          ? "※個人のため住所の公開を省略しています。請求があれば遅滞なく開示します。"
          : "",
        phone: "お問い合わせフォームよりご連絡ください",
        email: legal.email,
        payment_methods: "クレジットカード（Visa, Mastercard, JCB, American Express）",
        billing_timing: "お申し込み日を基準に毎月同日に課金されます",
        delivery_timing: legal.deliveryTiming,
        cancel_policy: legal.cancelPolicy,
        environment: "最新版のブラウザ（Chrome, Safari, Firefox, Edge）でご利用いただけます",
      })
    }

    // 5. Support plans
    const validPlans = supportPlans.filter((p) => p.name && p.price)
    if (validPlans.length > 0) {
      await supabase.from("support_plans").insert(
        validPlans.map((p) => ({
          talent_id: talentId,
          name: p.name,
          description: p.description || null,
          price: parseInt(p.price, 10),
          billing_cycle: p.billingCycle as "monthly" | "yearly",
          fanc_bonus: parseInt(p.fancBonus || "0", 10),
          benefits: [],
        }))
      )
    }

    setIsSubmitting(false)
    router.push("/dashboard?applied=1")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">タレントを作成する</h1>
        <p className="text-muted-foreground mt-1">
          1つのアカウントで複数のタレントを作成できます
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">ステップ {currentStep} / {steps.length}</span>
          <span className="text-muted-foreground">{steps[currentStep - 1].title}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${step.id <= currentStep ? "text-primary" : "text-muted-foreground"}`}
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
                {step.id < currentStep ? <CheckCircle className="h-4 w-4" /> : step.id}
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
                  <p className="text-sm text-muted-foreground">推奨: 400x400px、JPGまたはPNG</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>カバー画像</Label>
                <div className="aspect-[3/1] rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">クリックして画像をアップロード</span>
                  <span className="text-xs">推奨: 1200x400px</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="talent-name">タレント名 *</Label>
                <Input
                  id="talent-name"
                  placeholder="例：山田工房"
                  value={basicInfo.name}
                  onChange={(e) => setBasicInfo({ ...basicInfo, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>カテゴリ *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "hito", label: "ひと", icon: "🧑", desc: "個人・職人・農家など" },
                    { value: "mono", label: "もの", icon: "🦋", desc: "商品・特産品など" },
                    { value: "koto", label: "こと", icon: "🎪", desc: "体験・イベント・プロジェクトなど" },
                  ].map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setBasicInfo({ ...basicInfo, category: cat.value as "hito" | "mono" | "koto" })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors text-center ${
                        basicInfo.category === cat.value
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary"
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                      <span className="text-xs text-muted-foreground">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>都道府県 *</Label>
                  <Select value={basicInfo.prefecture} onValueChange={(v) => setBasicInfo({ ...basicInfo, prefecture: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="都道府県を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {prefectures.map((pref) => (
                        <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">市区町村</Label>
                  <Input
                    id="city"
                    placeholder="例：長崎市"
                    value={basicInfo.city}
                    onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">タグ（カンマ区切り）</Label>
                <Input
                  id="tags"
                  placeholder="例：茶農家, 東彼杵, 長崎"
                  value={basicInfo.tags}
                  onChange={(e) => setBasicInfo({ ...basicInfo, tags: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">紹介文 *</Label>
                <Textarea
                  id="description"
                  placeholder="タレントの魅力や活動内容を紹介してください..."
                  rows={5}
                  value={basicInfo.description}
                  onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">200文字以上推奨</p>
              </div>
            </div>
          )}

          {/* Step 2: KYC */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm">タレントを公開するには本人確認が必要です。情報は暗号化して安全に保管されます。</p>
              </div>

              <div className="space-y-4">
                <Label>事業形態 *</Label>
                <RadioGroup value={kyc.entityType} onValueChange={(v) => setKyc({ ...kyc, entityType: v as typeof kyc.entityType })}>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      { value: "individual", label: "個人", icon: User, desc: "個人事業主・農家・職人など" },
                      { value: "corporate", label: "法人", icon: Building2, desc: "株式会社・合同会社・NPO法人など" },
                      { value: "organization", label: "団体", icon: Users, desc: "PTA・商工会・消防団など" },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          kyc.entityType === type.value ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"
                        }`}
                      >
                        <RadioGroupItem value={type.value} className="sr-only" />
                        <type.icon className="h-8 w-8" />
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-muted-foreground text-center">{type.desc}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {kyc.entityType === "individual" && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>姓（本名）*</Label>
                      <Input placeholder="山田" value={kyc.lastName} onChange={(e) => setKyc({ ...kyc, lastName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>名（本名）*</Label>
                      <Input placeholder="太郎" value={kyc.firstName} onChange={(e) => setKyc({ ...kyc, firstName: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>生年月日 *</Label>
                    <Input type="date" value={kyc.birthDate} onChange={(e) => setKyc({ ...kyc, birthDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>住所 *</Label>
                    <Textarea placeholder="郵便番号、都道府県、市区町村、番地" rows={2} value={kyc.address} onChange={(e) => setKyc({ ...kyc, address: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>電話番号 *</Label>
                    <Input type="tel" placeholder="090-0000-0000" value={kyc.phone} onChange={(e) => setKyc({ ...kyc, phone: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <Label>本人確認書類 *</Label>
                    <p className="text-sm text-muted-foreground">運転免許証またはマイナンバーカードの表・裏面をアップロードしてください</p>
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
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      書類は暗号化保存され、審査のみに使用されます
                    </p>
                  </div>
                </>
              )}

              {kyc.entityType === "corporate" && (
                <>
                  <div className="space-y-2">
                    <Label>法人名 *</Label>
                    <Input placeholder="株式会社○○" value={kyc.companyName} onChange={(e) => setKyc({ ...kyc, companyName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>法人番号（13桁）*</Label>
                    <Input placeholder="0000000000000" maxLength={13} value={kyc.corporateNumber} onChange={(e) => setKyc({ ...kyc, corporateNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>代表者名 *</Label>
                    <Input placeholder="山田 太郎" value={kyc.representative} onChange={(e) => setKyc({ ...kyc, representative: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>登記簿謄本（履歴事項全部証明書）*</Label>
                    <div className="aspect-[3/2] max-w-sm rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">PDF または画像をアップロード</span>
                    </div>
                  </div>
                </>
              )}

              {kyc.entityType === "organization" && (
                <>
                  <div className="space-y-2">
                    <Label>団体名 *</Label>
                    <Input placeholder="○○協会" value={kyc.orgName} onChange={(e) => setKyc({ ...kyc, orgName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>代表者名 *</Label>
                    <Input placeholder="山田 太郎" value={kyc.orgRepresentative} onChange={(e) => setKyc({ ...kyc, orgRepresentative: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>団体規約・会則 *</Label>
                    <div className="aspect-[3/2] max-w-sm rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">PDF をアップロード</span>
                    </div>
                  </div>
                </>
              )}

              {!kyc.entityType && (
                <div className="py-8 text-center text-muted-foreground">上から事業形態を選択してください</div>
              )}
            </div>
          )}

          {/* Step 3: Bank Account + Legal */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">振込先口座について</p>
                  <p>収益は毎月末日に締め、翌月15日に振り込まれます。プラットフォーム手数料20%が差し引かれます。</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>金融機関名 *</Label>
                <Input placeholder="○○銀行" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>支店名 *</Label>
                  <Input placeholder="○○支店" value={bank.branchName} onChange={(e) => setBank({ ...bank, branchName: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>支店コード *</Label>
                  <Input placeholder="123" maxLength={3} value={bank.branchCode} onChange={(e) => setBank({ ...bank, branchCode: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>口座種別 *</Label>
                <RadioGroup value={bank.accountType} onValueChange={(v) => setBank({ ...bank, accountType: v })} className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="普通" id="savings" />
                    <Label htmlFor="savings" className="font-normal">普通</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="当座" id="checking" />
                    <Label htmlFor="checking" className="font-normal">当座</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>口座番号 *</Label>
                <Input placeholder="1234567" maxLength={7} value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>口座名義（カタカナ）*</Label>
                <Input placeholder="ヤマダ タロウ" value={bank.accountHolder} onChange={(e) => setBank({ ...bank, accountHolder: e.target.value })} />
              </div>

              {/* 特定商取引法 */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-base font-semibold">特定商取引法に基づく表記 *</Label>
                <p className="text-sm text-muted-foreground">サブスク支援を受けるには特定商取引法の表記登録が必要です</p>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>販売業者名 *</Label>
                    <Input placeholder="山田 太郎（または屋号）" value={legal.sellerName} onChange={(e) => setLegal({ ...legal, sellerName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>連絡先メールアドレス *</Label>
                    <Input type="email" placeholder="contact@example.com" value={legal.email} onChange={(e) => setLegal({ ...legal, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>キャンセル・返金ポリシー *</Label>
                    <Textarea
                      placeholder="例：サブスクリプションの解約はいつでも可能です。解約月の翌月から課金が停止されます。"
                      rows={3}
                      value={legal.cancelPolicy}
                      onChange={(e) => setLegal({ ...legal, cancelPolicy: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>サービス提供時期 *</Label>
                    <Input placeholder="例：決済確認後即時" value={legal.deliveryTiming} onChange={(e) => setLegal({ ...legal, deliveryTiming: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="hide-address"
                    checked={legal.hideAddress}
                    onCheckedChange={(v) => setLegal({ ...legal, hideAddress: v as boolean })}
                  />
                  <label htmlFor="hide-address" className="text-sm text-muted-foreground cursor-pointer">
                    個人の住所の公開省略を申請する（管理者確認後に対応）
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Support Plans */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm">サポーター向けの支援プランを設定します。最低300円〜。後から追加・変更も可能です。</p>
              </div>

              {supportPlans.map((plan, index) => (
                <Card key={plan.id}>
                  <CardHeader className="flex flex-row items-center justify-between py-3">
                    <CardTitle className="text-base">プラン {index + 1}</CardTitle>
                    {supportPlans.length > 1 && (
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removePlan(plan.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>プラン名 *</Label>
                        <Input
                          placeholder="例：月額サポーター"
                          value={plan.name}
                          onChange={(e) => setSupportPlans(supportPlans.map((p) => p.id === plan.id ? { ...p, name: e.target.value } : p))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>価格（円）*</Label>
                        <Input
                          type="number"
                          placeholder="1000"
                          min={300}
                          value={plan.price}
                          onChange={(e) => setSupportPlans(supportPlans.map((p) => p.id === plan.id ? { ...p, price: e.target.value } : p))}
                        />
                        <p className="text-xs text-muted-foreground">最低300円〜</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>課金サイクル *</Label>
                      <RadioGroup
                        value={plan.billingCycle}
                        onValueChange={(v) => setSupportPlans(supportPlans.map((p) => p.id === plan.id ? { ...p, billingCycle: v } : p))}
                        className="flex flex-wrap gap-4"
                      >
                        {[
                          { value: "monthly", label: "月額" },
                          { value: "yearly", label: "年額" },
                        ].map((cycle) => (
                          <div key={cycle.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={cycle.value} id={`${plan.id}-${cycle.value}`} />
                            <Label htmlFor={`${plan.id}-${cycle.value}`} className="font-normal">{cycle.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div className="space-y-2">
                      <Label>リターン内容</Label>
                      <Textarea
                        placeholder="このプランで支援者が受け取れるリターンを説明してください..."
                        rows={3}
                        value={plan.description}
                        onChange={(e) => setSupportPlans(supportPlans.map((p) => p.id === plan.id ? { ...p, description: e.target.value } : p))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>fan℃加算ポイント</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="0"
                          min={0}
                          className="w-24"
                          value={plan.fancBonus}
                          onChange={(e) => setSupportPlans(supportPlans.map((p) => p.id === plan.id ? { ...p, fancBonus: e.target.value } : p))}
                        />
                        <span className="text-sm text-muted-foreground">℃（このプランに参加すると追加付与するfan℃）</span>
                      </div>
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
                      申請後、管理者が内容を審査します（通常1〜3営業日）。
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-3">入力内容の確認</h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">タレント名</dt>
                    <dd className="font-medium">{basicInfo.name || "—"}</dd>
                    <dt className="text-muted-foreground">カテゴリ</dt>
                    <dd>{basicInfo.category === "hito" ? "ひと" : basicInfo.category === "mono" ? "もの" : basicInfo.category === "koto" ? "こと" : "—"}</dd>
                    <dt className="text-muted-foreground">活動地域</dt>
                    <dd>{[basicInfo.prefecture, basicInfo.city].filter(Boolean).join(" ") || "—"}</dd>
                    <dt className="text-muted-foreground">支援プラン数</dt>
                    <dd>{supportPlans.filter((p) => p.name && p.price).length} 件</dd>
                  </dl>
                </div>

                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">審査フロー</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    {[
                      "基本情報の一次審査（1〜3営業日）",
                      "本人確認（KYC）書類アップロード",
                      "最終承認・タレントページ公開",
                    ].map((step, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center flex-shrink-0 ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(v as boolean)} />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                      利用規約に同意する *
                    </label>
                    <p className="text-xs text-muted-foreground">
                      <Link href="/terms" className="underline">利用規約</Link>、
                      <Link href="/privacy" className="underline">プライバシーポリシー</Link>を確認し、同意します。
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox id="fee" checked={agreeFee} onCheckedChange={(v) => setAgreeFee(v as boolean)} />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="fee" className="text-sm font-medium leading-none cursor-pointer">
                      手数料について理解しました *
                    </label>
                    <p className="text-xs text-muted-foreground">
                      サポーターからの支援金からプラットフォーム手数料20%が差し引かれます。
                    </p>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {submitError}
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          戻る
        </Button>
        <div className="flex gap-2">
          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={currentStep === 1 && (!basicInfo.name || !basicInfo.category)}>
              次へ
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !agreeTerms || !agreeFee}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isSubmitting ? "申請中..." : "申請する"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
