-- ============================================================
-- lvytphoto · 0002 头像与昵称
-- 用法：Supabase Dashboard → SQL Editor → New query → 整段粘贴 → Run
-- 可重复执行：不会删数据，也不会重复建桶
-- ============================================================

-- 1. profiles 增加头像路径（存的是 storage 里的文件路径，不是外链）
alter table public.profiles add column if not exists avatar_path text;

-- 2. 登录用户只能改自己的昵称和头像路径；role 依然改不了
revoke update on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, avatar_path) on public.profiles to authenticated;

-- 3. 头像存储桶：公开读（头像本来就要显示），只有本人能写自己 id 目录
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png'];

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
