"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type LikeResult =
  | { ok: true; liked: boolean; count: number }
  | { ok: false; needLogin: true }
  | { ok: false; needLogin?: false; error: string };

/** 点赞 / 取消点赞。数据库主键 (photo_id, user_id) 保证一人一图只有一个赞。 */
export async function toggleLike(photoId: string): Promise<LikeResult> {
  if (!UUID_RE.test(photoId)) return { ok: false, error: "参数不正确。" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, needLogin: true };

  const { data: existing, error: readError } = await supabase
    .from("likes")
    .select("photo_id")
    .eq("photo_id", photoId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    console.error("toggleLike read failed:", readError.message);
    return { ok: false, error: "点赞失败，请稍后再试。" };
  }

  if (existing) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("photo_id", photoId)
      .eq("user_id", user.id);
    if (error) {
      console.error("toggleLike delete failed:", error.message);
      return { ok: false, error: "取消点赞失败，请稍后再试。" };
    }
  } else {
    const { error } = await supabase
      .from("likes")
      .insert({ photo_id: photoId, user_id: user.id });
    // 23505 = 并发下重复点赞，数据库已经挡住了，当作成功处理
    if (error && error.code !== "23505") {
      console.error("toggleLike insert failed:", error.message);
      return { ok: false, error: "点赞失败，请稍后再试。" };
    }
  }

  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("photo_id", photoId);

  revalidatePath(`/photo/${photoId}`);
  return { ok: true, liked: !existing, count: count ?? 0 };
}

export type CommentState = { ok?: boolean; error?: string };

/** 发表评论：必须登录，内容 1–1000 字（数据库也有同样的约束）。 */
export async function addComment(
  _prev: CommentState,
  formData: FormData,
): Promise<CommentState> {
  const photoId = String(formData.get("photo_id") ?? "");
  const content = String(formData.get("content") ?? "").trim();

  if (!UUID_RE.test(photoId)) return { error: "参数不正确。" };
  if (!content) return { error: "写点什么再发送吧。" };
  if (content.length > 1000) return { error: "评论最多 1000 个字。" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "请先登录再评论。" };

  const { error } = await supabase
    .from("comments")
    .insert({ photo_id: photoId, user_id: user.id, content });

  if (error) {
    console.error("addComment failed:", error.message);
    return { error: "评论发送失败，请稍后再试。" };
  }

  revalidatePath(`/photo/${photoId}`);
  return { ok: true };
}

/** 删除评论：数据库权限允许“本人或管理员”，这里只负责发请求。 */
export async function deleteComment(
  commentId: string,
  photoId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!UUID_RE.test(commentId) || !UUID_RE.test(photoId)) {
    return { ok: false, error: "参数不正确。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "请先登录。" };

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) {
    console.error("deleteComment failed:", error.message);
    return { ok: false, error: "删除失败，可能没有权限。" };
  }

  revalidatePath(`/photo/${photoId}`);
  revalidatePath("/admin/comments");
  return { ok: true };
}
