import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TalentCard, TalentGrid, type TalentData } from "@/components/talent-card"
import { FanTemperatureMeter } from "@/components/fan-temperature-meter"
import { ArrowRight } from "lucide-react"

const featuredTalents: TalentData[] = [
  {
    id: "1",
    name: "みちのく農園 佐藤さん",
    tagline: "築100年の古民家で作る、こだわりの有機野菜。土と向き合い続けて30年。",
    category: "農業",
    location: "山形県",
    imageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=600&fit=crop",
    fanCount: 1284,
    temperature: 78,
    tags: ["有機野菜", "古民家", "地産地消"],
    isNew: true,
  },
  {
    id: "2",
    name: "波乗り漁師 田中さん",
    tagline: "海と生きる。獲れたての新鮮な魚を、あなたの食卓へ直送します。",
    category: "漁業",
    location: "高知県",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    fanCount: 892,
    temperature: 65,
    tags: ["鮮魚", "直送", "漁師"],
  },
  {
    id: "3",
    name: "伝統工芸 山本漆器",
    tagline: "400年の歴史を持つ輪島塗。職人の技を次世代へ繋ぐ。",
    category: "伝統工芸",
    location: "石川県",
    imageUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&h=600&fit=crop",
    fanCount: 2156,
    temperature: 92,
    tags: ["輪島塗", "伝統工芸", "職人"],
  },
  {
    id: "4",
    name: "里山カフェ ほっこり",
    tagline: "限界集落から始まった、地域を繋ぐ小さなカフェ。",
    category: "飲食",
    location: "岡山県",
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    fanCount: 567,
    temperature: 54,
    tags: ["カフェ", "地域活性化", "コミュニティ"],
  },
  {
    id: "5",
    name: "古民家宿 縁側",
    tagline: "築150年の古民家を改装。日本の原風景の中で心休まるひとときを。",
    category: "観光・宿泊",
    location: "新潟県",
    imageUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&h=600&fit=crop",
    fanCount: 743,
    temperature: 71,
    tags: ["古民家", "宿泊", "田舎暮らし"],
  },
  {
    id: "6",
    name: "陶芸家 清水 花子",
    tagline: "土と火が生み出す一期一会。日常に寄り添う器づくり。",
    category: "伝統工芸",
    location: "京都府",
    imageUrl: "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&h=600&fit=crop",
    fanCount: 1089,
    temperature: 83,
    tags: ["陶芸", "器", "手仕事"],
    isNew: true,
  },
]

const regionalData = [
  { name: "長崎県", temperature: 68, count: 24 },
  { name: "石川県", temperature: 82, count: 31 },
  { name: "京都府", temperature: 75, count: 48 },
  { name: "山形県", temperature: 71, count: 19 },
  { name: "高知県", temperature: 63, count: 15 },
  { name: "島根県", temperature: 58, count: 12 },
]

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "サロン形成",
    description: "タレントとファンが直接繋がる専用サロンを開設。チャット・投稿・限定コンテンツで深い関係を築きます。",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "継続的な支援",
    description: "月額・年額・単発など自由な価格でサポートプランを設定。安定した収益でタレントの活動を持続させます。",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "応援を可視化",
    description: "fan℃スコアで応援の熱量を数値化。地域ブランディングからファンディングへのサイクルを生み出します。",
  },
]

const howToSupport = [
  {
    step: "01",
    title: "サブスクで応援",
    description: "気に入ったタレントのプランに月額・年額でサブスク登録。継続的な支援がタレントの活動を下支えします。",
    badge: "ひと・もの・こと",
  },
  {
    step: "02",
    title: "一緒に育て上げる",
    description: "サロンに参加してタレントとともに成長する体験を。返礼品・体験・権利など様々なリターンを受け取れます。",
    badge: "サロン",
  },
  {
    step: "03",
    title: "推しを活かせる",
    description: "SNSシェアやイベント参加でfan℃スコアを貯めましょう。地域の魅力を全国に広める伝道師になれます。",
    badge: "fan℃スコア",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* ── Hero Section ── */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-sky-50 via-white to-sky-100/50 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(circle,#0ea5e9_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10 py-24 md:py-36">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sky-500 text-sm font-semibold tracking-widest uppercase mb-5 animate-fade-in-up">
              地域タレント応援プラットフォーム
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-800 leading-tight mb-6 animate-fade-in-up [animation-delay:100ms]">
              その地域の
              <br />
              <span className="text-sky-500">ファン</span>になろう
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up [animation-delay:200ms]">
              その地域のファンになる人を、その地域に注ぐ心の温度で、まちの魅力をみんなで循環させる。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up [animation-delay:300ms]">
              <Link
                href="/talents"
                className="bg-sky-500 text-white px-8 py-4 rounded-full font-medium hover:bg-sky-600 transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5"
              >
                タレントを探す
              </Link>
              <Link
                href="/signup"
                className="bg-white text-sky-500 px-8 py-4 rounded-full font-medium border-2 border-sky-500 hover:bg-sky-50 transition-all duration-300"
              >
                タレント登録
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg className="relative block w-full h-12 md:h-16" viewBox="0 0 1440 64" preserveAspectRatio="none">
            <path fill="#ffffff" d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" />
          </svg>
        </div>
      </section>

      {/* ── About / Features Section ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="text-sky-500 text-sm font-semibold tracking-widest uppercase mb-3">ABOUT</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-5">fan℃ とは</h2>
            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
              地域の「ひと・もの・こと」をタレントとして捉え、ファンが応援・支援できるファンコミュニティ創出型プラットフォームです。応援の熱量を
              <strong className="text-slate-800">fan℃（温度）</strong>として数値化・可視化することで、地域ブランディングからファンディングへのサイクルを生み出します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 border border-slate-100 group"
              >
                <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mb-6 text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Talent Showcase ── */}
      <section className="py-24 md:py-32 bg-slate-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
            <div>
              <p className="text-sky-500 text-sm font-semibold tracking-widest uppercase mb-3">TALENTS</p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">注目のタレント</h2>
              <p className="text-slate-600">全国各地で活躍する地域タレントを応援しよう</p>
            </div>
            <Link
              href="/talents"
              className="text-sky-500 font-medium hover:text-sky-600 transition-colors inline-flex items-center gap-2 group whitespace-nowrap"
            >
              すべて見る
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <TalentGrid>
            {featuredTalents.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </TalentGrid>
        </div>
      </section>

      {/* ── Regional Fan Temperature ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="text-sky-500 text-sm font-semibold tracking-widest uppercase mb-3">REGIONS</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">地域別 fan℃ 温度計</h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">
              全国各地の応援熱量をリアルタイムで可視化。あなたの地域の温度は？
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {regionalData.map((region) => (
              <Link
                key={region.name}
                href={`/talents?region=${encodeURIComponent(region.name)}`}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-sky-200 hover:-translate-y-1 transition-all duration-300 group"
              >
                <FanTemperatureMeter temperature={region.temperature} size="md" animate={false} />
                <div className="text-center">
                  <p className="font-medium text-sm text-slate-700 group-hover:text-sky-600 transition-colors">{region.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{region.count}タレント</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Support ── */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-sky-500 to-sky-700 relative overflow-hidden">
        {/* Decorative orb */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <div className="text-center mb-16">
            <p className="text-sky-200 text-sm font-semibold tracking-widest uppercase mb-3">HOW TO</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">3つの支援方法</h2>
            <p className="text-sky-100 text-lg">あなたのスタイルで地域を応援しよう</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howToSupport.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-8xl font-bold text-white/5 absolute -top-4 -left-2 select-none leading-none">
                  {item.step}
                </div>
                <div className="relative pt-8 bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {item.badge}
                  </span>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-sky-100 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sky-500 text-sm font-semibold tracking-widest uppercase mb-4">GET STARTED</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-5">
              あなたの地域の<br />タレントを応援しよう
            </h2>
            <p className="text-slate-600 text-lg mb-10 leading-relaxed">
              無料でアカウントを作成して、全国各地の魅力あるタレントと繋がりましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-sky-500 text-white px-10 py-4 rounded-full font-medium hover:bg-sky-600 transition-all duration-300 shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5"
              >
                無料で始める
              </Link>
              <Link
                href="/talents"
                className="bg-white text-sky-500 px-10 py-4 rounded-full font-medium border-2 border-sky-500 hover:bg-sky-50 transition-all duration-300"
              >
                タレントを見る
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
