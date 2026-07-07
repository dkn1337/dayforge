-- DayForge v1.0 — Supabase schema, auth bootstrap and RLS.
-- Run this once in Supabase SQL Editor before adding NEXT_PUBLIC_SUPABASE_* values.

create extension if not exists pgcrypto;

do $$ begin
  create type public.workspace_role as enum ('owner', 'member');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_priority as enum ('high', 'medium', 'low');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.task_status as enum ('inbox', 'today', 'planned', 'completed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.planner_category as enum ('deep-work', 'meeting', 'personal', 'break');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.focus_mode as enum ('focus', 'short-break', 'long-break');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Użytkownik' check (char_length(display_name) between 2 and 80),
  avatar_url text,
  timezone text not null default 'Europe/Warsaw',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.projects (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  color text not null check (color in ('purple', 'blue', 'green', 'yellow', 'pink')),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id text references public.projects(id) on delete set null,
  title text not null check (char_length(title) between 1 and 300),
  description text not null default '',
  priority public.task_priority not null default 'medium',
  status public.task_status not null default 'inbox',
  due_date date,
  planned_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.planner_blocks (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id text references public.tasks(id) on delete set null,
  title text not null check (char_length(title) between 1 and 300),
  start_at timestamptz not null,
  end_at timestamptz not null check (end_at > start_at),
  color text not null default 'purple',
  type public.planner_category not null default 'deep-work',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habits (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  icon text not null,
  weekly_target integer not null default 5 check (weekly_target between 1 and 7),
  color text not null default 'purple',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.habit_completions (
  id text primary key,
  habit_id text not null references public.habits(id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create table if not exists public.focus_sessions (
  id text primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id text references public.tasks(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  planned_seconds integer not null check (planned_seconds > 0),
  actual_seconds integer not null check (actual_seconds >= 0),
  mode public.focus_mode not null default 'focus',
  status text not null check (status in ('completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'dark',
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  default_focus_minutes integer not null default 25 check (default_focus_minutes between 1 and 120),
  break_minutes integer not null default 5 check (break_minutes between 1 and 60),
  notifications_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

-- v1.0 sync transport. It stores a validated state document so current desktop users can
-- safely migrate/sync all existing local features before per-record realtime sync is added.
create table if not exists public.workspace_state_snapshots (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references auth.users(id) on delete cascade
);

create index if not exists tasks_workspace_status_idx on public.tasks(workspace_id, status);
create index if not exists tasks_workspace_planned_date_idx on public.tasks(workspace_id, planned_date);
create index if not exists planner_blocks_workspace_start_idx on public.planner_blocks(workspace_id, start_at);
create index if not exists habits_workspace_idx on public.habits(workspace_id) where not archived;
create index if not exists focus_sessions_workspace_started_idx on public.focus_sessions(workspace_id, started_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists planner_blocks_updated_at on public.planner_blocks;
create trigger planner_blocks_updated_at before update on public.planner_blocks for each row execute function public.set_updated_at();
drop trigger if exists preferences_updated_at on public.user_preferences;
create trigger preferences_updated_at before update on public.user_preferences for each row execute function public.set_updated_at();

create or replace function public.ensure_personal_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_workspace uuid;
  created_workspace uuid;
  display text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;

  select workspace_id into existing_workspace
  from public.workspace_members
  where user_id = auth.uid()
  order by created_at asc
  limit 1;
  if existing_workspace is not null then return existing_workspace; end if;

  select coalesce((select display_name from public.profiles where id = auth.uid()), 'Moja przestrzeń') into display;
  insert into public.workspaces(name, owner_id) values (left(display || ' — osobista', 120), auth.uid()) returning id into created_workspace;
  insert into public.workspace_members(workspace_id, user_id, role) values (created_workspace, auth.uid(), 'owner');
  return created_workspace;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  safe_name text;
  workspace_uuid uuid;
begin
  safe_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(coalesce(new.email, 'Użytkownik'), '@', 1));
  insert into public.profiles(id, display_name) values (new.id, left(safe_name, 80)) on conflict (id) do nothing;
  insert into public.user_preferences(user_id) values (new.id) on conflict (user_id) do nothing;
  select workspace_id into workspace_uuid from public.workspace_members where user_id = new.id limit 1;
  if workspace_uuid is null then
    insert into public.workspaces(name, owner_id) values (left(safe_name || ' — osobista', 120), new.id) returning id into workspace_uuid;
    insert into public.workspace_members(workspace_id, user_id, role) values (workspace_uuid, new.id, 'owner');
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.workspace_members where workspace_id = target_workspace and user_id = auth.uid()) $$;

create or replace function public.is_workspace_owner(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$ select exists (select 1 from public.workspaces where id = target_workspace and owner_id = auth.uid()) $$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.planner_blocks enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.workspace_state_snapshots enable row level security;

-- Profiles and preferences are private to the current authenticated account.
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists preferences_self on public.user_preferences;
create policy preferences_self on public.user_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Workspace policies.
drop policy if exists workspaces_member_read on public.workspaces;
create policy workspaces_member_read on public.workspaces for select using (public.is_workspace_member(id));
drop policy if exists workspaces_owner_manage on public.workspaces;
create policy workspaces_owner_manage on public.workspaces for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists members_read on public.workspace_members;
create policy members_read on public.workspace_members for select using (public.is_workspace_member(workspace_id));
drop policy if exists members_owner_manage on public.workspace_members;
create policy members_owner_manage on public.workspace_members for all using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));

-- Workspace-scoped content.
drop policy if exists projects_member_access on public.projects;
create policy projects_member_access on public.projects for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists tasks_member_access on public.tasks;
create policy tasks_member_access on public.tasks for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists blocks_member_access on public.planner_blocks;
create policy blocks_member_access on public.planner_blocks for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists habits_member_access on public.habits;
create policy habits_member_access on public.habits for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists focus_member_access on public.focus_sessions;
create policy focus_member_access on public.focus_sessions for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
drop policy if exists snapshots_member_access on public.workspace_state_snapshots;
create policy snapshots_member_access on public.workspace_state_snapshots for all using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));

-- Habit completions inherit access from their parent habit.
drop policy if exists habit_completions_member_access on public.habit_completions;
create policy habit_completions_member_access on public.habit_completions for all
using (exists (select 1 from public.habits h where h.id = habit_id and public.is_workspace_member(h.workspace_id)))
with check (exists (select 1 from public.habits h where h.id = habit_id and public.is_workspace_member(h.workspace_id)));

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.ensure_personal_workspace() to authenticated;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
