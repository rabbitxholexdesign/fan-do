# fan℃ 実装計画

作成日: 2026-04-19
最終更新: 2026-04-19

---

## 実装フェーズ概要

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase A | 支援プラン管理（ダッシュボード） | ✅ 完了 |
| Phase B | マイページ各ページのDB連携 | ✅ 完了 |
| Phase C | サロン機能（旧コミュニティ） | ✅ 完了 |
| Phase D | Stripe連携（実決済フロー） | ✅ 完了（キー設定後に全機能有効） |
| Phase E | 管理者機能・法的ページ・その他 | ✅ 完了 |

---

## Phase A: 支援プラン管理（ダッシュボード）

### A-1. ダッシュボード サポーター一覧 DB連携
- **ファイル**: `app/(dashboard)/dashboard/supporters/page.tsx`
- **状態**: [x] 完了（Supabase `subscriptions` テーブルから取得、検索・プランフィルター付き）

### A-2. 支援プラン一覧ページ
- **ファイル**: `app/(dashboard)/dashboard/plans/page.tsx`
- **状態**: [x] 完了（公開/非公開切り替え・削除・新規作成リンク付き）

### A-3. 支援プラン作成・編集フォーム
- **ファイル**: `app/(dashboard)/dashboard/plans/new/page.tsx`
- **状態**: [x] 完了（`support_plans` テーブルへ INSERT）

### A-4. 活動報告 投稿機能 DB連携
- **ファイル**: `app/(dashboard)/dashboard/reports/new/page.tsx`
- **状態**: [x] 完了（`reports` テーブルへ INSERT）

### A-5. 活動報告 一覧 DB連携
- **ファイル**: `app/(dashboard)/dashboard/reports/page.tsx`
- **状態**: [x] 完了（`reports` テーブルから取得・削除機能付き）

### A-6. 収益・出金ページ DB連携
- **ファイル**: `app/(dashboard)/dashboard/revenue/page.tsx`
- **状態**: [x] 完了（`support_plans` から月次収益計算・プラン別内訳表示）

### A-7. ダッシュボード サイドバーに「プラン管理」メニュー追加
- **ファイル**: `components/dashboard-sidebar.tsx`
- **状態**: [x] 完了（`/dashboard/plans` へのリンク追加済み）

---

## Phase B: マイページ DB連携

### B-1. 支援中プラン一覧 DB連携
- **ファイル**: `app/(user)/mypage/subscriptions/page.tsx`
- **状態**: [x] 完了（`subscriptions + support_plans + talents` から取得、解約ボタンUI付き）

### B-2. fan℃履歴ページ DB連携
- **ファイル**: `app/(user)/mypage/history/page.tsx`
- **状態**: [x] 完了（`fanc_scores` テーブルから取得・トータルスコア・獲得履歴表示）

### B-3. お気に入りページ DB連携
- **ファイル**: `app/(user)/mypage/favorites/page.tsx`
- **マイグレーション**: `supabase/migrations/add_talent_favorites.sql`（実行済み）
- **状態**: [x] 完了（`talent_favorites` テーブル、タレント詳細ページにハートボタン追加）

### B-4. 通知ページ
- **ファイル**: `app/(user)/mypage/notifications/page.tsx`
- **現状**: 通知設定UI（メール・プッシュ通知のOn/Off）のみ実装済み
- **未実装**: `notifications` テーブルからの実際の通知一覧表示
- **状態**: [ ] 部分実装（通知一覧のDB連携は未着手）

### B-5. 支払い履歴
- **ファイル**: `app/(user)/mypage/billing/page.tsx`
- **API**: `app/api/billing/portal/route.ts`
- **状態**: [x] 完了（サブスク一覧・月額合計・Stripe Customer Portalへのリンク）

---

## Phase C: サロン機能（旧コミュニティ）

### C-0. 「コミュニティ」→「サロン」リネーム
- **状態**: [x] 完了（UI表示・URL・ファイル名変更済み）

### C-1. サロン タイムライン（公開側）
- **ファイル**: `app/community/[talentId]/page.tsx`
- **状態**: [x] 完了

### C-2. サロン グループチャット
- **ファイル**: `app/community/[talentId]/chat/page.tsx`
- **マイグレーション**: `supabase/migrations/add_community_messages.sql`（要実行）
- **注記**: Supabase Dashboard で `community_messages` テーブルの Realtime 有効化が必要
- **状態**: [x] 完了

### C-3. サロン 限定コンテンツ一覧
- **ファイル**: `app/community/[talentId]/content/page.tsx`
- **状態**: [x] 完了

### C-3b. サロン ファン一覧
- **ファイル**: `app/community/[talentId]/fans/page.tsx`
- **注記**: 旧 `/members` から `/fans` にリネーム済み
- **状態**: [x] 完了

### C-4. ダッシュボード サロン管理 DB連携
- **ファイル**: `app/(dashboard)/dashboard/salon/page.tsx`
- **状態**: [x] 完了

---

## Phase D: Stripe連携

### D-1. 支援プラン申し込みページ DB連携
- **ファイル**: `app/talents/[id]/support/page.tsx`
- **状態**: [x] 完了

### D-2. Stripe Checkout 連携
- **ファイル**: `app/api/checkout/route.ts`
- **状態**: [x] 完了（Stripeキー設定後に有効化）

### D-2b. Stripe 決済成功後リダイレクト
- **ファイル**: `app/talents/[id]/support/success/page.tsx`
- **状態**: [x] 完了

### D-3. Stripeウェブフック処理
- **ファイル**: `app/api/webhooks/stripe/route.ts`
- **状態**: [x] 完了（Stripeキー設定後に有効化）

### D-3b. DBマイグレーション（Stripe連携用）
- **ファイル**: `supabase/migrations/add_stripe_columns.sql`
- **状態**: [x] 完了（Supabaseで実行済み）

### D-4. マイページ 支払い履歴
- **ファイル**: `app/(user)/mypage/billing/page.tsx`
- **API**: `app/api/billing/portal/route.ts`
- **状態**: [x] 完了

---

## Phase E: 管理者機能・法的ページ・その他

### E-1. パスワードリセットページ
- **ファイル**: `app/(auth)/reset-password/page.tsx` + `confirm/page.tsx`
- **状態**: [x] 完了

### E-2. 管理者 KYC専用審査画面
- **ファイル**: `app/(admin)/admin/applications/[id]/kyc/page.tsx`
- **状態**: [x] 完了

### E-3. 管理者 振込先口座確認ページ
- **ファイル**: `app/(admin)/admin/applications/[id]/bank/page.tsx`
- **マイグレーション**: `supabase/migrations/add_verified_columns.sql`（実行済み）
- **状態**: [x] 完了

### E-4. 管理者 特定商取引法確認ページ
- **ファイル**: `app/(admin)/admin/applications/[id]/legal/page.tsx`
- **状態**: [x] 完了

### E-5. 管理者 最終承認ページ
- **ファイル**: `app/(admin)/admin/applications/[id]/approve/page.tsx`
- **内容**: KYC・口座・法的情報の全項目確認済み時のみ承認ボタン有効化
- **状態**: [x] 完了

### E-6. 管理者 監査ログページ
- **ファイル**: `app/(admin)/admin/audit-log/page.tsx`
- **状態**: [x] 完了

### E-7. タレント詳細ページ サロンタブ・お気に入りボタン
- **ファイル**: `app/talents/[id]/page.tsx`
- **状態**: [x] 完了

### E-8. 利用規約・プライバシーポリシーページ
- **ファイル**: `app/terms/page.tsx` / `app/privacy/page.tsx` / `app/legal/commerce/page.tsx`
- **状態**: [x] 完了

### E-9. タレント別 特定商取引法ページ DB連携
- **ファイル**: `app/talents/[id]/legal/page.tsx`
- **状態**: [x] 完了（`legal_notices` + `support_plans` テーブルから取得）

---

## 未実装・優先度低

| 機能 | 説明 | 備考 |
|------|------|------|
| 通知一覧DB連携 | `notifications` テーブルから実際の通知を表示 | テーブル設計が必要 |
| 投稿へのリアクション | サロン投稿へのいいね・コメント機能 | `community_reactions` テーブルが必要 |
| 地域別ページ | `/region/[prefectureId]` など | 要件定義 REG-01〜03 |
| 買い切りプラン | `billing_cycle: "onetime"` の決済フロー | PLAN-11 |

---

## 技術メモ

- DBテーブル名 `community_posts` `community_messages` はそのまま使用（UI表示だけサロンに変更）
- Stripe連携はAPIキーが必要（`.env.local` に `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`）
- Supabase Realtime はチャット機能で使用（`community_messages`テーブルの Realtime 有効化が必要）

## マイグレーション実行状況

| ファイル | 内容 | 実行状況 |
|--------|------|---------|
| `add_community_messages.sql` | コミュニティチャットテーブル | ✅ 実行済み |
| `add_stripe_columns.sql` | Stripe連携カラム・トリガー | ✅ 実行済み |
| `add_talent_favorites.sql` | お気に入りテーブル | ✅ 実行済み |
| `add_verified_columns.sql` | 口座・法的情報の確認済みフラグ | ✅ 実行済み |
| `add_community_reactions.sql` | いいね・コメントテーブル | ✅ 実行済み |
| `add_notifications.sql` | 通知テーブル | ✅ 実行済み |
