import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  display_name: string | null;
  role: "user" | "admin";
  avatar_path: string | null;
};

/** 把头像在 storage 里的路径转成可以直接放进 <img> 的公开地址。 */
export function avatarUrl(path: string | null | undefined) {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/avatars/${path}`;
}

/** 读取当前登录用户及其资料；未登录返回 null。 */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role, avatar_path")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  return { user, profile: profile ?? null };
}

/**
 * 后台页面的服务端门禁：
 * - 没登录 → 跳登录页
 * - 登录了但不是管理员 → 返回 404（不暴露后台存在）
 */
export async function requireAdmin() {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.profile?.role !== "admin") {
    notFound();
  }

  return session;
}
