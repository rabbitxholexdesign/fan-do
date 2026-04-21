# RealAIze Style Design System

このデザインシステムは、RealAIze（https://realaize.jp/）のビジュアルスタイルを参考に作成されました。
Claude Code や他のAIコーディングアシスタントにデザイン指示を行う際に使用してください。

---

## 🎨 カラーパレット

### プライマリカラー
```css
--primary: #0ea5e9;           /* スカイブルー - メインアクセント */
--primary-light: #7dd3fc;     /* ライトスカイブルー - グラデーション用 */
--primary-dark: #0284c7;      /* ダークスカイブルー - ホバー状態 */
--primary-subtle: #e0f2fe;    /* 非常に薄いブルー - 背景アクセント */
```

### ニュートラルカラー
```css
--background: #ffffff;        /* 純白 - メイン背景 */
--background-subtle: #f8fafc; /* オフホワイト - セクション背景 */
--foreground: #1e293b;        /* ダークスレート - メインテキスト */
--muted: #64748b;             /* スレートグレー - サブテキスト */
--border: #e2e8f0;            /* ライトグレー - ボーダー */
```

### アクセントカラー
```css
--accent: #f97316;            /* オレンジ - CTA強調（控えめに使用） */
```

---

## 📝 タイポグラフィ

### フォントファミリー
```css
/* 日本語: クリーンなゴシック体 */
font-family: "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif;

/* 英語: モダンなサンセリフ */
font-family: "Inter", "Poppins", system-ui, sans-serif;
```

### フォントサイズスケール
```css
--text-xs: 0.75rem;      /* 12px - キャプション、ラベル */
--text-sm: 0.875rem;     /* 14px - 小さいテキスト */
--text-base: 1rem;       /* 16px - 本文 */
--text-lg: 1.125rem;     /* 18px - リード文 */
--text-xl: 1.25rem;      /* 20px - 小見出し */
--text-2xl: 1.5rem;      /* 24px - セクション見出し */
--text-3xl: 1.875rem;    /* 30px - 中見出し */
--text-4xl: 2.25rem;     /* 36px - 大見出し */
--text-5xl: 3rem;        /* 48px - ヒーロー見出し */
--text-6xl: 3.75rem;     /* 60px - 特大見出し */
```

### フォントウェイト
```css
--font-light: 300;       /* 装飾的な大きいテキスト */
--font-normal: 400;      /* 本文 */
--font-medium: 500;      /* 強調テキスト */
--font-semibold: 600;    /* 見出し */
--font-bold: 700;        /* 強い強調 */
```

### 行間（Line Height）
```css
--leading-tight: 1.25;   /* 見出し */
--leading-normal: 1.5;   /* 短いテキスト */
--leading-relaxed: 1.75; /* 本文（読みやすさ重視） */
```

---

## 📐 スペーシング

### 基本単位
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### セクション間隔
- セクション間: `py-20` ~ `py-32` (80px ~ 128px)
- コンテンツ内: `gap-8` ~ `gap-12` (32px ~ 48px)
- 要素間: `gap-4` ~ `gap-6` (16px ~ 24px)

---

## 🔲 レイアウト

### コンテナ
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1400px;  /* メインコンテンツ最大幅 */
```

### グリッドシステム
```jsx
// 2カラム（モバイル1カラム）
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

// 3カラム（サービスカードなど）
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4カラム（小さいカードグリッド）
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
```

---

## 🎭 コンポーネントスタイル

### ボタン

#### プライマリボタン
```jsx
<button className="
  bg-sky-500 
  text-white 
  px-8 py-3 
  rounded-full 
  font-medium
  hover:bg-sky-600 
  transition-all duration-300
  shadow-lg shadow-sky-500/25
  hover:shadow-xl hover:shadow-sky-500/30
">
  お問い合わせ
</button>
```

#### セカンダリボタン
```jsx
<button className="
  bg-white 
  text-sky-500 
  px-8 py-3 
  rounded-full 
  font-medium
  border-2 border-sky-500
  hover:bg-sky-50 
  transition-all duration-300
">
  詳しく見る
</button>
```

#### テキストリンク
```jsx
<a className="
  text-sky-500 
  font-medium
  hover:text-sky-600
  transition-colors
  inline-flex items-center gap-2
  group
">
  詳しく見る
  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
</a>
```

### カード

#### 基本カード
```jsx
<div className="
  bg-white 
  rounded-2xl 
  p-6 md:p-8
  shadow-lg shadow-slate-200/50
  hover:shadow-xl hover:shadow-slate-200/60
  transition-all duration-300
  border border-slate-100
">
  {/* コンテンツ */}
</div>
```

#### 特徴カード（アイコン付き）
```jsx
<div className="
  bg-white 
  rounded-2xl 
  p-8
  shadow-lg shadow-slate-200/50
  hover:shadow-xl
  transition-all duration-300
  group
">
  <div className="
    w-16 h-16 
    bg-sky-100 
    rounded-2xl 
    flex items-center justify-center
    mb-6
    group-hover:bg-sky-500
    transition-colors duration-300
  ">
    <Icon className="w-8 h-8 text-sky-500 group-hover:text-white transition-colors" />
  </div>
  <h3 className="text-xl font-semibold text-slate-800 mb-3">タイトル</h3>
  <p className="text-slate-600 leading-relaxed">説明文</p>
</div>
```

#### ニュースカード
```jsx
<article className="
  flex flex-col md:flex-row
  gap-6
  p-4
  rounded-xl
  hover:bg-slate-50
  transition-colors
  group
">
  <div className="
    w-full md:w-48 
    aspect-video 
    rounded-lg 
    overflow-hidden
    flex-shrink-0
  ">
    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
  </div>
  <div className="flex flex-col justify-center">
    <span className="text-sky-500 text-sm font-medium mb-2">カテゴリ</span>
    <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">タイトル</h3>
    <time className="text-slate-500 text-sm">2025.01.01</time>
  </div>
</article>
```

---

## 🌊 装飾要素

### グラデーション背景
```jsx
// ヒーローセクション用グラデーション
<div className="
  bg-gradient-to-br 
  from-sky-50 
  via-white 
  to-sky-100/50
">

// アクセント用グラデーション
<div className="
  bg-gradient-to-r 
  from-sky-400 
  to-sky-600
">
```

### 波形・曲線装飾
```jsx
// SVG波形の例
<svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 120">
  <path 
    fill="#ffffff" 
    d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
  />
</svg>
```

### 抽象的な装飾パターン
```jsx
// ドット背景パターン
<div className="
  absolute inset-0 
  opacity-5
  bg-[radial-gradient(circle,#0ea5e9_1px,transparent_1px)]
  bg-[size:24px_24px]
">

// グラデーションオーブ（ぼかし円）
<div className="
  absolute 
  -top-40 -right-40 
  w-96 h-96 
  bg-sky-400/20 
  rounded-full 
  blur-3xl
">
```

---

## 📱 レスポンシブ設計

### ブレイクポイント
```css
sm: 640px   /* スマートフォン横向き */
md: 768px   /* タブレット */
lg: 1024px  /* 小型デスクトップ */
xl: 1280px  /* デスクトップ */
2xl: 1536px /* 大型デスクトップ */
```

### レスポンシブパターン
```jsx
// テキストサイズ
<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl">

// パディング
<section className="px-4 md:px-8 lg:px-12 py-16 md:py-24 lg:py-32">

// グリッド
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

---

## ✨ アニメーション

### トランジション基本設定
```css
--transition-fast: 150ms ease;
--transition-base: 300ms ease;
--transition-slow: 500ms ease;
```

### ホバーアニメーション
```jsx
// カードホバー
className="hover:-translate-y-1 hover:shadow-xl transition-all duration-300"

// ボタンホバー
className="hover:scale-105 transition-transform duration-200"

// リンクホバー
className="hover:text-sky-600 transition-colors duration-200"
```

### スクロールアニメーション（フェードイン）
```jsx
// Tailwind + カスタムCSS
<div className="
  opacity-0 
  translate-y-8 
  animate-fade-in-up
  [animation-delay:200ms]
">

// @keyframes定義
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(2rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.6s ease forwards;
}
```

---

## 📄 セクション構成パターン

### ヒーローセクション
```jsx
<section className="
  relative 
  min-h-screen 
  flex items-center
  bg-gradient-to-br from-sky-50 via-white to-sky-100/50
  overflow-hidden
">
  {/* 装飾要素 */}
  <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />
  
  <div className="container mx-auto px-4 md:px-8 relative z-10">
    <div className="max-w-3xl">
      <p className="text-sky-500 font-medium mb-4">サブタイトル</p>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-6">
        メインキャッチコピー
      </h1>
      <p className="text-lg text-slate-600 leading-relaxed mb-8">
        説明文
      </p>
      <button className="bg-sky-500 text-white px-8 py-4 rounded-full font-medium hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/25">
        CTAボタン
      </button>
    </div>
  </div>
</section>
```

### セクションヘッダー
```jsx
<div className="text-center mb-16">
  <p className="text-sky-500 text-sm font-medium tracking-wider uppercase mb-2">
    SECTION LABEL
  </p>
  <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
    セクションタイトル
  </h2>
  <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
    セクションの説明文をここに記載します。
  </p>
</div>
```

### CTAセクション
```jsx
<section className="bg-gradient-to-r from-sky-500 to-sky-600 py-20">
  <div className="container mx-auto px-4 text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
      お問い合わせ
    </h2>
    <p className="text-sky-100 mb-8 max-w-xl mx-auto">
      ご質問・ご相談はお気軽にどうぞ。
    </p>
    <button className="bg-white text-sky-600 px-8 py-4 rounded-full font-semibold hover:bg-sky-50 transition-all shadow-lg">
      お問い合わせはこちら
    </button>
  </div>
</section>
```

---

## 🚫 避けるべきスタイル

1. **過度な装飾**: 不要なシャドウ、ボーダー、グラデーションの重ね掛け
2. **色の乱用**: 5色以上の使用、彩度の高すぎる色の多用
3. **密集したレイアウト**: 余白不足、要素の詰め込みすぎ
4. **不統一なスタイル**: 角丸、シャドウ、フォントサイズの不統一
5. **重いアニメーション**: 過度なトランジション、ちらつくアニメーション

---

## ✅ デザインチェックリスト

- [ ] 配色は5色以内に収まっているか
- [ ] プライマリカラー（スカイブルー）が適切に使用されているか
- [ ] 十分な余白が確保されているか
- [ ] フォントサイズの階層が明確か
- [ ] ホバー・フォーカス状態が定義されているか
- [ ] モバイルファーストで設計されているか
- [ ] アクセシビリティ（コントラスト比、フォーカス表示）が考慮されているか

---

## 使用例プロンプト

Claude Codeに指示する際の例：

```
このデザインシステム（DESIGN_SYSTEM.md）に従って、
以下のページを作成してください：

- RealAIzeスタイルのスカイブルーをプライマリカラーとして使用
- クリーンでモダンな印象
- 十分な余白と読みやすいタイポグラフィ
- カードベースのレイアウト
- 控えめなホバーアニメーション
```

---

## Tailwind CSS設定

`tailwind.config.ts` に以下を追加することを推奨：

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease forwards",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(2rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
};

export default config;
```

---

*このデザインシステムは RealAIze (https://realaize.jp/) のビジュアルスタイルを参考に作成されました。*
