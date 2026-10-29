import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "登录",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "";

  // 已登录就不需要再看登录页
  const session = await getSessionUser();
  if (session) {
    redirect(session.profile?.role === "admin" ? "/admin" : "/account");
  }

  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-md flex-col justify-center px-5 pb-20 pt-32">
      <p className="text-[11px] uppercase tracking-[0.42em] text-accent">LVYTPHOTO</p>
      <h1 className="mt-6 font-serif text-4xl tracking-wide text-paper">登录</h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        登录后可以给照片点赞、发表评论。浏览作品不需要登录。
      </p>

      <LoginForm next={next} />

      <p className="mt-10 text-xs leading-6 text-faint">
        还没有账号？{" "}
        <Link href="/register" className="text-muted underline underline-offset-4 hover:text-paper">
          注册一个
        </Link>
        <br />
        忘记密码？请联系站点作者重置。
        <br />
        <Link href="/" className="text-muted underline underline-offset-4 hover:text-paper">
          返回首页
        </Link>
      </p>
    </div>
  );
}
