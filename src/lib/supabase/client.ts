import { createBrowserClient } from "@supabase/ssr";

/**
 * 浏览器端 Supabase 客户端。
 * 只使用 anon（可公开的）密钥，真正的权限由数据库 RLS 控制。
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "缺少 Supabase 环境变量：请检查项目根目录的 .env.local 是否已填写 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createBrowserClient(url, key);
}
