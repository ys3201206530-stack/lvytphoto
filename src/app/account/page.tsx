import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserGlyph } from "@/components/user-glyph";
import { avatarUrl, getSessionUser } from "@/lib/auth";
import { signOutAction } from "./actions";
import { AvatarForm } from "./avatar-form";
import { NameForm } from "./name-form";

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
  const avatar = avatarUrl(profile?.avatar_path);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-32 sm:px-8">
      <p className="text-[11px] uppercase tracking-[0.42em] text-accent">ACCOUNT</p>
      <h1 className="mt-6 font-serif text-4xl tracking-wide text-paper sm:text-5xl">
        我的账号
      </h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        你好，{name}。点赞和评论会以这里的昵称和头像显示。
      </p>

      <div className="mt-8 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <UserGlyph className="h-6 w-6 text-faint" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm text-paper">{name}</p>
          <p className="truncate text-xs text-faint">{user.email}</p>
        </div>
      </div>

      <section className="mt-12 border-t border-line pt-8">
        <h2 className="text-sm tracking-[0.2em] text-muted">头像</h2>
        <div className="mt-6">
          <AvatarForm userId={user.id} currentUrl={avatar} />
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="text-sm tracking-[0.2em] text-muted">昵称</h2>
        <div className="mt-6">
          <NameForm current={name} />
        </div>
        <p className="mt-3 text-xs text-faint">1–20 个字，保存后全站立刻生效。</p>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="text-sm tracking-[0.2em] text-muted">账号信息</h2>
        <dl className="mt-4 divide-y divide-line border-b border-line text-sm">
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
      </section>

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
