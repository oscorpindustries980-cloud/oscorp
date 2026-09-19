-- Run this once in Supabase SQL Editor after the base schema.
-- This migration makes the existing portal's local employee/HR workflow
-- persist in Supabase. The app uses the public/publishable key.

alter table public.quotations
  add column if not exists owner_ref text;

alter table public.notifications
  alter column recipient_id drop not null;

alter table public.notifications
  add column if not exists recipient_role text;

create index if not exists idx_quotations_owner_ref
  on public.quotations(owner_ref);

-- The current portal keeps its existing local role/login UI. These policies
-- allow the public client to persist the workflow. For a production deployment
-- with untrusted users, migrate the login to Supabase Auth and tighten these
-- policies around auth.uid()/profiles.role.

drop policy if exists "portal quotations read" on public.quotations;
drop policy if exists "portal quotations insert" on public.quotations;
drop policy if exists "portal quotations update" on public.quotations;
create policy "portal quotations read" on public.quotations for select using (true);
create policy "portal quotations insert" on public.quotations for insert with check (true);
create policy "portal quotations update" on public.quotations for update using (true) with check (true);

drop policy if exists "portal quotation items read" on public.quotation_items;
drop policy if exists "portal quotation items insert" on public.quotation_items;
create policy "portal quotation items read" on public.quotation_items for select using (true);
create policy "portal quotation items insert" on public.quotation_items for insert with check (true);

drop policy if exists "portal approvals read" on public.quotation_approvals;
drop policy if exists "portal approvals insert" on public.quotation_approvals;
create policy "portal approvals read" on public.quotation_approvals for select using (true);
create policy "portal approvals insert" on public.quotation_approvals for insert with check (true);

drop policy if exists "portal notifications read" on public.notifications;
drop policy if exists "portal notifications insert" on public.notifications;
drop policy if exists "portal notifications update" on public.notifications;
create policy "portal notifications read" on public.notifications for select using (true);
create policy "portal notifications insert" on public.notifications for insert with check (true);
create policy "portal notifications update" on public.notifications for update using (true) with check (true);

-- Realtime is optional in this build; the portal polls every 5 seconds so it
-- still works if Realtime is not enabled for the project.
