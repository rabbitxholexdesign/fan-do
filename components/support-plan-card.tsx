"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export interface SupportPlanData {
  id: string
  name: string
  price: number
  billingCycle: "monthly" | "yearly" | "one_time"
  description: string
  benefits: string[]
  supporterCount?: number
  isPopular?: boolean
  isLimited?: boolean
  limitCount?: number
  remainingCount?: number
}

interface SupportPlanCardProps {
  plan: SupportPlanData
  onSelect?: (planId: string) => void
  selected?: boolean
  className?: string
}

export function SupportPlanCard({ plan, onSelect, selected, className }: SupportPlanCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP").format(price)
  }
  
  const getBillingLabel = (cycle: SupportPlanData["billingCycle"]) => {
    switch (cycle) {
      case "monthly": return "/ 月"
      case "yearly": return "/ 年"
      case "one_time": return ""
    }
  }
  
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        selected && "ring-2 ring-accent border-accent",
        plan.isPopular && "border-accent/50",
        className
      )}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute top-0 right-0">
          <div className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
            人気
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            {plan.isLimited && plan.remainingCount !== undefined && (
              <Badge variant="outline" className="mt-2 text-xs">
                残り {plan.remainingCount}/{plan.limitCount} 枠
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <span className="text-3xl font-bold">¥{formatPrice(plan.price)}</span>
          <span className="text-muted-foreground text-sm ml-1">
            {getBillingLabel(plan.billingCycle)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          {plan.description}
        </p>
        
        <ul className="space-y-2.5 mb-6">
          {plan.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <svg
                className="w-4 h-4 text-accent mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        
        {plan.supporterCount !== undefined && (
          <p className="text-xs text-muted-foreground mb-4">
            {plan.supporterCount.toLocaleString()} 人が支援中
          </p>
        )}
        
        <Button
          className={cn(
            "w-full",
            plan.isPopular && "bg-accent hover:bg-accent/90 text-accent-foreground"
          )}
          variant={selected ? "default" : plan.isPopular ? "default" : "outline"}
          onClick={() => onSelect?.(plan.id)}
          disabled={plan.isLimited && plan.remainingCount === 0}
        >
          {plan.isLimited && plan.remainingCount === 0
            ? "受付終了"
            : selected
            ? "選択中"
            : "このプランで支援する"
          }
        </Button>
      </CardContent>
    </Card>
  )
}

// Horizontal variant for checkout flow
interface SupportPlanRowProps {
  plan: SupportPlanData
  onSelect?: (planId: string) => void
  selected?: boolean
  className?: string
}

export function SupportPlanRow({ plan, onSelect, selected, className }: SupportPlanRowProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ja-JP").format(price)
  }
  
  const getBillingLabel = (cycle: SupportPlanData["billingCycle"]) => {
    switch (cycle) {
      case "monthly": return "/ 月"
      case "yearly": return "/ 年"
      case "one_time": return ""
    }
  }
  
  return (
    <button
      type="button"
      onClick={() => onSelect?.(plan.id)}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-all duration-200",
        selected
          ? "border-accent bg-accent/5 ring-2 ring-accent"
          : "border-border hover:border-accent/50 hover:bg-muted/50",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              selected ? "border-accent bg-accent" : "border-muted-foreground"
            )}
          >
            {selected && (
              <svg className="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{plan.name}</span>
              {plan.isPopular && (
                <Badge className="bg-accent/10 text-accent text-xs">人気</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {plan.description}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="font-semibold">¥{formatPrice(plan.price)}</span>
          <span className="text-sm text-muted-foreground">
            {getBillingLabel(plan.billingCycle)}
          </span>
        </div>
      </div>
    </button>
  )
}
