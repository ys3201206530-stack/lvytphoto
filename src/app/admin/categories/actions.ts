"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CategoryResult = { ok: true } | { ok: false; error: string };

type AdminContext =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>> }
  | { ok: false; error: string };

async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "登录状态已失效，请重新登录。" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();

  if (profile?.role !== "admin") return { ok: false, error: "只有管理员可以管理分类。" };

  return { ok: true, supabase };
}

function revalidateCategories() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/admin/photos/new");
  revalidatePath("/");
  revalidatePath("/works");
}

/** 新增分类。 */
export async function createCategory(formData: FormData): Promise<CategoryResult> {
  const ctx = await getAdminContext();
  if (!ctx.ok) return ctx;

  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const sortRaw = String(formData.get("sortOrder") ?? "0").trim();

  if (!SLUG_RE.test(slug) || slug.length < 2 || slug.length > 40) {
    return { ok: false, error: "英文标识只能用小写字母、数字和连字符，2～40 个字符。" };
  }
  if (name.length < 1 || name.length > 20) {
    return { ok: false, error: "分类名称需要 1～20 个字。" };
  }

  const sortOrder = Number(sortRaw || "0");
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999) {
    return { ok: false, error: "排序值需要 0～999 的整数。" };
  }

  const { error } = await ctx.supabase.from("categories").insert({ slug, name, sort_order: sortOrder });

  if (error) {
    if (error.code === "23505") return { ok: false, error: "这个英文标识已经被占用了。" };
    console.error("createCategory failed:", error.message);
    return { ok: false, error: "新增失败，请稍后重试。" };
  }

  revalidateCategories();
  return { ok: true };
}

/** 修改分类名称与排序（英文标识不允许改，避免已分享的链接失效）。 */
export async function renameCategory(
  id: string,
  name: string,
  sortOrder: number,
): Promise<CategoryResult> {
  const ctx = await getAdminContext();
  if (!ctx.ok) return ctx;
  if (!UUID_RE.test(id)) return { ok: false, error: "分类编号不正确。" };

  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 20) {
    return { ok: false, error: "分类名称需要 1～20 个字。" };
  }
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 999) {
    return { ok: false, error: "排序值需要 0～999 的整数。" };
  }

  const { error } = await ctx.supabase
    .from("categories")
    .update({ name: trimmed, sort_order: sortOrder })
    .eq("id", id);

  if (error) {
    console.error("renameCategory failed:", error.message);
    return { ok: false, error: "保存失败，请稍后重试。" };
  }

  revalidateCategories();
  return { ok: true };
}

/** 设置分类招牌图（图片已由浏览器直传到 photos 桶）。 */
export async function setCategoryCover(
  id: string,
  storagePath: string,
): Promise<CategoryResult> {
  const ctx = await getAdminContext();
  if (!ctx.ok) return ctx;
  if (!UUID_RE.test(id)) return { ok: false, error: "分类编号不正确。" };

  if (!/^category\/[0-9a-f-]{36}$/i.test(storagePath)) {
    return { ok: false, error: "招牌图地址不正确。" };
  }

  const { error } = await ctx.supabase
    .from("categories")
    .update({ cover_path: storagePath })
    .eq("id", id);

  if (error) {
    console.error("setCategoryCover failed:", error.message);
    return { ok: false, error: `保存失败：${error.message}` };
  }

  revalidateCategories();
  return { ok: true };
}

/** 移除分类招牌图，并从存储里删掉文件。 */
export async function clearCategoryCover(id: string): Promise<CategoryResult> {
  const ctx = await getAdminContext();
  if (!ctx.ok) return ctx;
  if (!UUID_RE.test(id)) return { ok: false, error: "分类编号不正确。" };

  const { data } = await ctx.supabase
    .from("categories")
    .select("cover_path")
    .eq("id", id)
    .maybeSingle<{ cover_path: string | null }>();

  const { error } = await ctx.supabase
    .from("categories")
    .update({ cover_path: null })
    .eq("id", id);

  if (error) {
    console.error("clearCategoryCover failed:", error.message);
    return { ok: false, error: "移除失败，请稍后重试。" };
  }

  const oldPath = data?.cover_path;
  if (oldPath) {
    await ctx.supabase.storage.from("photos").remove([`${oldPath}-md.webp`]);
  }

  revalidateCategories();
  return { ok: true };
}

/** 删除分类；该分类下的作品由数据库外键自动变成“未分类”。 */
export async function deleteCategory(id: string): Promise<CategoryResult> {
  const ctx = await getAdminContext();
  if (!ctx.ok) return ctx;
  if (!UUID_RE.test(id)) return { ok: false, error: "分类编号不正确。" };

  const { error } = await ctx.supabase.from("categories").delete().eq("id", id);

  if (error) {
    console.error("deleteCategory failed:", error.message);
    return { ok: false, error: "删除失败，请稍后重试。" };
  }

  revalidateCategories();
  return { ok: true };
}
