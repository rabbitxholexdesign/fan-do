"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { MapPin, Calendar, ExternalLink, Heart } from "lucide-react"

// Mock data
const supportingTalents = [
  {
    id: "1",
    name: "山田工房",
    category: "伝統工芸",
    location: "石川県",
    image: "/placeholder.svg?height=200&width=300",
    fanTemperature: 85,
    planName: "スタンダードプラン",
    planPrice: 1000,
    nextBillingDate: "2024年5月1日",
    supportingSince: "2024年2月",
  },
  {
    id: "2",
    name: "cafe irodori",
    category: "カフェ",
    location: "京都府",
    image: "/placeholder.svg?height=200&width=300",
    fanTemperature: 72,
    planName: "ライトプラン",
    planPrice: 500,
    nextBillingDate: "2024年5月1日",
    supportingSince: "2024年3月",
  },
  {
    id: "3",
    name: "地域おこし協力隊 田中",
    category: "地域振興",
    location: "新潟県",
    image: "/placeholder.svg?height=200&width=300",
    fanTemperature: 65,
    planName: "プレミアムプラン",
    planPrice: 3000,
    nextBillingDate: "2024年5月15日",
    supportingSince: "2024年1月",
  },
]

const pastSupports = [
  {
    id: "4",
    name: "民芸品 はなみずき",
    category: "伝統工芸",
    location: "岐阜県",
    image: "/placeholder.svg?height=200&width=300",
    supportedUntil: "2024年3月",
    totalSupported: 6000,
  },
]

export default function SupportingPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">応援中のタレント</h1>
        <p className="text-muted-foreground">
          現在応援しているタレントを管理します
        </p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            応援中 ({supportingTalents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            過去の応援 ({pastSupports.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {supportingTalents.map((talent) => (
            <Card key={talent.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0">
                    <Image
                      src={talent.image}
                      alt={talent.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {talent.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {talent.location}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold">{talent.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {talent.supportingSince}から応援
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <FanTemperatureMeter
                          temperature={talent.fanTemperature}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Plan Info */}
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{talent.planName}</p>
                          <p className="text-sm text-muted-foreground">
                            月額 ¥{talent.planPrice.toLocaleString()} ・
                            次回請求日: {talent.nextBillingDate}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/talents/${talent.id}`}>
                              <ExternalLink className="h-4 w-4 mr-1" />
                              詳細
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            プラン変更
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {supportingTalents.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Heart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  応援中のタレントがいません
                </h3>
                <p className="text-muted-foreground mb-4">
                  タレントを探して応援を始めましょう
                </p>
                <Button asChild>
                  <Link href="/talents">タレントを探す</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastSupports.map((talent) => (
            <Card key={talent.id} className="overflow-hidden opacity-75">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 grayscale">
                    <Image
                      src={talent.image}
                      alt={talent.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {talent.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {talent.location}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold">{talent.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {talent.supportedUntil}まで応援 ・ 累計 ¥
                        {talent.totalSupported.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/talents/${talent.id}`}>
                          再び応援する
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
