import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { signOutAction } from "./actions";

export const metadata: Metadata = {
  title: "我的账号",
  robots: { index: false, follow: false },
};

export const instant = false;

function formatDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function AccountPage() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login?next=/account");
  }

  const { user, profile } = session;
  const isAdmin = profile?.role === "admin";
  const name = profile?.display_name || user.email?.split("@")[0] || "我";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.42em] text-accent">ACCOUNT</p>
      <h1 className="mt-6 font-serif text-4xl tracking-wide text-paper sm:text-5xl">
        我的账号
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        你好，{name}。这里是你的个人资料，点赞和评论会以这个昵称显示。
      </p>

      <dl className="mt-12 divide-y divide-line border-y border-line text-sm">
        <div className="flex items-center justify-between py-4">
          <dt className="text-muted">昵称</dt>
          <dd className="text-paper">{name}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-muted">邮箱</dt>
          <dd className="text-paper">{user.email}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-muted">注册时间</dt>
          <dd className="text-paper">{formatDate(user.created_at)}</dd>
        </div>
        <div className="flex items-center justify-between py-4">
          <dt className="text-muted">身份</dt>
          <dd className={isAdmin ? "text-accent" : "text-paper"}>
            {isAdmin ? "管理员" : "普通用户"}
          </dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/works"
          className="border border-line px-6 py-3 text-sm tracking-[0.14em] text-paper transition-colors hover:border-accent hover:text-accent"
        >
          浏览作品
        </Link>
        {isAdmin ? (
          <Link
            href="/admin"
            className="border border-accent px-6 py-3 text-sm tracking-[0.14em] text-accent transition-colors hover:bg-accent hover:text-ink"
          >
            进入后台
          </Link>
        ) : null}
        <form action={signOutAction}>
          <button
            type="submit"
            className="px-2 py-3 text-sm text-faint transition-colors hover:text-muted"
          >
            退出登录
          </button>
        </form>
      </div>
    </div>
  );
}
