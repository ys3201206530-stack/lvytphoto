import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70svh] w-full max-w-3xl flex-col justify-center px-5 py-32 md:px-8">
      <p className="text-[10px] uppercase tracking-[0.4em] text-accent">404</p>
      <h1 className="mt-5 text-4xl font-light tracking-tight md:text-5xl">
        这里什么都没有
      </h1>
      <p className="mt-5 max-w-md text-sm leading-7 text-muted">
        你访问的页面不存在，或者已经被移走了。可以回到首页，或者直接去看作品。
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center border border-accent px-8 text-[13px] tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-[#16130e]"
        >
          返回首页
        </Link>
        <Link
          href="/works"
          className="inline-flex h-12 items-center justify-center px-6 text-[13px] tracking-[0.18em] text-muted transition-colors hover:text-paper"
        >
          浏览作品
        </Link>
      </div>
    </div>
  );
}
