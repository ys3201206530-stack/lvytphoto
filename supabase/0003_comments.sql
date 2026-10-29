-- ============================================================
-- lvytphoto · 0003 评论作者信息
-- 用法：Supabase Dashboard → SQL Editor → 整段粘贴 → Run
-- 可重复执行：不会删数据
-- ============================================================

-- 评论列表要显示昵称和头像，但 profiles 表只允许本人或管理员读。
-- 这个函数只返回“某一张照片下的评论”，对外只暴露昵称与头像路径，
-- 不暴露邮箱、角色等字段。函数由数据库所有者执行，因此能读到 profiles。
create or replace function public.photo_comments(p_photo_id uuid)
returns table (
  id uuid,
  content text,
  created_at timestamptz,
  user_id uuid,
  display_name text,
  avatar_path text
)
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select
    c.id,
    c.content,
    c.created_at,
    c.user_id,
    coalesce(p.display_name, '匿名访客') as display_name,
    p.avatar_path
  from public.comments c
  left join public.profiles p on p.id = c.user_id
  where c.photo_id = p_photo_id
  order by c.created_at asc;
$$;

revoke all on function public.photo_comments(uuid) from public;
grant execute on function public.photo_comments(uuid) to anon, authenticated;
