-- ============================================================
-- fan℃ Database Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- fuzzy search

-- ============================================================
-- Enums
-- ============================================================

create type user_role as enum ('fan', 'operator', 'admin');
create type talent_category as enum ('hito', 'mono', 'koto');
create type talent_status as enum (
  'draft', 'pending_review', 'pending_kyc', 'pending_final',
  'active', 'suspended', 'rejected'
);
create type kyc_type as enum ('individual', 'corporate', 'organization');
create type kyc_status as enum ('pending', 'approved', 'rejected', 'requires_resubmission');
create type subscription_status as enum ('active', 'cancelled', 'past_due', 'paused');
create type billing_cycle as enum ('monthly', 'yearly');
create type fanc_event_type as enum (
  'subscription', 'sns_share', 'event_participation', 'community_activity', 'bonus'
);

-- ============================================================
-- users (extends auth.users)
-- ============================================================

create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  role        user_role not null default 'fan',
  display_name text,
  avatar_url  text,
  prefecture  text,
  bio         text,
  fanc_score  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- talents
-- ============================================================

create table public.talents (
  id              uuid primary key default uuid_generate_v4(),
  operator_id     uuid not null references public.users(id) on delete restrict,
  name            text not null,
  slug            text not null unique,
  category        talent_category not null,
  tags            text[] not null default '{}',
  prefecture      text,
  city            text,
  description     text,
  cover_image_url text,
  avatar_url      text,
  status          talent_status not null default 'draft',
  fanc_score      integer not null default 0,
  supporter_count integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz
);

create index talents_status_idx on public.talents(status);
create index talents_category_idx on public.talents(category);
create index talents_operator_idx on public.talents(operator_id);
create index talents_fanc_score_idx on public.talents(fanc_score desc);

-- ============================================================
-- kyc_submissions
-- ============================================================

create table public.kyc_submissions (
  id               uuid primary key default uuid_generate_v4(),
  talent_id        uuid not null references public.talents(id) on delete cascade,
  kyc_type         kyc_type not null,
  status           kyc_status not null default 'pending',
  document_urls    jsonb not null default '{}',
  rejection_reason text,
  reviewed_by      uuid references public.users(id),
  reviewed_at      timestamptz,
  submitted_at     timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- bank_accounts
-- ============================================================

create table public.bank_accounts (
  id              uuid primary key default uuid_generate_v4(),
  talent_id       uuid not null references public.talents(id) on delete cascade,
  bank_name       text not null,
  branch_name     text not null,
  account_type    text not null check (account_type in ('普通', '当座')),
  account_number  text not null,
  account_holder  text not null,
  is_verified     boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- legal_notices (特定商取引法)
-- ============================================================

create table public.legal_notices (
  id                   uuid primary key default uuid_generate_v4(),
  talent_id            uuid not null unique references public.talents(id) on delete cascade,
  seller_name          text not null,
  representative_name  text,
  address              text not null,
  phone                text not null,
  email                text not null,
  payment_methods      text not null,
  billing_timing       text not null,
  delivery_timing      text not null,
  cancel_policy        text not null,
  environment          text,
  updated_at           timestamptz not null default now()
);

-- ============================================================
-- support_plans
-- ============================================================

create table public.support_plans (
  id               uuid primary key default uuid_generate_v4(),
  talent_id        uuid not null references public.talents(id) on delete cascade,
  name             text not null,
  description      text,
  price            integer not null check (price >= 100),  -- JPY, min ¥100
  billing_cycle    billing_cycle not null default 'monthly',
  fanc_bonus       integer not null default 0,
  benefits         jsonb not null default '[]',
  is_active        boolean not null default true,
  stripe_price_id  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index support_plans_talent_idx on public.support_plans(talent_id);

-- ============================================================
-- subscriptions
-- ============================================================

create table public.subscriptions (
  id                      uuid primary key default uuid_generate_v4(),
  fan_id                  uuid not null references public.users(id) on delete restrict,
  talent_id               uuid not null references public.talents(id) on delete restrict,
  plan_id                 uuid not null references public.support_plans(id) on delete restrict,
  status                  subscription_status not null default 'active',
  stripe_subscription_id  text unique,
  current_period_start    timestamptz not null,
  current_period_end      timestamptz not null,
  cancelled_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  unique (fan_id, talent_id, plan_id)
);

create index subscriptions_fan_idx on public.subscriptions(fan_id);
create index subscriptions_talent_idx on public.subscriptions(talent_id);

-- ============================================================
-- fanc_history
-- ============================================================

create table public.fanc_history (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  talent_id   uuid references public.talents(id) on delete set null,
  event_type  fanc_event_type not null,
  points      integer not null,
  description text,
  created_at  timestamptz not null default now()
);

create index fanc_history_user_idx on public.fanc_history(user_id, created_at desc);

-- Trigger: update users.fanc_score on insert
create or replace function public.update_fanc_score()
returns trigger language plpgsql security definer as $$
begin
  update public.users
  set fanc_score = fanc_score + new.points,
      updated_at = now()
  where id = new.user_id;
  return new;
end;
$$;

create trigger on_fanc_history_insert
  after insert on public.fanc_history
  for each row execute procedure public.update_fanc_score();

-- ============================================================
-- community_posts
-- ============================================================

create table public.community_posts (
  id            uuid primary key default uuid_generate_v4(),
  talent_id     uuid not null references public.talents(id) on delete cascade,
  author_id     uuid not null references public.users(id) on delete cascade,
  content       text not null,
  image_urls    text[] not null default '{}',
  is_pinned     boolean not null default false,
  like_count    integer not null default 0,
  comment_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index community_posts_talent_idx on public.community_posts(talent_id, created_at desc);

-- ============================================================
-- admin_audit_logs
-- ============================================================

create table public.admin_audit_logs (
  id           uuid primary key default uuid_generate_v4(),
  admin_id     uuid not null references public.users(id) on delete restrict,
  action       text not null,   -- e.g. 'approve_talent', 'reject_kyc'
  target_type  text not null,   -- e.g. 'talent', 'kyc_submission'
  target_id    uuid not null,
  before_state jsonb,
  after_state  jsonb,
  note         text,
  created_at   timestamptz not null default now()
);

create index admin_audit_logs_target_idx on public.admin_audit_logs(target_type, target_id);

-- ============================================================
-- updated_at triggers (auto-update)
-- ============================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.talents
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.kyc_submissions
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.bank_accounts
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.legal_notices
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.support_plans
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.community_posts
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.users enable row level security;
alter table public.talents enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.legal_notices enable row level security;
alter table public.support_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.fanc_history enable row level security;
alter table public.community_posts enable row level security;
alter table public.admin_audit_logs enable row level security;

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  );
$$;

-- users
create policy "Users can view their own profile"
  on public.users for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.users for update using (auth.uid() = id);
create policy "Admins can view all users"
  on public.users for select using (public.is_admin());
create policy "Admins can update any user"
  on public.users for update using (public.is_admin());

-- talents (public read for active, restricted write)
create policy "Anyone can view active talents"
  on public.talents for select
  using (status = 'active');
create policy "Operators can view their own talents"
  on public.talents for select
  using (operator_id = auth.uid());
create policy "Operators can create talents"
  on public.talents for insert
  with check (operator_id = auth.uid());
create policy "Operators can update their own talents"
  on public.talents for update
  using (operator_id = auth.uid() and status in ('draft', 'rejected'));
create policy "Admins can view all talents"
  on public.talents for select using (public.is_admin());
create policy "Admins can update any talent"
  on public.talents for update using (public.is_admin());

-- kyc_submissions
create policy "Operators can view their own KYC"
  on public.kyc_submissions for select
  using (talent_id in (select id from public.talents where operator_id = auth.uid()));
create policy "Operators can insert KYC"
  on public.kyc_submissions for insert
  with check (talent_id in (select id from public.talents where operator_id = auth.uid()));
create policy "Admins can view all KYC"
  on public.kyc_submissions for select using (public.is_admin());
create policy "Admins can update KYC"
  on public.kyc_submissions for update using (public.is_admin());

-- bank_accounts
create policy "Operators can manage their bank accounts"
  on public.bank_accounts for all
  using (talent_id in (select id from public.talents where operator_id = auth.uid()));
create policy "Admins can view all bank accounts"
  on public.bank_accounts for select using (public.is_admin());

-- legal_notices (public read)
create policy "Anyone can view legal notices"
  on public.legal_notices for select using (true);
create policy "Operators can manage their legal notices"
  on public.legal_notices for all
  using (talent_id in (select id from public.talents where operator_id = auth.uid()));
create policy "Admins can update legal notices"
  on public.legal_notices for update using (public.is_admin());

-- support_plans (public read for active talents)
create policy "Anyone can view plans for active talents"
  on public.support_plans for select
  using (talent_id in (select id from public.talents where status = 'active'));
create policy "Operators can manage their plans"
  on public.support_plans for all
  using (talent_id in (select id from public.talents where operator_id = auth.uid()));
create policy "Admins can view all plans"
  on public.support_plans for select using (public.is_admin());

-- subscriptions
create policy "Fans can view their own subscriptions"
  on public.subscriptions for select using (fan_id = auth.uid());
create policy "Fans can insert subscriptions"
  on public.subscriptions for insert with check (fan_id = auth.uid());
create policy "Operators can view subscriptions for their talents"
  on public.subscriptions for select
  using (talent_id in (select id from public.talents where operator_id = auth.uid()));
create policy "Admins can view all subscriptions"
  on public.subscriptions for select using (public.is_admin());

-- fanc_history
create policy "Users can view their own fanc history"
  on public.fanc_history for select using (user_id = auth.uid());
create policy "System can insert fanc history"
  on public.fanc_history for insert with check (user_id = auth.uid());
create policy "Admins can view all fanc history"
  on public.fanc_history for select using (public.is_admin());

-- community_posts (visible to active subscribers only)
create policy "Active subscribers can view community posts"
  on public.community_posts for select
  using (
    talent_id in (
      select talent_id from public.subscriptions
      where fan_id = auth.uid() and status = 'active'
    )
    or talent_id in (select id from public.talents where operator_id = auth.uid())
  );
create policy "Talent operators can post"
  on public.community_posts for insert
  with check (
    author_id = auth.uid() and
    talent_id in (select id from public.talents where operator_id = auth.uid())
  );
create policy "Authors can update their posts"
  on public.community_posts for update using (author_id = auth.uid());

-- admin_audit_logs
create policy "Admins can view audit logs"
  on public.admin_audit_logs for select using (public.is_admin());
create policy "Admins can insert audit logs"
  on public.admin_audit_logs for insert with check (public.is_admin());
