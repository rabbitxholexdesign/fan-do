-- ============================================================
-- fan℃ Seed Data
-- Run AFTER schema.sql
-- Note: user IDs must be real auth.users UUIDs.
--       Replace the placeholder UUIDs below after creating
--       test accounts via the app or Supabase Auth dashboard.
-- ============================================================

-- ============================================================
-- Talents (no operator_id required for initial seeding —
-- update operator_id to a real user UUID before running)
-- ============================================================

-- Placeholder operator UUID — replace with a real user ID
do $$
declare
  op_id uuid := '83a786a1-87a8-4f1b-829d-bc51bd7da02d'; -- replace!
begin

insert into public.talents
  (id, operator_id, name, slug, category, tags, prefecture, city, description, status, fanc_score, supporter_count, published_at)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    op_id,
    'みちのく農園 佐藤さん',
    'michinoku-farm-sato',
    'hito',
    ARRAY['農業', '有機野菜', '東北'],
    '岩手県', '花巻市',
    '岩手の大地で無農薬野菜を育てて20年。旬の野菜セットを毎月お届けします。',
    'active', 9800, 312,
    now() - interval '6 months'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    op_id,
    '波佐見焼 大河内窯',
    'hasami-okochi-kiln',
    'mono',
    ARRAY['陶芸', '波佐見焼', '長崎'],
    '長崎県', '波佐見町',
    '400年続く波佐見焼の伝統を守りながら、現代の暮らしに寄り添う器を作っています。',
    'active', 8400, 247,
    now() - interval '5 months'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    op_id,
    '阿波踊り 紅燈籠連',
    'awa-odori-benicho',
    'koto',
    ARRAY['伝統芸能', '阿波踊り', '徳島'],
    '徳島県', '徳島市',
    '徳島を代表する阿波踊りの連。全国の舞台で400年の伝統を現代に繋ぎます。',
    'active', 7200, 189,
    now() - interval '4 months'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000004',
    op_id,
    '田中茶園',
    'tanaka-tea-garden',
    'mono',
    ARRAY['農業', 'お茶', '静岡'],
    '静岡県', '掛川市',
    '三代続く茶農家。一番茶から三番茶まで、それぞれの旨みを丁寧に引き出します。',
    'active', 6500, 156,
    now() - interval '3 months'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000005',
    op_id,
    '島原漆師組合',
    'shimabara-urushi',
    'hito',
    ARRAY['伝統工芸', '漆器', '長崎'],
    '長崎県', '島原市',
    '島原半島に残る漆師の技を次世代へ。体験ワークショップも定期開催中。',
    'active', 5800, 134,
    now() - interval '2 months'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000006',
    op_id,
    '長崎地域活性NPO',
    'nagasaki-chiiki-npo',
    'koto',
    ARRAY['地域振興', 'NPO', '長崎'],
    '長崎県', '長崎市',
    '長崎の離島・過疎地域を元気にするための活動を行うNPO法人です。',
    'active', 4200, 98,
    now() - interval '1 month'
  );

-- ============================================================
-- Support Plans
-- ============================================================

insert into public.support_plans
  (talent_id, name, description, price, billing_cycle, fanc_bonus, benefits)
values
  -- みちのく農園
  ('aaaaaaaa-0000-0000-0000-000000000001', 'ライト応援', '活動レポートを毎月お届け', 500, 'monthly', 100,
   '["月次活動レポート", "コミュニティ参加権"]'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'スタンダード応援', '旬の野菜セット（小）毎月発送', 1500, 'monthly', 350,
   '["月次活動レポート", "旬の野菜セット（小）", "コミュニティ参加権", "限定動画"]'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'プレミアム応援', '旬の野菜セット（大）毎月発送', 5000, 'monthly', 1200,
   '["月次活動レポート", "旬の野菜セット（大）", "コミュニティ参加権", "限定動画", "農園訪問ツアー優先"]'),

  -- 波佐見焼
  ('aaaaaaaa-0000-0000-0000-000000000002', 'ライト応援', '制作プロセスのレポートをお届け', 500, 'monthly', 100,
   '["制作レポート", "コミュニティ参加権"]'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'スタンダード応援', '年4回、季節の器をお届け', 2000, 'monthly', 500,
   '["制作レポート", "季節の器（年4回）", "コミュニティ参加権"]'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'プレミアム応援', '陶芸体験＋オリジナル器制作', 8000, 'monthly', 2000,
   '["制作レポート", "陶芸体験チケット（年2回）", "オリジナル器制作", "コミュニティ参加権"]');

-- ============================================================
-- Legal Notices
-- ============================================================

insert into public.legal_notices
  (talent_id, seller_name, representative_name, address, phone, email,
   payment_methods, billing_timing, delivery_timing, cancel_policy, environment)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '佐藤 太郎', '佐藤 太郎',
    '※個人のため住所の公開を省略しています。請求があれば遅滞なく開示します。',
    'お問い合わせフォームよりご連絡ください',
    'contact@michinoku-farm.example.com',
    'クレジットカード（Visa, Mastercard, JCB, American Express）',
    'お申し込み日を基準に毎月同日に課金されます',
    '決済確認後即時（コミュニティアクセス）。物品については毎月末発送。',
    'いつでも解約可能です。解約手続きは翌月の請求が発生する前日23:59までに完了した場合、翌月からの課金が停止されます。すでに課金された期間分の返金は行いません。',
    '最新版のブラウザ（Chrome, Safari, Firefox, Edge）でご利用いただけます'
  );

end $$;
