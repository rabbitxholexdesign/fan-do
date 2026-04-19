# fan℃ テスト仕様書

作成日: 2026-04-20  
対象バージョン: Phase A〜E + 追加修正済み実装

---

## テスト凡例

| 記号 | 意味 |
|------|------|
| TC | テストケース番号 |
| 前提 | テスト実施前の状態 |
| 手順 | 操作ステップ |
| 期待結果 | 正常時の出力・画面表示 |

---

## 1. 認証（AUTH）

### TC-AUTH-01: 新規ユーザー登録
- **前提**: 未ログイン状態
- **手順**:
  1. `/signup` にアクセス
  2. メールアドレス・パスワードを入力し「登録する」をクリック
- **期待結果**: 確認メールが送信され「確認メールを送信しました」と表示される

### TC-AUTH-02: ログイン（正常）
- **前提**: 登録済みアカウントあり
- **手順**:
  1. `/login` でメールアドレス・パスワードを入力
  2. 「ログイン」をクリック
- **期待結果**: `/mypage` へリダイレクトされる

### TC-AUTH-03: ログイン（誤パスワード）
- **前提**: 未ログイン状態
- **手順**: 誤パスワードで「ログイン」をクリック
- **期待結果**: エラーメッセージが表示され画面遷移しない

### TC-AUTH-04: パスワードリセット
- **前提**: 未ログイン状態
- **手順**:
  1. `/reset-password` でメールアドレスを入力し送信
  2. 届いたメールのリンクをクリック
  3. `/reset-password/confirm` で新パスワードを入力
- **期待結果**: パスワードが変更され `/login` にリダイレクト

### TC-AUTH-05: ログアウト
- **前提**: ログイン済み
- **手順**: ヘッダー or サイドバーの「ログアウト」をクリック
- **期待結果**: セッションが破棄され `/login` へリダイレクト

### TC-AUTH-06: 未認証ページアクセス
- **前提**: 未ログイン状態
- **手順**: `/mypage` `/dashboard` `/admin` に直接アクセス
- **期待結果**: それぞれ `/login` へリダイレクトされる

---

## 2. 公開ページ（PUBLIC）

### TC-PUB-01: トップページ表示
- **手順**: `/` にアクセス
- **期待結果**: ヒーロー・特集タレントセクションが表示される

### TC-PUB-02: タレント一覧ページ
- **手順**: `/talents` にアクセス
- **期待結果**: `status = "active"` のタレントのみ表示される

### TC-PUB-03: タレント一覧 検索・フィルター
- **手順**: キーワード入力 or 都道府県選択
- **期待結果**: 条件に合致するタレントのみ絞り込まれる

### TC-PUB-04: タレント詳細ページ
- **手順**: `/talents/[id]` にアクセス（activeなタレントIDを使用）
- **期待結果**: タレント情報・プラン一覧・サロンタブ・お気に入りボタンが表示される

### TC-PUB-05: 非公開タレントの直接アクセス
- **手順**: `status ≠ "active"` のタレントIDで `/talents/[id]` にアクセス
- **期待結果**: 404ページが表示される

### TC-PUB-06: お気に入りボタン（未ログイン）
- **前提**: 未ログイン
- **手順**: タレント詳細のハートボタンをクリック
- **期待結果**: ログインページへリダイレクトされる

### TC-PUB-07: お気に入りボタン（ログイン済み）
- **前提**: ログイン済み
- **手順**: ハートボタンをクリック → 再度クリック
- **期待結果**: 1回目: ハートが塗りつぶされる、2回目: 空に戻る

### TC-PUB-08: 地域ページ一覧
- **手順**: `/region` にアクセス
- **期待結果**: 都道府県グループ一覧が表示され、タレント数0の都道府県はリンク無効

### TC-PUB-09: 都道府県別タレント一覧
- **手順**: タレント数が1以上の都道府県カードをクリック
- **期待結果**: `/region/[都道府県名]` が開き、該当タレントが表示される

### TC-PUB-10: 存在しない都道府県URL
- **手順**: `/region/存在しない都道府県` にアクセス
- **期待結果**: 404ページが表示される

### TC-PUB-11: 利用規約・プライバシーポリシー
- **手順**: `/terms` `/privacy` `/legal/commerce` にアクセス
- **期待結果**: 各ページのコンテンツが表示される

### TC-PUB-12: タレント別特定商取引法ページ
- **手順**: `/talents/[id]/legal` にアクセス
- **期待結果**: `legal_notices` のデータとプラン一覧が表示される

---

## 3. 支援プラン申し込み・Stripe決済（PAYMENT）

### TC-PAY-01: 支援プラン選択ページ表示
- **前提**: ログイン済み・対象タレントのサポーターでない
- **手順**: `/talents/[id]/support` にアクセス
- **期待結果**: activeなプラン一覧が表示される

### TC-PAY-02: Stripeチェックアウト遷移（サブスク）
- **前提**: Stripeテストキー設定済み・ログイン済み
- **手順**: 月額プランを選択し「Stripeで申し込む」をクリック
- **期待結果**: Stripe Checkoutページ（テストモード）に遷移する

### TC-PAY-03: Stripeチェックアウト遷移（買い切り）
- **手順**: `billing_cycle = "onetime"` のプランで申し込み
- **期待結果**: Stripe Checkoutページ（payment mode）に遷移する

### TC-PAY-04: テスト決済 成功
- **前提**: Stripe CLIでWebhookリスニング中
- **手順**: テストカード `4242 4242 4242 4242` で決済完了
- **期待結果**:
  - `/talents/[id]/support/success` に遷移し成功メッセージ表示
  - `subscriptions` テーブルにレコード追加（status: active）
  - `fanc_scores` にボーナスポイントが記録される

### TC-PAY-05: 既存サポーターの再申し込みブロック
- **前提**: すでに対象タレントのアクティブサポーター
- **手順**: `/talents/[id]/support` で申し込みボタンをクリック
- **期待結果**: 「すでにサロンに参加しています」エラーが表示される

### TC-PAY-06: Webhook署名検証失敗
- **手順**: `/api/webhooks/stripe` に不正な署名でPOSTリクエスト
- **期待結果**: 400エラーが返る

---

## 4. マイページ（MYPAGE）

### TC-MY-01: マイページ ホーム
- **前提**: ログイン済み
- **手順**: `/mypage` にアクセス
- **期待結果**: プロフィール情報・fan℃スコア・応援中タレント数が表示される

### TC-MY-02: 支援中プラン一覧
- **手順**: `/mypage/subscriptions` にアクセス
- **期待結果**: `subscriptions` テーブルのアクティブなプランが表示される

### TC-MY-03: プラン解約ボタン
- **手順**: 「解約する」ボタンをクリック
- **期待結果**: 確認ダイアログが表示され、承認後 Stripe Customer Portal へ誘導される（またはステータス更新）

### TC-MY-04: fan℃履歴
- **手順**: `/mypage/fanc-history` にアクセス
- **期待結果**: `fanc_scores` の履歴一覧・トータルスコアが表示される

### TC-MY-05: /mypage/history リダイレクト
- **手順**: `/mypage/history` に直接アクセス
- **期待結果**: `/mypage/fanc-history` へ自動リダイレクト

### TC-MY-06: お気に入り一覧
- **手順**: `/mypage/favorites` にアクセス
- **期待結果**: ハートを押したタレントの一覧が表示される

### TC-MY-07: 通知 受信トレイ
- **手順**: `/mypage/notifications` にアクセス
- **期待結果**: `notifications` テーブルのユーザー宛通知が新着順に表示される

### TC-MY-08: 通知 既読化
- **手順**: 未読通知をクリック
- **期待結果**: `is_read = true` に更新され、バッジ数が減る

### TC-MY-09: 全通知既読
- **手順**: 「すべて既読にする」ボタンをクリック
- **期待結果**: すべての通知が既読になる

### TC-MY-10: 支払い履歴
- **手順**: `/mypage/billing` にアクセス
- **期待結果**: アクティブなサブスク一覧・月額合計・Customer Portalリンクが表示される

### TC-MY-11: プロフィール編集
- **手順**: `/mypage/profile` で表示名を変更し保存
- **期待結果**: `users` テーブルが更新され、変更後の名前が反映される

### TC-MY-12: fan℃バッジ・ランク表示
- **手順**: `/mypage/badges` にアクセス
- **期待結果**: トータルスコアに応じたランク（ブロンズ/シルバー/ゴールド）と獲得済みバッジが表示される

### TC-MY-13: バッジ未獲得状態の表示
- **前提**: まだサブスクなし・スコア0のユーザー
- **期待結果**: 「まだバッジを獲得していません」と表示され、全バッジが未獲得扱い

---

## 5. サロン（SALON）

### TC-SAL-01: サロン タイムライン表示
- **前提**: ログイン済み・対象タレントのアクティブサポーター
- **手順**: `/community/[talentId]` にアクセス
- **期待結果**: `community_posts` の投稿が表示される

### TC-SAL-02: 非サポーターのサロンアクセス
- **前提**: ログイン済みだが対象タレントのサポーターでない
- **手順**: `/community/[talentId]` にアクセス
- **期待結果**: 「サポーターのみアクセス可」の表示 or ロック画面が表示される

### TC-SAL-03: 投稿へのいいね
- **手順**: 投稿のハートボタンをクリック
- **期待結果**: `community_reactions` にレコードが挿入され、カウントが1増える

### TC-SAL-04: いいね取り消し
- **手順**: すでにいいね済みのハートボタンをクリック
- **期待結果**: `community_reactions` からレコードが削除され、カウントが1減る

### TC-SAL-05: コメント表示
- **手順**: 「コメントを見る」をクリック
- **期待結果**: `community_comments` からコメントが遅延ロードされる

### TC-SAL-06: コメント投稿
- **手順**: コメント入力欄にテキストを入力し Enter or 送信ボタン
- **期待結果**: `community_comments` にレコードが挿入され、一覧に追加される

### TC-SAL-07: グループチャット
- **手順**: `/community/[talentId]/chat` にアクセスしメッセージ送信
- **期待結果**: Supabase Realtimeで全サポーターにリアルタイム表示される

### TC-SAL-08: 限定コンテンツ一覧
- **手順**: `/community/[talentId]/content` にアクセス
- **期待結果**: `community_posts` の限定コンテンツが表示される

### TC-SAL-09: ファン一覧
- **手順**: `/community/[talentId]/fans` にアクセス
- **期待結果**: `subscriptions` から対象タレントのアクティブサポーター一覧が表示される

---

## 6. タレントダッシュボード（DASHBOARD）

### TC-DASH-01: ダッシュボードホーム
- **前提**: タレントとして登録済み（status: active）でログイン
- **手順**: `/dashboard` にアクセス
- **期待結果**: 月間収益・サポーター数・fan℃スコアのサマリーが表示される

### TC-DASH-02: サポーター一覧
- **手順**: `/dashboard/supporters` にアクセス
- **期待結果**: `subscriptions` から該当タレントのサポーター一覧が検索・プランフィルター付きで表示される

### TC-DASH-03: プラン一覧
- **手順**: `/dashboard/plans` にアクセス
- **期待結果**: `support_plans` から該当タレントのプランが表示され、公開/非公開切り替えが可能

### TC-DASH-04: プラン新規作成
- **手順**: `/dashboard/plans/new` でフォームを入力し送信
- **期待結果**: `support_plans` にレコードが INSERT される

### TC-DASH-05: 活動報告 投稿
- **手順**: `/dashboard/reports/new` でフォームを入力し投稿
- **期待結果**: `reports` テーブルに INSERT され、一覧に表示される

### TC-DASH-06: 活動報告 削除
- **手順**: 活動報告一覧の「削除」をクリック
- **期待結果**: `reports` テーブルから削除される

### TC-DASH-07: 収益・出金ページ
- **手順**: `/dashboard/revenue` にアクセス
- **期待結果**: 月次収益・プラン別内訳が `support_plans` + `subscriptions` から計算され表示される

### TC-DASH-08: アナリティクス
- **手順**: `/dashboard/analytics` にアクセス
- **期待結果**: サポーター推移・収益グラフが表示される

### TC-DASH-09: サロン管理
- **手順**: `/dashboard/salon` にアクセス
- **期待結果**: サロン設定・投稿管理UIが表示される

### TC-DASH-10: お知らせ配信
- **前提**: `SUPABASE_SERVICE_ROLE_KEY` が `.env.local` に設定済み
- **手順**:
  1. `/dashboard/announcements` にアクセス
  2. タイトル・本文を入力し「〇名に送信する」をクリック
- **期待結果**: アクティブサポーター全員の `notifications` テーブルに type=news のレコードが挿入される

### TC-DASH-11: お知らせ配信（サポーター0人）
- **前提**: アクティブサポーターが0人
- **期待結果**: 送信ボタンが無効化され「サポーターがいません」と表示される

### TC-DASH-12: 設定ページ
- **手順**: `/dashboard/settings` にアクセス
- **期待結果**: タレントプロフィール編集フォームが表示される

---

## 7. タレント登録審査フロー（REGISTRATION）

### TC-REG-01: タレント登録申請
- **前提**: ログイン済みユーザー（タレント未登録）
- **手順**: `/talent-register` でフォームを入力し申請
- **期待結果**: `talents` テーブルに status=`pending_review` で登録される

### TC-REG-02: 管理者 申請一覧表示
- **前提**: 管理者権限でログイン
- **手順**: `/admin/applications` にアクセス
- **期待結果**: pending_review / pending_kyc / pending_final の申請がタブ別に表示される

### TC-REG-03: 管理者 KYC審査
- **手順**: `/admin/applications/[id]/kyc` にアクセスし「承認」をクリック
- **期待結果**: `talents.status` が `pending_kyc` → `pending_final` に更新される

### TC-REG-04: 管理者 銀行口座確認
- **手順**: `/admin/applications/[id]/bank` にアクセスし「確認済み」をクリック
- **期待結果**: `bank_accounts.verified = true` に更新され、監査ログに記録される

### TC-REG-05: 管理者 特商法確認
- **手順**: `/admin/applications/[id]/legal` にアクセスし「確認済み」をクリック
- **期待結果**: `legal_notices.verified = true` に更新される

### TC-REG-06: 管理者 最終承認（条件満たす）
- **前提**: KYC・口座・法的情報がすべて確認済み
- **手順**: `/admin/applications/[id]/approve` で「承認・公開」をクリック
- **期待結果**: `talents.status = "active"` に更新され、タレントが公開される

### TC-REG-07: 管理者 最終承認（条件未満）
- **前提**: KYC・口座・法的情報のいずれかが未確認
- **期待結果**: 「承認・公開」ボタンが無効化されている

### TC-REG-08: 管理者 審査却下
- **手順**: 申請詳細で「却下」をクリック
- **期待結果**: `talents.status = "rejected"` に更新される

---

## 8. 管理者機能（ADMIN）

### TC-ADM-01: 管理者ダッシュボード
- **前提**: 管理者権限（`users.role = "admin"`）でログイン
- **手順**: `/admin` にアクセス
- **期待結果**: 管理者向けサマリーが表示される

### TC-ADM-02: 非管理者ユーザーのアクセス拒否
- **前提**: 一般ユーザーでログイン
- **手順**: `/admin` に直接アクセス
- **期待結果**: 403 or ホームへリダイレクト

### TC-ADM-03: タレント一覧
- **手順**: `/admin/talents` にアクセス
- **期待結果**: 全ステータスのタレント一覧が表示される

### TC-ADM-04: ユーザー一覧
- **手順**: `/admin/users` にアクセス
- **期待結果**: 全ユーザーの一覧が表示される

### TC-ADM-05: 支払い一覧
- **手順**: `/admin/payments` にアクセス
- **期待結果**: `subscriptions` テーブルの決済情報一覧が表示される

### TC-ADM-06: 監査ログ
- **手順**: `/admin/audit-log` にアクセス
- **期待結果**: 管理者操作の履歴が新着順に表示される

### TC-ADM-07: レポート・レビュー
- **手順**: `/admin/reports` `/admin/reviews` にアクセス
- **期待結果**: 通報・レビュー一覧が表示される

---

## 9. Stripe Webhook（WEBHOOK）

### TC-WH-01: checkout.session.completed（サブスク）
- **手順**: Stripe CLIで `checkout.session.completed` イベントを送信（mode: subscription）
- **期待結果**:
  - `subscriptions` に status=active のレコードが UPSERT される
  - `fanc_scores` にボーナスが記録される

### TC-WH-02: checkout.session.completed（買い切り）
- **手順**: `checkout.session.completed` イベント（mode: payment）を送信
- **期待結果**:
  - `subscriptions` に `stripe_subscription_id = payment_intent_id`, `current_period_end = null` で UPSERT

### TC-WH-03: customer.subscription.updated
- **手順**: `customer.subscription.updated` イベントを送信
- **期待結果**: `subscriptions.status` と期間が更新される

### TC-WH-04: customer.subscription.deleted
- **手順**: `customer.subscription.deleted` イベントを送信
- **期待結果**: `subscriptions.status = "cancelled"` に更新される

---

## 10. セキュリティ（SECURITY）

### TC-SEC-01: RLS 他ユーザーデータへのアクセス
- **手順**: 別ユーザーのIDを指定してSupabaseクライアントから `fanc_scores` を取得
- **期待結果**: データが返らない（RLSによるブロック）

### TC-SEC-02: 未認証API呼び出し
- **手順**: セッションなしで `/api/checkout` `/api/announcements` にPOSTリクエスト
- **期待結果**: 401エラーが返る

### TC-SEC-03: 他タレントへのお知らせ配信試行
- **手順**: 自分が所有しない `talentId` で `/api/announcements` にPOST
- **期待結果**: 404エラーが返る

### TC-SEC-04: Stripeキー未設定時の動作
- **前提**: `.env.local` の `STRIPE_SECRET_KEY` を未設定
- **手順**: 支援申し込みフォームから申し込み
- **期待結果**: 503エラーと設定ガイドメッセージが表示される

---

## 11. レスポンシブ・UI

### TC-UI-01: モバイル表示（スマートフォン）
- **手順**: 幅375px（iPhone SE相当）でトップ・タレント詳細・マイページをチェック
- **期待結果**: レイアウト崩れなく表示され、ボトムナビが機能する

### TC-UI-02: ダッシュボード モバイルヘッダー
- **手順**: `/dashboard` をスマートフォン幅で表示
- **期待結果**: ハンバーガー/ドロップダウンでタレント切り替えが可能

### TC-UI-03: ダークモード（OS設定）
- **手順**: OSをダークモードに設定しアクセス
- **期待結果**: カラーテーマが変わり文字・背景が読みやすい状態を維持

---

## 12. 環境設定チェックリスト（初回デプロイ前）

| 項目 | 確認内容 |
|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key（お知らせ配信に必須） |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー（本番: sk_live_...） |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開キー |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook シークレット |
| `NEXT_PUBLIC_SITE_URL` | 本番ドメイン（例: https://fanc.example.com） |
| Supabase Realtime | `community_messages` テーブルのRealtime有効化 |
| Stripe Webhook endpoint | `/api/webhooks/stripe` を Stripe ダッシュボードに登録 |

---

## 13. テストデータ作成手順

```sql
-- テスト用タレント（Supabase SQLエディタで実行）
INSERT INTO talents (user_id, name, prefecture, category, status)
VALUES ('<your-user-id>', 'テストタレント', '東京都', 'singer', 'active');

-- テスト用プラン
INSERT INTO support_plans (talent_id, name, price, billing_cycle, description, fanc_bonus, is_active)
VALUES ('<talent-id>', 'ベーシックプラン', 980, 'monthly', 'テスト用', 100, true);

-- テスト用サブスクリプション
INSERT INTO subscriptions (fan_id, talent_id, plan_id, status, stripe_subscription_id)
VALUES ('<fan-user-id>', '<talent-id>', '<plan-id>', 'active', 'test_sub_xxx');
```

---

*このテスト仕様書は実装フェーズ A〜E および追加修正（fan℃履歴URL修正・お知らせ配信・バッジDB連携）を対象としています。*
