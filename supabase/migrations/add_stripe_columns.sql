-- ============================================================
-- Migration: Stripe連携に必要なカラム追加
-- ============================================================

-- 1. users テーブルに stripe_customer_id を追加
alter table public.users
  add column if not exists stripe_customer_id text unique;

-- 2. support_plans テーブルに max_supporters / current_supporters を追加
--    (プラン上限人数と現サポーター数の管理用)
alter table public.support_plans
  add column if not exists max_supporters integer check (max_supporters > 0),
  add column if not exists current_supporters integer not null default 0 check (current_supporters >= 0);

-- 3. subscriptions テーブルに current_period_end を追加
--    (Stripe の請求期間終了日。Webhook で更新)
alter table public.subscriptions
  add column if not exists current_period_end timestamptz;

-- 4. current_supporters を subscriptions の INSERT/UPDATE/DELETE で自動更新するトリガー
create or replace function public.update_plan_supporter_count()
returns trigger language plpgsql security definer as $$
begin
  if TG_OP = 'INSERT' and NEW.status = 'active' then
    update public.support_plans
      set current_supporters = current_supporters + 1
      where id = NEW.plan_id;

  elsif TG_OP = 'UPDATE' then
    if OLD.status != 'active' and NEW.status = 'active' then
      update public.support_plans
        set current_supporters = current_supporters + 1
        where id = NEW.plan_id;
    elsif OLD.status = 'active' and NEW.status != 'active' then
      update public.support_plans
        set current_supporters = greatest(0, current_supporters - 1)
        where id = NEW.plan_id;
    end if;

  elsif TG_OP = 'DELETE' and OLD.status = 'active' then
    update public.support_plans
      set current_supporters = greatest(0, current_supporters - 1)
      where id = OLD.plan_id;
  end if;

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists sync_plan_supporter_count on public.subscriptions;
create trigger sync_plan_supporter_count
  after insert or update or delete on public.subscriptions
  for each row execute procedure public.update_plan_supporter_count();
