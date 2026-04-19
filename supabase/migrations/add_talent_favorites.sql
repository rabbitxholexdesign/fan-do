-- ============================================================
-- Migration: talent_favorites テーブル追加
-- ============================================================

create table if not exists public.talent_favorites (
  id         uuid primary key default uuid_generate_v4(),
  fan_id     uuid not null references public.users(id) on delete cascade,
  talent_id  uuid not null references public.talents(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (fan_id, talent_id)
);

create index if not exists talent_favorites_fan_idx  on public.talent_favorites(fan_id);
create index if not exists talent_favorites_talent_idx on public.talent_favorites(talent_id);

alter table public.talent_favorites enable row level security;

-- ユーザーは自分のお気に入りのみ操作可能
create policy "Users can view own favorites"
  on public.talent_favorites for select using (fan_id = auth.uid());

create policy "Users can add favorites"
  on public.talent_favorites for insert with check (fan_id = auth.uid());

create policy "Users can remove own favorites"
  on public.talent_favorites for delete using (fan_id = auth.uid());
