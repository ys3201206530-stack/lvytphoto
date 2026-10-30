import { createClient } from "@/lib/supabase/server";
import { publicPhotoUrl } from "@/lib/photo-url";

export type PublicPhoto = {
  id: string;
  title: string;
  description: string | null;
  shotAt: string | null;
  createdAt: string;
  width: number;
  height: number;
  storagePath: string;
  blurDataUrl: string | null;
  category: { name: string; slug: string } | null;
};

export type PublicCategory = {
  slug: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
};

type PhotoRow = {
  id: string;
  title: string;
  description: string | null;
  shot_at: string | null;
  created_at: string;
  width: number;
  height: number;
  storage_path: string;
  blur_data_url: string | null;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function normalizeCategory(
  value: PhotoRow["categories"],
): { name: string; slug: string } | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizePhoto(row: PhotoRow): PublicPhoto {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    shotAt: row.shot_at,
    createdAt: row.created_at,
    width: row.width,
    height: row.height,
    storagePath: row.storage_path,
    blurDataUrl: row.blur_data_url,
    category: normalizeCategory(row.categories),
  };
}

const PHOTO_COLUMNS =
  "id, title, description, shot_at, created_at, width, height, storage_path, blur_data_url, categories(name, slug)";

/** 前台作品列表：只取已公开的，按上传时间倒序。 */
export async function listPublishedPhotos(options?: {
  categorySlug?: string;
  limit?: number;
}): Promise<PublicPhoto[]> {
  const supabase = await createClient();
  const columns = options?.categorySlug
    ? PHOTO_COLUMNS.replace("categories(name, slug)", "categories!inner(name, slug)")
    : PHOTO_COLUMNS;

  let query = supabase
    .from("photos")
    .select(columns)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (options?.categorySlug) {
    query = query.eq("categories.slug", options.categorySlug);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("listPublishedPhotos failed:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as PhotoRow[]).map(normalizePhoto);
}

/** 单张作品详情；草稿或不存在都返回 null。 */
export async function getPublishedPhoto(id: string): Promise<PublicPhoto | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select(PHOTO_COLUMNS)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublishedPhoto failed:", error.message);
    return null;
  }
  return data ? normalizePhoto(data as unknown as PhotoRow) : null;
}

/** 前台分类列表，按排序值升序。 */
export async function listPublicCategories(): Promise<PublicCategory[]> {
  const supabase = await createClient();
  const withCover = await supabase
    .from("categories")
    .select("slug, name, description, cover_path")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  // 还没执行 0005 迁移时数据库没有 cover_path 列，回退到不带招牌图的查询
  const result = withCover.error
    ? await supabase
        .from("categories")
        .select("slug, name, description")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
    : withCover;

  if (result.error) {
    console.error("listPublicCategories failed:", result.error.message);
    return [];
  }

  return (result.data ?? []).map((row) => ({
    slug: row.slug as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    coverUrl:
      "cover_path" in row && row.cover_path
        ? publicPhotoUrl(row.cover_path as string, "md")
        : null,
  }));
}

export type PhotoComment = {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  displayName: string;
  avatarPath: string | null;
};

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  display_name: string;
  avatar_path: string | null;
};

/** 某张照片下的评论，按时间正序；作者昵称/头像由数据库函数提供。 */
export async function listPhotoComments(photoId: string): Promise<PhotoComment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("photo_comments", {
    p_photo_id: photoId,
  });

  if (error) {
    console.error("listPhotoComments failed:", error.message);
    return [];
  }

  return ((data ?? []) as CommentRow[]).map((row) => ({
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    userId: row.user_id,
    displayName: row.display_name,
    avatarPath: row.avatar_path,
  }));
}

/** 点赞总数，以及当前登录用户有没有点过。 */
export async function getPhotoLikeState(
  photoId: string,
  userId: string | null,
): Promise<{ count: number; liked: boolean }> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("photo_id", photoId);

  if (error) console.error("countLikes failed:", error.message);

  let liked = false;
  if (userId) {
    const { data } = await supabase
      .from("likes")
      .select("photo_id")
      .eq("photo_id", photoId)
      .eq("user_id", userId)
      .maybeSingle();
    liked = Boolean(data);
  }

  return { count: count ?? 0, liked };
}
