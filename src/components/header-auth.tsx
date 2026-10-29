import Link from "next/link";
import { UserGlyph } from "@/components/user-glyph";
import { signOutAction } from "@/app/account/actions";
import { avatarUrl, getSessionUser } from "@/lib/auth";

/**
 * 顶栏的登录状态。
 * 在服务端读取 Supabase Cookie，所以登录后立刻正确、不闪、也不依赖浏览器再请求一次。
 */
export async function HeaderAuth() {
  const session = await getSessionUser();

  if (!session) {
    return (
      <>
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/login"
            className="text-[13px] tracking-[0.18em] text-muted transition-colors hover:text-paper"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="border border-line px-4 py-2 text-[12px] tracking-[0.16em] text-paper transition-colors hover:border-accent hover:text-accent"
          >
            注册
          </Link>
        </div>

        <div className="mt-8 flex gap-3 border-t border-line pt-7 md:hidden">
          <Link
            href="/login"
            className="flex-1 border border-line py-3 text-center text-sm tracking-[0.14em] text-paper"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="flex-1 border border-accent py-3 text-center text-sm tracking-[0.14em] text-accent"
          >
            注册
          </Link>
        </div>
      </>
    );
  }

  const name =
    session.profile?.display_name || session.user.email?.split("@")[0] || "我";
  const isAdmin = session.profile?.role === "admin";
  const avatar = avatarUrl(session.profile?.avatar_path);

  const avatarBadge = (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        <UserGlyph className="h-4 w-4 text-muted" />
      )}
    </span>
  );

  return (
    <>
      <div className="hidden items-center gap-5 md:flex">
        {isAdmin ? (
          <Link
            href="/admin"
            className="text-[12px] tracking-[0.16em] text-accent transition-opacity hover:opacity-80"
          >
            后台
          </Link>
        ) : null}
        <Link
          href="/account"
          className="flex items-center gap-2.5 text-[13px] tracking-[0.16em] text-paper transition-colors hover:text-accent"
        >
          {avatarBadge}
          <span>{name}</span>
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-[12px] tracking-[0.16em] text-faint transition-colors hover:text-muted"
          >
            退出
          </button>
        </form>
      </div>

      <div className="mt-8 space-y-4 border-t border-line pt-7 md:hidden">
        <Link
          href="/account"
          className="flex items-center gap-3 text-sm tracking-[0.14em] text-paper"
        >
          {avatarBadge}
          <span>我的账号 · {name}</span>
        </Link>
        {isAdmin ? (
          <Link href="/admin" className="block text-sm tracking-[0.14em] text-accent">
            进入后台
          </Link>
        ) : null}
        <form action={signOutAction}>
          <button type="submit" className="text-xs tracking-[0.14em] text-faint">
            退出登录
          </button>
        </form>
      </div>
    </>
  );
}
