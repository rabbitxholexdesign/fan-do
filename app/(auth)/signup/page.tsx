"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"type" | "form">("type")
  const [userType, setUserType] = useState<"fan" | "talent">("fan")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    agreeTerms: false,
    agreeMarketing: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.passwordConfirm) {
      setError("パスワードが一致しません")
      return
    }

    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          display_name: formData.name,
          role: userType === "talent" ? "operator" : "fan",
        },
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    // Redirect based on user type
    if (userType === "talent") {
      router.push("/dashboard/talents/new")
    } else {
      router.push("/mypage")
    }
    router.refresh()
  }
  
  if (step === "type") {
    return (
      <AuthLayout
        title="新規登録"
        subtitle="fan℃へようこそ。まずは利用目的を教えてください"
      >
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => {
              setUserType("fan")
              setStep("form")
            }}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-accent transition-colors text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">ファンとして応援したい</h3>
                <p className="text-sm text-muted-foreground">
                  地域のタレントを発見し、支援・応援を通じて繋がりましょう
                </p>
              </div>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setUserType("talent")
              setStep("form")
            }}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-accent transition-colors text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">タレントとして活動したい</h3>
                <p className="text-sm text-muted-foreground">
                  あなたの活動を発信し、ファンからの支援を受けましょう
                </p>
              </div>
            </div>
          </button>
          
          <p className="text-center text-sm text-muted-foreground pt-4">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-accent hover:underline font-medium">
              ログイン
            </Link>
          </p>
        </div>
      </AuthLayout>
    )
  }
  
  return (
    <AuthLayout
      title={userType === "talent" ? "タレント登録" : "ファン登録"}
      subtitle={
        userType === "talent"
          ? "まずはアカウントを作成しましょう"
          : "応援を始めるためのアカウントを作成しましょう"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Back button */}
        <button
          type="button"
          onClick={() => setStep("type")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        
        {/* Social Signup */}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" className="w-full">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </Button>
          <Button type="button" variant="outline" className="w-full">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X
          </Button>
        </div>
        
        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
            または
          </span>
        </div>
        
        {/* Email Signup */}
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">お名前</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="山田 太郎"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </Field>
          
          <Field>
            <FieldLabel htmlFor="email">メールアドレス</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </Field>
          
          <Field>
            <FieldLabel htmlFor="password">パスワード</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />
          </Field>
          
          <Field>
            <FieldLabel htmlFor="passwordConfirm">パスワード（確認）</FieldLabel>
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="パスワードを再入力"
              value={formData.passwordConfirm}
              onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
              required
            />
          </Field>
        </FieldGroup>
        
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              checked={formData.agreeTerms}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, agreeTerms: checked as boolean })
              }
              required
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
              <Link href="/terms" className="text-accent hover:underline">利用規約</Link>
              および
              <Link href="/privacy" className="text-accent hover:underline">プライバシーポリシー</Link>
              に同意します
            </label>
          </div>
          
          <div className="flex items-start gap-2">
            <Checkbox
              id="marketing"
              checked={formData.agreeMarketing}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, agreeMarketing: checked as boolean })
              }
              className="mt-1"
            />
            <label htmlFor="marketing" className="text-sm text-muted-foreground cursor-pointer">
              新着タレントやお得な情報をメールで受け取る（任意）
            </label>
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !formData.agreeTerms}
        >
          {isLoading ? "登録中..." : "アカウントを作成"}
        </Button>
        
        <p className="text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-accent hover:underline font-medium">
            ログイン
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
