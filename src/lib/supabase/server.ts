import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 服务端（Server Component / Server Action / Route Handler）客户端。
 * 使用当前登录用户的 Cookie 发起请求，因此数据库里看到的是“这个用户”，
 * 管理员判断完全由数据库 is_admin() + RLS 完成。
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "缺少 Supabase 环境变量：请检查项目根目录的 .env.local 是否已填写 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // 在 Server Component 中渲染时不允许写 Cookie，可安全忽略：
          // 登录态的刷新由 middleware / Server Action 负责。
        }
      },
    },
  });
}
