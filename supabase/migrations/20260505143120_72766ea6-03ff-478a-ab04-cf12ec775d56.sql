
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles readable by anyone"
  on public.profiles for select
  using (true);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Game saves
create table public.game_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.game_saves enable row level security;

create policy "users select own saves"
  on public.game_saves for select
  using (auth.uid() = user_id);

create policy "users insert own saves"
  on public.game_saves for insert
  with check (auth.uid() = user_id);

create policy "users update own saves"
  on public.game_saves for update
  using (auth.uid() = user_id);

create policy "users delete own saves"
  on public.game_saves for delete
  using (auth.uid() = user_id);

-- Updated_at helper
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.tg_set_updated_at();

create trigger game_saves_set_updated_at
before update on public.game_saves
for each row execute function public.tg_set_updated_at();

-- Auto-create profile on signup, reading username from raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
