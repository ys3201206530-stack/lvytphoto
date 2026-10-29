-- lvytphoto · 0004 安全加固：评论只对“已发布照片”可见
-- 用法：Supabase Dashboard → SQL Editor → New query → 整段粘贴 → Run
-- 特点：可重复执行；不删任何数据

-- ------------------------------------------------------------
-- 1. 收紧评论表的读取策略
--    原来的策略是 using (true)，意味着任何访客都能读到草稿照片下的评论。
--    改成：只有“已发布照片”的评论对外可见，管理员不受限制。
-- ------------------------------------------------------------
drop policy if exists "comments_public_read" on public.comments;
drop policy if exists "comments_read_published" on public.comments;

create policy "comments_read_published" on public.comments
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.photos p
      where p.id = comments.photo_id
        and p.is_published = true
    )
    or public.is_admin()
  );

-- ------------------------------------------------------------
-- 2. 评论列表函数同样加上“已发布”条件
--    函数是 security definer，会绕过 RLS，所以条件必须写在函数里，
--    否则别人拿任意照片 id 调 rpc 仍能读到草稿下的评论。
-- ------------------------------------------------------------
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
    coalesce(pr.display_name, '匿名访客') as display_name,
    pr.avatar_path
  from public.comments c
  left join public.profiles pr on pr.id = c.user_id
  where c.photo_id = p_photo_id
    and exists (
      select 1
      from public.photos ph
      where ph.id = c.photo_id
        and ph.is_published = true
    )
  order by c.created_at asc;
$$;

revoke all on function public.photo_comments(uuid) from public;
grant execute on function public.photo_comments(uuid) to anon, authenticated;
