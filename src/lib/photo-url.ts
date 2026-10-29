/**
 * 由数据库里的 storage_path 拼出公开图片地址。
 * storage_path 形如 2026/10/3f2a...（不带扩展名），
 * 对应的三个文件是 <path>-sm.webp、<path>-md.webp、<path>-lg.webp。
 */

const BUCKET = "photos";

export type PhotoSlot = "sm" | "md" | "lg";

export function publicPhotoUrl(storagePath: string, slot: PhotoSlot = "md") {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!base) {
    throw new Error("缺少 NEXT_PUBLIC_SUPABASE_URL，无法生成图片地址。");
  }

  return `${base}/storage/v1/object/public/${BUCKET}/${storagePath}-${slot}.webp`;
}
