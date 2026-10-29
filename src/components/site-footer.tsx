import Link from "next/link";
import { nav, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 md:px-10 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] tracking-[0.36em] text-paper">{site.name}</p>
            <p className="mt-5 max-w-sm text-sm leading-7 text-muted">
              {site.tagline}
            </p>
          </div>

          <nav className="flex gap-8" aria-label="页脚导航">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs tracking-[0.18em] text-muted transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[11px] tracking-wide text-faint md:flex-row md:items-center md:justify-between">
          <p>
            © {site.year} {site.name} · 保留所有权利
          </p>
          <p>照片版权归作者所有，未经许可请勿转载</p>
        </div>
      </div>
    </footer>
  );
}
