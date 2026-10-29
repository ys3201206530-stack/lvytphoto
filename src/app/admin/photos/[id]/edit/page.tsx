import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { publicPhotoUrl } from "@/lib/photo-url";
import { EditForm } from "./edit-form";
import { DeletePhotoButton } from "../../delete-button";

export const instant = false;

export const metadata = { title: "编辑作品" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type PhotoRow = {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  shot_at: string | null;
  is_published: boolean;
  storage_path: string;
  width: number;
  height: number;
  created_at: string;
};

export default async function EditPhotoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: photoData }, { data: categoryData }] = await Promise.all([
    supabase
      .from("photos")
      .select(
        "id, title, description, category_id, shot_at, is_published, storage_path, width, height, created_at",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order").order("name"),
  ]);

  const photo = photoData as PhotoRow | null;
  if (!photo) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/photos"
          className="text-[11px] tracking-[0.2em] text-faint transition-colors hover:text-muted"
        >
          ← 返回作品列表
        </Link>
        <h2 className="mt-4 font-serif text-2xl text-paper">编辑作品</h2>
      </div>

      <EditForm
        photo={{
          id: photo.id,
          title: photo.title,
          description: photo.description,
          category_id: photo.category_id,
          shot_at: photo.shot_at,
          is_published: photo.is_published,
          imageUrl: publicPhotoUrl(photo.storage_path, "md"),
          width: photo.width,
          height: photo.height,
          createdAt: photo.created_at,
        }}
        categories={categoryData ?? []}
      />

      <div className="border-t border-line pt-6">
        <DeletePhotoButton id={photo.id} title={photo.title} redirectTo="/admin/photos" />
      </div>
    </div>
  );
}
