import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Stripe webhook — receives events from Stripe and updates DB
export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    console.error("Stripe env vars not configured")
    return NextResponse.json({ error: "Not configured" }, { status: 503 })
  }

  const Stripe = (await import("stripe")).default
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-03-31.basil" })

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: import("stripe").Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as import("stripe").Stripe.Checkout.Session

      const { fan_id, talent_id, plan_id } = session.metadata ?? {}
      if (!fan_id || !talent_id || !plan_id) {
        console.error("Missing metadata in checkout.session.completed", session.id)
        break
      }

      const { data: plan } = await supabase
        .from("support_plans")
        .select("fanc_bonus, name, billing_cycle")
        .eq("id", plan_id)
        .single()

      if (session.mode === "subscription") {
        const stripeSubscriptionId = session.subscription as string
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
        const periodStart = new Date(stripeSub.current_period_start * 1000).toISOString()
        const periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString()

        const { error } = await supabase.from("subscriptions").upsert(
          {
            fan_id,
            talent_id,
            plan_id,
            status: "active",
            stripe_subscription_id: stripeSubscriptionId,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          },
          { onConflict: "stripe_subscription_id" }
        )

        if (error) {
          console.error("Failed to upsert subscription:", error)
          return NextResponse.json({ error: "DB error" }, { status: 500 })
        }
      } else if (session.mode === "payment") {
        // 買い切りプラン — サブスクリプションではなく単発レコードとして保存
        const stripePaymentIntentId = session.payment_intent as string
        const now = new Date().toISOString()

        const { error } = await supabase.from("subscriptions").upsert(
          {
            fan_id,
            talent_id,
            plan_id,
            status: "active",
            stripe_subscription_id: stripePaymentIntentId, // payment_intent IDを代用
            current_period_start: now,
            current_period_end: null, // 永続アクセス
          },
          { onConflict: "stripe_subscription_id" }
        )

        if (error) {
          console.error("Failed to upsert onetime purchase:", error)
          return NextResponse.json({ error: "DB error" }, { status: 500 })
        }
      }

      // Add initial fanc_score entry
      if (plan && plan.fanc_bonus > 0) {
        await supabase.from("fanc_scores").insert({
          fan_id,
          talent_id,
          score: plan.fanc_bonus,
          action_type: "subscription",
          description: `${plan.name}プランに参加`,
        })
      }

      break
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as import("stripe").Stripe.Subscription
      const status = sub.status === "active" ? "active"
        : sub.status === "canceled" ? "cancelled"
        : sub.status === "past_due" ? "past_due"
        : sub.status === "paused" ? "paused"
        : null

      if (!status) break

      const periodStart = new Date(sub.current_period_start * 1000).toISOString()
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString()

      await supabase
        .from("subscriptions")
        .update({ status, current_period_start: periodStart, current_period_end: periodEnd })
        .eq("stripe_subscription_id", sub.id)

      break
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as import("stripe").Stripe.Subscription

      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("stripe_subscription_id", sub.id)

      break
    }

    default:
      // Unhandled event type — return 200 to acknowledge receipt
      break
  }

  return NextResponse.json({ received: true })
}
