"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreatePhotoInput = {
  title: string;
  description: string;
  categoryId: string | null;
  shotAt: string | null;
  storagePath: string;
  width: number;
  height: number;
  blurDataUrl: string;
};

export type CreatePhotoResult = { ok: true; id: string } | { ok: false; error: string };

/** 只接受 2026/10/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx 这种路径 */
const STORAGE_PATH_RE = /^\d{4}\/\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 保存作品信息（图片文件此时已经由浏览器直传到 Storage）。
 * 这里是服务端：会再查一次当前用户是不是管理员，数据库 RLS 也会再拦一遍。
 */
export async function createPhoto(input: CreatePhotoInput): Promise<CreatePhotoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "登录状态已失效，请重新登录后再试。" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();

  if (profile?.role !== "admin") {
    return { ok: false, error: "只有管理员可以上传作品。" };
  }

  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 1 || title.length > 80) {
    return { ok: false, error: "标题需要 1～80 个字。" };
  }
  if (description.length > 2000) {
    return { ok: false, error: "描述最多 2000 个字。" };
  }
  if (!STORAGE_PATH_RE.test(input.storagePath)) {
    return { ok: false, error: "图片路径不合法，请重新上传。" };
  }
  if (!Number.isInteger(input.width) || !Number.isInteger(input.height) || input.width <= 0 || input.height <= 0) {
    return { ok: false, error: "图片尺寸不合法，请重新上传。" };
  }
  if (input.blurDataUrl.length > 4000) {
    return { ok: false, error: "占位图数据异常，请重新上传。" };
  }

  let categoryId: string | null = null;
  if (input.categoryId) {
    if (!UUID_RE.test(input.categoryId)) {
      return { ok: false, error: "分类不正确。" };
    }
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", input.categoryId)
      .maybeSingle();

    if (!category) {
      return { ok: false, error: "选择的分类不存在。" };
    }
    categoryId = input.categoryId;
  }

  let shotAt: string | null = null;
  if (input.shotAt) {
    if (!DATE_RE.test(input.shotAt) || Number.isNaN(Date.parse(input.shotAt))) {
      return { ok: false, error: "拍摄日期格式不正确。" };
    }
    shotAt = input.shotAt;
  }

  const { data: created, error } = await supabase
    .from("photos")
    .insert({
      title,
      description: description || null,
      category_id: categoryId,
      shot_at: shotAt,
      storage_path: input.storagePath,
      width: input.width,
      height: input.height,
      blur_data_url: input.blurDataUrl || null,
      is_published: true,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !created) {
    console.error("createPhoto failed:", error?.message);
    return { ok: false, error: "保存失败，可能是数据库权限或网络问题，请稍后重试。" };
  }

  revalidatePath("/admin/photos");
  revalidatePath("/admin");

  return { ok: true, id: created.id };
}

export type UpdatePhotoState = { error?: string };

/** 修改作品信息；图片本身不换（换图请删除后重传）。 */
export async function updatePhoto(
  _prevState: UpdatePhotoState,
  formData: FormData,
): Promise<UpdatePhotoState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "登录状态已失效，请重新登录。" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: string }>();

  if (profile?.role !== "admin") return { error: "只有管理员可以修改作品。" };

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "作品编号不正确。" };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryIdRaw = String(formData.get("categoryId") ?? "");
  const shotAtRaw = String(formData.get("shotAt") ?? "");
  const isPublished = formData.get("isPublished") === "on";

  if (title.length < 1 || title.length > 80) return { error: "标题需要 1～80 个字。" };
  if (description.length > 2000) return { error: "描述最多 2000 个字。" };

  let categoryId: string | null = null;
  if (categoryIdRaw) {
    if (!UUID_RE.test(categoryIdRaw)) return { error: "分类不正确。" };
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryIdRaw)
      .maybeSingle();
    if (!category) return { error: "选择的分类不存在。" };
    categoryId = categoryIdRaw;
  }

  let shotAt: string | null = null;
  if (shotAtRaw) {
    if (!DATE_RE.test(shotAtRaw) || Number.isNaN(Date.parse(shotAtRaw))) {
      return { error: "拍摄日期格式不正确。" };
    }
    shotAt = shotAtRaw;
  }

  const { error } = await supabase
    .from("photos")
    .update({
      title,
      description: description || null,
      category_id: categoryId,
      shot_at: shotAt,
      is_published: isPublished,
    })
    .eq("id", id);

  if (error) {
    console.error("updatePhoto failed:", error.message);
    return { error: "保存失败，请稍后重试。" };
  }

  revalidatePath("/admin/photos");
  revalidatePath("/admin");
  redirect("/admin/photos");
}

export type DeleteResult = { ok: true } | { ok: false; error: string };

/** 删除作品：先删 Storage 里的三个文件，再删数据库记录。 */
export async function deletePhoto(id: string): Promise<DeleteResult> {
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

  if (profile?.role !== "admin") return { ok: false, error: "只有管理员可以删除作品。" };
  if (!UUID_RE.test(id)) return { ok: false, error: "作品编号不正确。" };

  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path")
    .eq("id", id)
    .maybeSingle<{ id: string; storage_path: string }>();

  if (!photo) return { ok: false, error: "作品不存在，可能已经被删除。" };

  const { error: storageError } = await supabase.storage
    .from("photos")
    .remove([`${photo.storage_path}-sm.webp`, `${photo.storage_path}-md.webp`, `${photo.storage_path}-lg.webp`]);

  if (storageError) {
    console.error("deletePhoto storage failed:", storageError.message);
  }

  const { error } = await supabase.from("photos").delete().eq("id", id);

  if (error) {
    console.error("deletePhoto failed:", error.message);
    return { ok: false, error: "删除失败，请稍后重试。" };
  }

  revalidatePath("/admin/photos");
  revalidatePath("/admin");

  return { ok: true };
}
