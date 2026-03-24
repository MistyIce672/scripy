-- ============================================================
-- MiniApp Platform — Initial Schema
-- ============================================================

-- App definitions (the HTML source + metadata)
create table apps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  author_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  html_source text not null,
  is_public boolean default false,
  install_count int default 0
);

-- User installs (which apps a user has added)
create table user_installs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  app_id uuid references apps(id) on delete cascade,
  installed_at timestamptz default now(),
  unique(user_id, app_id)
);

-- Private user app data (per user, per app)
create table user_app_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  app_id uuid references apps(id) on delete cascade,
  key text not null,
  value jsonb,
  updated_at timestamptz default now(),
  unique(user_id, app_id, key)
);

-- Shared rooms (multi-user data sessions)
create table rooms (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references apps(id) on delete cascade,
  created_by uuid references auth.users(id),
  name text,
  created_at timestamptz default now()
);

-- Room members
create table room_members (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  primary key(room_id, user_id)
);

-- Shared room data (the actual shared state)
create table room_data (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  key text not null,
  value jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz default now(),
  unique(room_id, key)
);

-- ============================================================
-- Indexes
-- ============================================================

create index idx_apps_author on apps(author_id);
create index idx_apps_public on apps(is_public) where is_public = true;
create index idx_user_installs_user on user_installs(user_id);
create index idx_user_installs_app on user_installs(app_id);
create index idx_user_app_data_lookup on user_app_data(user_id, app_id, key);
create index idx_rooms_app on rooms(app_id);
create index idx_room_data_room on room_data(room_id);

-- ============================================================
-- Row Level Security
-- ============================================================

-- Apps: anyone can read public apps, authors manage their own
alter table apps enable row level security;

create policy "public apps readable"
  on apps for select
  using (is_public = true);

create policy "author full access"
  on apps for all
  using (author_id = auth.uid());

-- User installs: users manage their own installs
alter table user_installs enable row level security;

create policy "own installs only"
  on user_installs for all
  using (user_id = auth.uid());

-- User app data: private to each user
alter table user_app_data enable row level security;

create policy "own data only"
  on user_app_data for all
  using (user_id = auth.uid());

-- Rooms: creators and members can see rooms
alter table rooms enable row level security;

create policy "room creator access"
  on rooms for all
  using (created_by = auth.uid());

create policy "room members can view"
  on rooms for select
  using (
    exists (
      select 1 from room_members
      where room_members.room_id = rooms.id
      and room_members.user_id = auth.uid()
    )
  );

-- Room members: members can see other members, join/leave themselves
alter table room_members enable row level security;

create policy "members see members"
  on room_members for select
  using (
    exists (
      select 1 from room_members rm
      where rm.room_id = room_members.room_id
      and rm.user_id = auth.uid()
    )
  );

create policy "users manage own membership"
  on room_members for all
  using (user_id = auth.uid());

-- Room data: only room members can read/write
alter table room_data enable row level security;

create policy "room members access"
  on room_data for all
  using (
    exists (
      select 1 from room_members
      where room_members.room_id = room_data.room_id
      and room_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- Enable Realtime for room_data
-- ============================================================

alter publication supabase_realtime add table room_data;

-- ============================================================
-- Functions
-- ============================================================

create or replace function increment_install_count(target_app_id uuid)
returns void
language sql
security definer
as $$
  update apps set install_count = install_count + 1 where id = target_app_id;
$$;
