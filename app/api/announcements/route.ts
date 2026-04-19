import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  // Verify the sender is authenticated and owns the talent
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const body = await req.json()
  const { talentId, title, message } = body as { talentId: string; title: string; message: string }

  if (!talentId || !title?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "talentId・タイトル・本文は必須です" }, { status: 400 })
  }

  // Verify the user owns this talent
  const { data: talent, error: talentError } = await supabase
    .from("talents")
    .select("id, name")
    .eq("id", talentId)
    .eq("user_id", user.id)
    .single()

  if (talentError || !talent) {
    return NextResponse.json({ error: "タレントが見つかりません" }, { status: 404 })
  }

  // Check service role key is configured
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY が設定されていません。.env.local を確認してください。" },
      { status: 503 }
    )
  }

  // Get all active subscribers for this talent
  const { data: subscribers, error: subError } = await supabase
    .from("subscriptions")
    .select("fan_id")
    .eq("talent_id", talentId)
    .eq("status", "active")

  if (subError) {
    return NextResponse.json({ error: "サポーター一覧の取得に失敗しました" }, { status: 500 })
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ count: 0 })
  }

  // Insert notifications for all subscribers (bypasses RLS via service role)
  const serviceClient = createServiceClient()
  const notifications = subscribers.map((sub) => ({
    user_id: sub.fan_id,
    type: "news" as const,
    title,
    body: message,
    link_url: `/community/${talentId}`,
  }))

  const { error: insertError } = await serviceClient
    .from("notifications")
    .insert(notifications)

  if (insertError) {
    console.error("Failed to insert notifications:", insertError)
    return NextResponse.json({ error: "通知の送信に失敗しました" }, { status: 500 })
  }

  return NextResponse.json({ count: subscribers.length })
}
