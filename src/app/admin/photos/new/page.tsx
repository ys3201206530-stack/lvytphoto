import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "./upload-form";

export const instant = false;

export const metadata = { title: "上传作品" };

export default async function NewPhotoPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.42em] text-accent">UPLOAD</p>
          <h2 className="mt-3 font-serif text-2xl text-paper">上传新作品</h2>
          <p className="mt-2 text-sm text-muted">
            选择照片、填写信息，压缩和上传都会在你的浏览器里完成。
          </p>
        </div>
        <Link
          href="/admin/photos"
          className="text-xs text-faint transition-colors hover:text-muted"
        >
          ← 返回作品列表
        </Link>
      </div>

      <div className="mt-8 max-w-3xl">
        <UploadForm categories={categories ?? []} />
      </div>
    </div>
  );
}
