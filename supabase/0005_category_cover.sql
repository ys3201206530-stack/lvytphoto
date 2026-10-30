-- lvytphoto · 分类“招牌图”
-- 用法：Supabase Dashboard → SQL Editor → New query → 整段粘贴 → Run
-- 可重复执行：列已存在时不会报错。

alter table public.categories
  add column if not exists cover_path text;

-- 读取沿用现有策略（公开可读）；写入仍然只有管理员，无需新增策略。
