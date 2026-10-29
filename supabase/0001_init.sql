-- ============================================================
-- lvytphoto · 数据库与存储初始化脚本（第一阶段：数据结构与权限）
-- 用法：Supabase Dashboard → SQL Editor → New query → 整段粘贴 → Run
-- 特点：可重复执行；不会重复建表，也不会重复插入分类
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. 用户资料 profiles
--    role 只有两种值，默认 user；管理员只能通过后台 SQL 设置
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 40),
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 判定“当前请求者是不是管理员”，只读取数据库里的 role，前端无法伪造
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_read_admin" on public.profiles;
create policy "profiles_read_admin" on public.profiles
  for select to authenticated
  using (public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 关键：撤销表级 UPDATE，只允许改 display_name。
-- 这样即使有人直接调用接口，也改不了自己的 role。
revoke update on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

-- 新用户注册时自动建立一条 profiles 记录
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(
      coalesce(
        nullif(new.raw_user_meta_data ->> 'display_name', ''),
        split_part(coalesce(new.email, '摄影师'), '@', 1)
      ),
      40
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- 2. 分类 categories
--    前台所有人可读；增删改只允许管理员
-- ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  name text not null check (char_length(name) between 1 and 20),
  description text check (char_length(description) <= 200),
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated
  using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

-- ------------------------------------------------------------
-- 3. 作品 photos
--    分类被删除时，作品的 category_id 自动变为 NULL（不会丢作品）
-- ------------------------------------------------------------
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 2000),
  category_id uuid references public.categories (id) on delete set null,
  shot_at date,
  storage_path text not null unique,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  blur_data_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists photos_category_idx on public.photos (category_id);
create index if not exists photos_created_idx on public.photos (created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists photos_touch_updated_at on public.photos;
create trigger photos_touch_updated_at
  before update on public.photos
  for each row execute function public.touch_updated_at();

alter table public.photos enable row level security;

drop policy if exists "photos_public_read" on public.photos;
create policy "photos_public_read" on public.photos
  for select to anon, authenticated
  using (is_published or public.is_admin());

drop policy if exists "photos_admin_write" on public.photos;
create policy "photos_admin_write" on public.photos
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.photos to anon, authenticated;
grant insert, update, delete on public.photos to authenticated;

-- ------------------------------------------------------------
-- 4. 站点设置 site_settings（背景图等，只允许管理员改）
-- ------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "settings_admin_write" on public.site_settings;
create policy "settings_admin_write" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

insert into public.site_settings (key, value)
values ('background', jsonb_build_object('storage_path', null, 'updated_at', null))
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- 5. 点赞 likes（主键保证一人一图只能有一个赞）
-- ------------------------------------------------------------
create table if not exists public.likes (
  photo_id uuid not null references public.photos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (photo_id, user_id)
);

alter table public.likes enable row level security;

drop policy if exists "likes_public_read" on public.likes;
create policy "likes_public_read" on public.likes
  for select to anon, authenticated
  using (true);

drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes
  for delete to authenticated
  using (user_id = (select auth.uid()));

grant select on public.likes to anon, authenticated;
grant insert, delete on public.likes to authenticated;

-- ------------------------------------------------------------
-- 6. 评论 comments
-- ------------------------------------------------------------
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_photo_idx on public.comments (photo_id, created_at desc);

alter table public.comments enable row level security;

drop policy if exists "comments_public_read" on public.comments;
create policy "comments_public_read" on public.comments
  for select to anon, authenticated
  using (true);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "comments_delete_own_or_admin" on public.comments;
create policy "comments_delete_own_or_admin" on public.comments
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "comments_admin_update" on public.comments;
create policy "comments_admin_update" on public.comments
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.comments to anon, authenticated;
grant insert (photo_id, user_id, content) on public.comments to authenticated;
grant delete on public.comments to authenticated;

-- ------------------------------------------------------------
-- 7. 图片存储桶 photos
--    公开读取；只有管理员能上传 / 覆盖 / 删除
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "photos_storage_public_read" on storage.objects;
create policy "photos_storage_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'photos');

drop policy if exists "photos_storage_admin_insert" on storage.objects;
create policy "photos_storage_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and public.is_admin());

drop policy if exists "photos_storage_admin_update" on storage.objects;
create policy "photos_storage_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and public.is_admin())
  with check (bucket_id = 'photos' and public.is_admin());

drop policy if exists "photos_storage_admin_delete" on storage.objects;
create policy "photos_storage_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and public.is_admin());

-- ------------------------------------------------------------
-- 8. 初始分类（已存在则跳过）
-- ------------------------------------------------------------
insert into public.categories (slug, name, description, sort_order)
values
  ('landscape',    '风光', '山川、海与天光', 10),
  ('city',         '城市', '霓虹、街道与夜色', 20),
  ('portrait',     '人像', '人与光的关系', 30),
  ('street',       '街拍', '路过的瞬间', 40),
  ('architecture', '建筑', '结构与线条', 50),
  ('travel',       '旅行', '在路上的记录', 60)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- 9. 把你自己设为管理员（注册账号后再执行，只执行一次）
--    把下面的邮箱换成你注册时用的邮箱，然后取消注释运行：
--
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'you@example.com');
-- ------------------------------------------------------------
