/**
 * 由数据库里的 storage_path 拼出图片地址。
 * storage_path 形如 2026/10/3f2a...（不带扩展名），
 * 对应的三个文件是 <path>-sm.webp、<path>-md.webp、<path>-lg.webp。
 *
 * 地址走站内的 /api/img 代理，而不是直连 Supabase：
 * 这样浏览器能拿到一年的强缓存，不用每次都从美国源站重新下载。
 */

export type PhotoSlot = "sm" | "md" | "lg";

export function publicPhotoUrl(storagePath: string, slot: PhotoSlot = "md") {
  return `/api/img/${storagePath}-${slot}.webp`;
}
