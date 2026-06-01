-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  school      text,
  created_at  timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can manage own profile"
  on public.profiles for all using (auth.uid() = id);

-- ─── Class Schedules ─────────────────────────────────────────────────────────
create table if not exists public.class_schedules (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  label      text not null,
  start_time text not null,
  end_time   text not null,
  sort_order int  default 0,
  created_at timestamptz default now()
);
alter table public.class_schedules enable row level security;
create policy "Users can manage own schedules"
  on public.class_schedules for all using (auth.uid() = user_id);

-- ─── MVPA Records ────────────────────────────────────────────────────────────
create table if not exists public.mvpa_records (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  date        text not null,
  mvpa_secs   int  not null default 0,
  class_secs  int  not null default 0,
  pct         int  not null default 0,
  saved_at    timestamptz default now()
);
alter table public.mvpa_records enable row level security;
create policy "Users can manage own mvpa records"
  on public.mvpa_records for all using (auth.uid() = user_id);

-- ─── Timer Settings ──────────────────────────────────────────────────────────
create table if not exists public.timer_settings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  settings    jsonb not null default '{}',
  updated_at  timestamptz default now()
);
alter table public.timer_settings enable row level security;
create policy "Users can manage own timer settings"
  on public.timer_settings for all using (auth.uid() = user_id);

-- ─── Lesson Plans ────────────────────────────────────────────────────────────
create table if not exists public.lesson_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  data        jsonb not null default '[]',
  updated_at  timestamptz default now()
);
alter table public.lesson_plans enable row level security;
create policy "Users can manage own lesson plans"
  on public.lesson_plans for all using (auth.uid() = user_id);

-- ─── Year Plan ───────────────────────────────────────────────────────────────
create table if not exists public.year_plan (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  data        jsonb not null default '{}',
  updated_at  timestamptz default now()
);
alter table public.year_plan enable row level security;
create policy "Users can manage own year plan"
  on public.year_plan for all using (auth.uid() = user_id);

-- ─── Warm-Up Exercises ───────────────────────────────────────────────────────
create table if not exists public.warm_up_exercises (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  exercises   jsonb not null default '[]',
  updated_at  timestamptz default now()
);
alter table public.warm_up_exercises enable row level security;
create policy "Users can manage own warm up exercises"
  on public.warm_up_exercises for all using (auth.uid() = user_id);

-- ─── Cool-Down Stretches ─────────────────────────────────────────────────────
create table if not exists public.cool_down_stretches (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  stretches   jsonb not null default '[]',
  updated_at  timestamptz default now()
);
alter table public.cool_down_stretches enable row level security;
create policy "Users can manage own cool down stretches"
  on public.cool_down_stretches for all using (auth.uid() = user_id);

-- ─── Auto-create profile on signup ───────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
