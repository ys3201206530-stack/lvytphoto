import type { Metadata } from "next";
import Link from "next/link";
import { getAboutContent, splitParagraphs } from "@/lib/about-content";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 lvytphoto 和这里记录的照片。",
};

export const instant = false;

export default async function AboutPage() {
  const about = await getAboutContent();
  const paragraphs = splitParagraphs(about.intro);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <p className="text-[10px] uppercase tracking-[0.4em] text-accent">About</p>
      <h1 className="mt-5 text-4xl font-light tracking-tight md:text-5xl">
        关于我
      </h1>

      <div className="mt-10 space-y-6 text-[15px] leading-8 text-muted">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="whitespace-pre-line">
            {paragraph}
          </p>
        ))}
      </div>

      {about.email ? (
        <div className="mt-14 border-t border-line pt-8">
          <p className="text-[10px] uppercase tracking-[0.32em] text-faint">
            Contact
          </p>
          <p className="mt-3 text-sm text-muted">
            邮箱：
            <a
              href={`mailto:${about.email}`}
              className="text-paper underline-offset-4 transition-colors hover:text-accent hover:underline"
            >
              {about.email}
            </a>
          </p>
        </div>
      ) : null}

      <Link
        href="/works"
        className="group mt-12 inline-flex items-center gap-2 text-[13px] tracking-[0.14em] text-muted transition-colors hover:text-accent"
      >
        去看作品
        <span className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </div>
  );
}
