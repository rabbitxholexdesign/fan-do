import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe連携はまだ設定されていません。STRIPE_SECRET_KEY を .env.local に追加してください。" },
      { status: 503 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 })
  }

  const { data: userData } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single()

  const customerId = (userData as { stripe_customer_id?: string } | null)?.stripe_customer_id

  if (!customerId) {
    return NextResponse.json(
      { error: "Stripeアカウントが見つかりません。先に支援プランに申し込んでください。" },
      { status: 404 }
    )
  }

  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" })

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${origin}/mypage/billing`,
  })

  return NextResponse.json({ url: session.url })
}
