"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, Plus, Trash2, Shield, CheckCircle } from "lucide-react"

// Mock data
const paymentMethods = [
  {
    id: "1",
    type: "visa",
    last4: "4242",
    expiry: "12/26",
    isDefault: true,
  },
  {
    id: "2",
    type: "mastercard",
    last4: "8888",
    expiry: "08/25",
    isDefault: false,
  },
]

const cardBrandLogos: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  jcb: "JCB",
}

export default function PaymentPage() {
  const [methods, setMethods] = useState(paymentMethods)
  const [isAddingCard, setIsAddingCard] = useState(false)

  const handleSetDefault = (id: string) => {
    setMethods(
      methods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    )
  }

  const handleDelete = (id: string) => {
    setMethods(methods.filter((method) => method.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">お支払い方法</h1>
        <p className="text-muted-foreground">
          支援に使用するお支払い方法を管理します
        </p>
      </div>

      {/* Security Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">安全なお支払い</p>
              <p className="text-sm text-muted-foreground">
                お支払い情報はStripeによって安全に管理されています。
                カード情報は暗号化され、当サービスには保存されません。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>登録済みのカード</CardTitle>
            <CardDescription>支援に使用するカードを管理します</CardDescription>
          </div>
          <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                カードを追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新しいカードを追加</DialogTitle>
                <DialogDescription>
                  支援に使用するクレジットカードを登録します
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="card-number">カード番号</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">有効期限</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">セキュリティコード</Label>
                    <Input id="cvc" placeholder="123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">カード名義</Label>
                  <Input id="name" placeholder="TARO TANAKA" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingCard(false)}>
                  キャンセル
                </Button>
                <Button onClick={() => setIsAddingCard(false)}>
                  追加する
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 flex items-center justify-center bg-muted rounded text-xs font-bold">
                    {cardBrandLogos[method.type]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        •••• •••• •••• {method.last4}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          デフォルト
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      有効期限: {method.expiry}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      デフォルトに設定
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {methods.length === 0 && (
              <div className="py-12 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  カードが登録されていません
                </h3>
                <p className="text-muted-foreground mb-4">
                  支援を始めるにはカードを登録してください
                </p>
                <Button onClick={() => setIsAddingCard(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  カードを追加
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing History Link */}
      <Card>
        <CardHeader>
          <CardTitle>請求書・領収書</CardTitle>
          <CardDescription>
            過去の支援に関する請求書や領収書を確認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">請求履歴を確認</Button>
        </CardContent>
      </Card>
    </div>
  )
}
