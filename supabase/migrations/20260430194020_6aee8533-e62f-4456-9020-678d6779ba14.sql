create table if not exists public.site_config (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_config enable row level security;

create policy "site_config readable by anyone"
  on public.site_config for select
  using (true);

create policy "site_config writable by anyone"
  on public.site_config for insert
  with check (true);

create policy "site_config updatable by anyone"
  on public.site_config for update
  using (true)
  with check (true);
