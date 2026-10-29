import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { signOut } from "./actions";

export const instant = false;

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  // 后台必须请求时校验身份，不能被预渲染成静态页面
  await connection();
  const { user, profile } = await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-28 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.42em] text-accent">ADMIN</p>
          <h1 className="mt-3 font-serif text-3xl tracking-wide text-paper">作品后台</h1>
        </div>

        <div className="flex items-center gap-5 text-xs text-muted">
          <span>{profile?.display_name ?? user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="border border-line px-4 py-2 tracking-[0.16em] transition-colors duration-300 hover:border-line-strong hover:text-paper"
            >
              退出登录
            </button>
          </form>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-6 text-sm">
        <Link href="/admin" className="text-paper">
          概览
        </Link>
        <Link href="/admin/photos" className="text-muted transition-colors hover:text-paper">
          作品管理
        </Link>
        <Link href="/admin/photos/new" className="text-muted transition-colors hover:text-paper">
          上传作品
        </Link>
        <Link href="/admin/categories" className="text-muted transition-colors hover:text-paper">
          分类管理
        </Link>
        <Link href="/admin/settings" className="text-muted transition-colors hover:text-paper">
          站点背景
        </Link>
        <Link href="/admin/comments" className="text-muted transition-colors hover:text-paper">
          评论管理
        </Link>
      </nav>

      <div className="mt-10">{children}</div>
    </div>
  );
}
