import { createClient } from "@/lib/supabase/server";
import { publicPhotoUrl } from "@/lib/photo-url";
import { CategoryCovers, type CoverItem } from "./category-covers";
import { CategoryManager, type CategoryItem } from "./category-manager";

export const instant = false;

export const metadata = { title: "分类管理" };

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  cover_path?: string | null;
  photos: { count: number }[] | null;
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, photos(count)")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="border border-[#c25b4e]/60 bg-[#c25b4e]/10 px-4 py-3 text-sm text-[#e8a59c]">
        读取分类失败：{error.message}
      </div>
    );
  }

  const categories: CategoryItem[] = ((data ?? []) as CategoryRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
    photoCount: row.photos?.[0]?.count ?? 0,
  }));

  const coverItems: CoverItem[] = ((data ?? []) as CategoryRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    coverUrl: row.cover_path ? publicPhotoUrl(row.cover_path, "md") : null,
  }));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.42em] text-accent">CATEGORIES</p>
        <h2 className="mt-3 font-serif text-2xl text-paper">分类管理</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          分类决定前台作品墙的筛选入口。删除分类只是把它从列表里去掉，作品会保留并变成“未分类”。
        </p>
      </div>

      <CategoryManager categories={categories} />

      <section className="border-t border-line pt-8">
        <h3 className="font-serif text-lg tracking-wide text-paper">分类招牌图</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          给每个分类传一张代表作品，会显示在首页的「按分类浏览」卡片上。不传就继续用默认渐变。
        </p>
        <div className="mt-5">
          <CategoryCovers items={coverItems} />
        </div>
      </section>
    </div>
  );
}
