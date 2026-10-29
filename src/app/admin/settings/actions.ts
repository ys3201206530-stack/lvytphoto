"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BackgroundResult = { ok: true } | { ok: false; error: string };
export type AboutState = { error?: string; message?: string };

const PATH_RE =
  /^site\/background-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "admin" ? supabase : null;
}

type BackgroundInput = {
  path: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
};

/** 保存新背景：先写库，再删旧文件。 */
export async function setBackground(input: BackgroundInput): Promise<BackgroundResult> {
  if (!PATH_RE.test(input.path)) {
    return { ok: false, error: "背景图存储地址不合法。" };
  }
  if (
    !Number.isInteger(input.width) ||
    !Number.isInteger(input.height) ||
    input.width < 200 ||
    input.height < 200 ||
    input.width > 8000 ||
    input.height > 8000
  ) {
    return { ok: false, error: "图片尺寸不合法。" };
  }
  if (input.blurDataUrl && input.blurDataUrl.length > 4000) {
    return { ok: false, error: "模糊占位图数据过大。" };
  }

  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "只有管理员可以更换首页背景。" };

  const { data: current } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "background")
    .maybeSingle();
  const oldPath = (current?.value as { storage_path?: string | null } | null)?.storage_path ?? null;

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "background",
      value: {
        storage_path: input.path,
        width: input.width,
        height: input.height,
        blur_data_url: input.blurDataUrl,
        updated_at: new Date().toISOString(),
      },
    },
    { onConflict: "key" },
  );

  if (error) {
    console.error("setBackground failed:", error.message);
    return { ok: false, error: "保存失败，请稍后重试。" };
  }

  if (oldPath && oldPath !== input.path) {
    await supabase.storage
      .from("photos")
      .remove([`${oldPath}-lg.webp`])
      .catch(() => undefined);
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}

/** 保存“关于我”页面的正文与联系邮箱。 */
export async function saveAbout(
  _prevState: AboutState,
  formData: FormData,
): Promise<AboutState> {
  const intro = String(formData.get("intro") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (intro.length > 6000) {
    return { error: "正文太长了，请控制在 6000 字以内。" };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "邮箱格式不正确，留空则不显示。" };
  }

  const supabase = await getAdminClient();
  if (!supabase) return { error: "只有管理员可以修改关于页面。" };

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "about",
      value: { intro, email, updated_at: new Date().toISOString() },
    },
    { onConflict: "key" },
  );

  if (error) {
    console.error("saveAbout failed:", error.message);
    return { error: `保存失败：${error.message}` };
  }

  revalidatePath("/about");
  revalidatePath("/admin/settings");
  return { message: "已保存，去看看关于页面吧。" };
}

export async function clearBackground(): Promise<BackgroundResult> {
  const supabase = await getAdminClient();
  if (!supabase) return { ok: false, error: "只有管理员可以更换首页背景。" };

  const { data: current } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "background")
    .maybeSingle();
  const oldPath = (current?.value as { storage_path?: string | null } | null)?.storage_path ?? null;

  const { error } = await supabase.from("site_settings").upsert(
    {
      key: "background",
      value: { storage_path: null, updated_at: new Date().toISOString() },
    },
    { onConflict: "key" },
  );

  if (error) {
    console.error("clearBackground failed:", error.message);
    return { ok: false, error: "保存失败，请稍后重试。" };
  }

  if (oldPath) {
    await supabase.storage
      .from("photos")
      .remove([`${oldPath}-lg.webp`])
      .catch(() => undefined);
  }

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}
