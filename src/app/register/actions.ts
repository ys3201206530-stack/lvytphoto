"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = { error?: string; message?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUp(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (displayName.length < 1 || displayName.length > 20) {
    return { error: "昵称请填 1–20 个字。" };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "邮箱格式不正确。" };
  }
  if (password.length < 8) {
    return { error: "密码至少 8 位。" };
  }
  if (password !== confirm) {
    return { error: "两次输入的密码不一致。" };
  }

  const supabase = await createClient();
  // 结尾多余的斜杠会让确认邮件链接变成 https://...//account，这里统一去掉
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${siteUrl}/account`,
    },
  });

  if (error) {
    if (/already registered|already exists/i.test(error.message)) {
      return { error: "这个邮箱已经注册过了，直接登录即可。" };
    }
    if (/password/i.test(error.message)) {
      return { error: "密码不符合要求，请换一个更复杂的密码。" };
    }
    console.error("signUp failed:", error.message);
    return { error: "注册失败，请稍后重试。" };
  }

  // 关闭了“邮箱确认”时，注册后直接登录
  if (data.session) {
    redirect("/account");
  }

  return { message: "注册成功，请去邮箱点击确认链接，然后回来登录。" };
}
