import type { Metadata } from "next";
import { MasonryGrid } from "@/components/masonry-grid";
import { PageHeader } from "@/components/page-header";
import { categories, photos } from "@/lib/photos";

export const metadata: Metadata = {
  title: "作品",
  description: "全部摄影作品：风光、城市、人像、街拍、建筑与旅行。",
};

export default function WorksPage() {
  return (
    <div className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <PageHeader
        eyebrow="Works"
        title="全部作品"
        description="按时间倒序排列。第四阶段会接入真实照片，并支持点击分类筛选。"
      />

      {/* 分类条：第四阶段变成可点击的筛选 */}
      <div className="mt-8 flex flex-wrap gap-2">
        <span className="rounded-full border border-accent px-4 py-2 text-xs tracking-[0.12em] text-accent">
          全部
        </span>
        {categories.map((category) => (
          <span
            key={category.slug}
            className="rounded-full border border-line px-4 py-2 text-xs tracking-[0.12em] text-muted"
          >
            {category.name}
          </span>
        ))}
      </div>

      <div className="mt-12 md:mt-16">
        <MasonryGrid photos={photos} />
      </div>
    </div>
  );
}
