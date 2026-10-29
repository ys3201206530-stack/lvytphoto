"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export type ProfileState = { error?: string; message?: string };

const AVATAR_PATH_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/avatar-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/;

/** 修改昵称：只能改自己的，长度 1–20。 */
export async function updateNickname(
  _previous: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const name = String(formData.get("display_name") ?? "").trim();

  if (name.length < 1 || name.length > 20) {
    return { error: "昵称请填 1–20 个字。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "登录状态已失效，请重新登录。" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", user.id);

  if (error) {
    console.error("updateNickname failed:", error.code, error.message);
    return { error: "保存失败，请稍后重试。" };
  }

  revalidatePath("/", "layout");
  return { message: "昵称已更新。" };
}

export type AvatarResult = { ok: true } | { ok: false; error: string };

/** 保存新头像路径，并删掉旧文件。 */
export async function updateAvatar(path: string): Promise<AvatarResult> {
  if (!AVATAR_PATH_RE.test(path)) {
    return { ok: false, error: "头像地址不合法。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "登录状态已失效，请重新登录。" };
  }

  // 只能写到自己 id 开头的目录
  if (!path.startsWith(`${user.id}/`)) {
    return { ok: false, error: "头像地址不合法。" };
  }

  const { data: current } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle<{ avatar_path: string | null }>();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", user.id);

  if (error) {
    console.error("updateAvatar failed:", error.code, error.message);
    return { ok: false, error: "头像保存失败，请稍后重试。" };
  }

  const old = current?.avatar_path;
  if (old && old !== path) {
    await supabase.storage.from("avatars").remove([old]);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

/** 恢复默认头像。 */
export async function removeAvatar(): Promise<AvatarResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "登录状态已失效，请重新登录。" };
  }

  const { data: current } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle<{ avatar_path: string | null }>();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: "恢复失败，请稍后重试。" };
  }

  if (current?.avatar_path) {
    await supabase.storage.from("avatars").remove([current.avatar_path]);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
