"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordConfirmPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Supabase embeds the session tokens in the URL hash after email link click.
  // onAuthStateChange fires with event='PASSWORD_RECOVERY' when the tokens are loaded.
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError("パスワードが一致しません")
      return
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上で設定してください")
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError("パスワードの更新に失敗しました。リンクの有効期限が切れている可能性があります。")
      setIsLoading(false)
      return
    }

    router.push("/mypage?reset=1")
  }

  if (!ready) {
    return (
      <AuthLayout
        title="パスワードリセット"
        description="リンクを確認中..."
      >
        <div className="text-center text-muted-foreground text-sm py-4">
          しばらくお待ちください...
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="新しいパスワードを設定"
      description="8文字以上で入力してください"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">新しいパスワード</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="8文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm">パスワード（確認）</FieldLabel>
            <Input
              id="confirm"
              type="password"
              placeholder="もう一度入力"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </Field>
        </FieldGroup>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading || !password || !confirm}>
          {isLoading ? "更新中..." : "パスワードを更新"}
        </Button>
      </form>
    </AuthLayout>
  )
}
