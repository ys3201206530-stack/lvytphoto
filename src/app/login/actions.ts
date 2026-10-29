"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function signIn(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "请填写邮箱和密码。" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    if (error?.code === "email_not_confirmed") {
      return {
        error:
          "这个邮箱还没有完成确认，所以暂时不能登录。请到邮箱点确认链接；或者去 Supabase 后台 Authentication → Users 里把这个账号确认一下。",
      };
    }

    if (error?.code === "invalid_credentials") {
      // 不区分“账号不存在”和“密码错误”，避免被人试探账号
      return { error: "邮箱或密码不正确。" };
    }

    if (error?.code === "over_request_rate_limit") {
      return { error: "尝试太频繁了，请等一分钟再试。" };
    }

    console.error("signIn failed:", error?.code, error?.message);
    return { error: "登录失败，请稍后重试。" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // 只接受站内相对路径，避免被利用做跳转到外部网站
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect(target);
}
