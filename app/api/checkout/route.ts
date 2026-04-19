import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  // Stripe keys check
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

  const body = await req.json()
  const { planId, talentId } = body as { planId: string; talentId: string }

  if (!planId || !talentId) {
    return NextResponse.json({ error: "planId と talentId が必要です" }, { status: 400 })
  }

  // Verify plan exists and is active
  const { data: plan, error: planError } = await supabase
    .from("support_plans")
    .select("id, name, price, billing_cycle, stripe_price_id, talent_id")
    .eq("id", planId)
    .eq("talent_id", talentId)
    .eq("is_active", true)
    .single()

  if (planError || !plan) {
    return NextResponse.json({ error: "プランが見つかりません" }, { status: 404 })
  }

  // Check for existing active subscription
  const { data: existingSub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("fan_id", user.id)
    .eq("talent_id", talentId)
    .eq("status", "active")
    .limit(1)
    .single()

  if (existingSub) {
    return NextResponse.json({ error: "すでにこのタレントのサロンに参加しています" }, { status: 409 })
  }

  // Dynamically import Stripe to avoid build errors when key is not set
  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" })

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const isOnetime = plan.billing_cycle === "onetime"

  // If plan has a Stripe Price ID, use it directly. Otherwise create a price on the fly.
  let stripePriceId = plan.stripe_price_id

  if (!stripePriceId) {
    const stripePrice = await stripe.prices.create({
      unit_amount: plan.price,
      currency: "jpy",
      ...(isOnetime
        ? {}
        : {
            recurring: {
              interval: plan.billing_cycle === "yearly" ? "year"
                : plan.billing_cycle === "quarterly" ? "month"  // quarterly handled as 3 × monthly
                : "month",
              ...(plan.billing_cycle === "quarterly" ? { interval_count: 3 } : {}),
            },
          }),
      product_data: { name: plan.name },
    })
    stripePriceId = stripePrice.id

    // Save stripe_price_id back to DB for reuse
    await supabase
      .from("support_plans")
      .update({ stripe_price_id: stripePriceId })
      .eq("id", planId)
  }

  // Fetch or create Stripe customer for this user
  const { data: userData } = await supabase
    .from("users")
    .select("email, stripe_customer_id")
    .eq("id", user.id)
    .single()

  let customerId = (userData as { stripe_customer_id?: string } | null)?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userData?.email ?? user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await supabase
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id)
  }

  const commonMeta = { fan_id: user.id, talent_id: talentId, plan_id: planId }

  // Create Stripe Checkout Session (mode differs for subscription vs one-time)
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isOnetime ? "payment" : "subscription",
    line_items: [{ price: stripePriceId, quantity: 1 }],
    success_url: `${origin}/talents/${talentId}/support/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/talents/${talentId}/support?plan=${planId}`,
    metadata: commonMeta,
    ...(isOnetime
      ? {
          payment_intent_data: { metadata: commonMeta },
        }
      : {
          subscription_data: { metadata: commonMeta },
        }),
  })

  return NextResponse.json({ url: session.url })
}
