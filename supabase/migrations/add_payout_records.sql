-- 振込処理履歴テーブル
CREATE TABLE IF NOT EXISTS payout_records (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id       uuid NOT NULL REFERENCES talents(id) ON DELETE CASCADE,
  amount          integer NOT NULL,           -- 振込金額（円）
  fee_amount      integer NOT NULL,           -- プラットフォーム手数料（円）
  gross_amount    integer NOT NULL,           -- 総売上（円）
  period_month    text NOT NULL,              -- 対象月 例: "2026-04"
  bank_snapshot   jsonb NOT NULL,             -- 振込時の口座情報スナップショット
  note            text,
  processed_by    uuid REFERENCES auth.users(id),
  processed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payout_records_talent_idx ON payout_records(talent_id);
CREATE INDEX IF NOT EXISTS payout_records_period_idx ON payout_records(period_month);

-- RLS
ALTER TABLE payout_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_payout_records"
  ON payout_records FOR ALL
  USING (public.is_admin());
