import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "关于",
  description: "关于 lvytphoto 和这里记录的照片。",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
      <p className="text-[10px] uppercase tracking-[0.4em] text-accent">About</p>
      <h1 className="mt-5 text-4xl font-light tracking-tight md:text-5xl">
        关于我
      </h1>

      <div className="mt-10 space-y-6 text-[15px] leading-8 text-muted">
        <p>
          我叫 LvYT，一个把相机带在身边很多年的人。这个网站是我自己的照片仓库，
          也是我练习“看”的地方——看光线怎么落在墙上，看人群怎么聚拢又散开。
        </p>
        <p>
          这里不放器材评测，也不追热点。多数照片拍于清晨、傍晚和下雨天，
          那时的世界安静一点，我也更容易按下快门。
        </p>
        <p>
          目前收录风光、城市、人像、街拍、建筑和旅行六类。如果你喜欢其中某一张，
          欢迎登录后点赞或留言，我会看到。
        </p>
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <p className="text-[10px] uppercase tracking-[0.32em] text-faint">
          Contact
        </p>
        <p className="mt-3 text-sm text-muted">
          邮箱：
          <span className="text-paper">{site.email}</span>
          （示例地址，第五阶段可在后台修改）
        </p>
      </div>

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
