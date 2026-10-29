import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { publicPhotoUrl } from "@/lib/photo-url";

export const instant = false;

export const metadata = { title: "作品管理" };

type PhotoRow = {
  id: string;
  title: string;
  storage_path: string;
  width: number;
  height: number;
  shot_at: string | null;
  created_at: string;
  is_published: boolean;
  categories: { name: string } | { name: string }[] | null;
};

function categoryName(row: PhotoRow) {
  if (!row.categories) return "未分类";
  return Array.isArray(row.categories) ? (row.categories[0]?.name ?? "未分类") : row.categories.name;
}

export default async function PhotosPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select(
      "id, title, storage_path, width, height, shot_at, created_at, is_published, categories(name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="border border-[#c25b4e]/60 bg-[#c25b4e]/10 px-4 py-3 text-sm text-[#e8a59c]">
        读取作品失败：{error.message}
      </div>
    );
  }

  const photos = (data ?? []) as PhotoRow[];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.42em] text-accent">WORKS</p>
          <h2 className="mt-3 font-serif text-2xl text-paper">作品管理</h2>
          <p className="mt-2 text-sm text-muted">
            共 {photos.length} 张。图片存放在 Supabase Storage，信息存放在数据库。
          </p>
        </div>
        <Link
          href="/admin/photos/new"
          className="border border-accent px-5 py-2.5 text-sm tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-ink"
        >
          + 上传新作品
        </Link>
      </div>

      {photos.length === 0 ? (
        <div className="mt-12 border border-dashed border-line px-6 py-16 text-center">
          <p className="text-sm text-muted">还没有上传任何作品。</p>
          <Link
            href="/admin/photos/new"
            className="mt-4 inline-block text-xs text-accent underline-offset-4 hover:underline"
          >
            上传第一张 →
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="border border-line">
              <div
                className="relative w-full overflow-hidden bg-surface"
                style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicPhotoUrl(photo.storage_path, "sm")}
                  alt={photo.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                {!photo.is_published ? (
                  <span className="absolute left-3 top-3 bg-ink/80 px-2 py-1 text-[10px] tracking-[0.16em] text-muted">
                    草稿
                  </span>
                ) : null}
              </div>
              <div className="p-4">
                <p className="truncate text-sm text-paper">{photo.title}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-faint">
                  {categoryName(photo)}
                  {photo.shot_at ? ` · ${photo.shot_at.slice(0, 10)}` : ""}
                </p>
                <p className="mt-3 text-[10px] text-faint">
                  {photo.width} × {photo.height} · 上传于 {photo.created_at.slice(0, 10)}
                </p>
                <p className="mt-3 text-[11px] text-faint">编辑 / 删除：下一步实现</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
