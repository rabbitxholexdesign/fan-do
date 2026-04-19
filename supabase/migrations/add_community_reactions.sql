-- サロン投稿へのいいねテーブル
CREATE TABLE IF NOT EXISTS community_reactions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id       uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type text NOT NULL DEFAULT 'like',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS community_reactions_post_id_idx ON community_reactions(post_id);

ALTER TABLE community_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_reactions"
  ON community_reactions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "users_insert_own_reactions"
  ON community_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_reactions"
  ON community_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- サロン投稿へのコメントテーブル
CREATE TABLE IF NOT EXISTS community_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text NOT NULL CHECK (char_length(content) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS community_comments_post_id_idx ON community_comments(post_id);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_comments"
  ON community_comments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "users_insert_own_comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "users_delete_own_comments"
  ON community_comments FOR DELETE
  USING (auth.uid() = author_id);

-- オペレーター（タレント）も投稿を削除可能にするためのポリシーは
-- RLSではタレントIDを参照できないため、アプリ側で制御する
