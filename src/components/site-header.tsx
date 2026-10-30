"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { nav, site } from "@/lib/site";

export function SiteHeader({ authSlot }: { authSlot?: ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 路由变化时收起手机菜单
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 菜单打开时锁定页面滚动，并支持 Esc 关闭
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // 首页顶部透明，滚动后或进入其它页面时显示底色；
  // 菜单展开时强制去掉 backdrop-blur：backdrop-filter 会让 header 成为 fixed 子元素的包含块，
  // 滚动过（或不在首页）时抽屉会被压成 64px 高，看起来就像“点了没反应”。
  const solid = (scrolled || pathname !== "/") && !open;

  return (
    <>
      <header
        style={{ zIndex: 70 }}
        className={`fixed inset-x-0 top-0 transition-colors duration-300 ${
          solid ? "lv-glass-bar" : "border-b border-transparent"
        }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-5 md:h-[72px] md:px-10">
        <Link
          href="/"
          className="text-[13px] font-light tracking-[0.36em] text-paper transition-colors hover:text-accent"
        >
          {site.name}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-8" aria-label="主导航">
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative text-[13px] tracking-[0.18em] transition-colors ${
                  active ? "text-paper" : "text-muted hover:text-paper"
                }`}
              >
                {item.label}
                <span
                  className={`absolute -bottom-2 left-0 h-px bg-accent transition-all duration-300 ${
                    active ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            );
          })}
          </nav>
          {authSlot}
        </div>

        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="relative z-[60] -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
        >
          <span className="sr-only">菜单</span>
          <span
            className={`absolute h-px w-5 bg-paper transition-transform duration-300 ${
              open ? "rotate-45" : "-translate-y-1.5"
            }`}
          />
          <span
            className={`absolute h-px w-5 bg-paper transition-opacity duration-300 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute h-px w-5 bg-paper transition-transform duration-300 ${
              open ? "-rotate-45" : "translate-y-1.5"
            }`}
          />
        </button>
      </div>
    </header>

    {/* 抽屉放在 header 外面：Safari 里 header 的 backdrop-filter 会把 fixed 子元素锁在 header 的盒子里 */}
    {open && (
      <div
        style={{ zIndex: 60 }}
        className="fixed inset-0 bg-ink/95 md:hidden"
      >
          <nav
            className="flex h-full flex-col justify-center gap-2 px-8"
            aria-label="手机导航"
          >
            {nav.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className="animate-fade-up border-b border-line py-5 text-3xl font-light tracking-wide text-paper"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                {item.label}
              </Link>
            ))}
            {authSlot}
            <p className="mt-10 text-xs leading-6 tracking-[0.2em] text-faint">
              {site.tagline}
            </p>
          </nav>
        </div>
      )}
    </>
  );
}
