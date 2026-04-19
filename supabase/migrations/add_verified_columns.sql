-- bank_accounts と legal_notices に verified 列を追加
-- 管理者が口座情報・特定商取引法情報を確認済みにするためのフラグ

ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT NULL;

ALTER TABLE legal_notices
  ADD COLUMN IF NOT EXISTS verified boolean DEFAULT NULL;

COMMENT ON COLUMN bank_accounts.verified IS 'NULL=未確認, true=確認済み, false=要確認';
COMMENT ON COLUMN legal_notices.verified IS 'NULL=未確認, true=確認済み, false=要確認';
