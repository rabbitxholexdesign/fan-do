-- ============================================================
-- Migration: add is_member_only to community_posts
--            and create community_messages table
-- ============================================================

-- 1. Add is_member_only column to community_posts (if not exists)
alter table public.community_posts
  add column if not exists is_member_only boolean not null default false;

-- 2. Create community_messages table for real-time salon chat
create table if not exists public.community_messages (
  id         uuid primary key default uuid_generate_v4(),
  talent_id  uuid not null references public.talents(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  content    text not null check (char_length(content) <= 1000),
  created_at timestamptz not null default now()
);

create index if not exists community_messages_talent_idx
  on public.community_messages(talent_id, created_at asc);

-- 3. Enable RLS
alter table public.community_messages enable row level security;

-- 4. RLS policies for community_messages

-- Members (active subscribers) and talent operators can read messages
create policy "Members can view chat messages"
  on public.community_messages for select
  using (
    talent_id in (
      select talent_id from public.subscriptions
      where fan_id = auth.uid() and status = 'active'
    )
    or talent_id in (select id from public.talents where operator_id = auth.uid())
  );

-- Members and operators can send messages
create policy "Members can send chat messages"
  on public.community_messages for insert
  with check (
    user_id = auth.uid()
    and (
      talent_id in (
        select talent_id from public.subscriptions
        where fan_id = auth.uid() and status = 'active'
      )
      or talent_id in (select id from public.talents where operator_id = auth.uid())
    )
  );

-- Operators can delete any message; users can delete their own
create policy "Authors and operators can delete chat messages"
  on public.community_messages for delete
  using (
    user_id = auth.uid()
    or talent_id in (select id from public.talents where operator_id = auth.uid())
  );

-- 5. Enable Realtime for community_messages
-- (Run this in the Supabase Dashboard under Database > Replication if not already enabled)
-- alter publication supabase_realtime add table public.community_messages;
