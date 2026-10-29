import { createClient } from "@/lib/supabase/server";
import { publicPhotoUrl } from "@/lib/photo-url";

export type SiteBackground = {
  url: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
};

export type BackgroundRecord = {
  path: string;
  width: number;
  height: number;
  blurDataUrl: string | null;
};

type BackgroundValue = {
  storage_path?: string | null;
  width?: number | null;
  height?: number | null;
  blur_data_url?: string | null;
};

/** 后台读完整记录（需要 storage_path 才能删除旧文件）。 */
export async function getBackgroundRecord(): Promise<BackgroundRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "background")
    .maybeSingle();

  if (error || !data) return null;

  const value = data.value as BackgroundValue | null;
  if (!value?.storage_path) return null;

  return {
    path: value.storage_path,
    width: value.width ?? 2560,
    height: value.height ?? 1440,
    blurDataUrl: value.blur_data_url ?? null,
  };
}

/** 前台首页用：没有设置或读取失败就返回 null，页面回落到默认渐变。 */
export async function getSiteBackground(): Promise<SiteBackground | null> {
  const record = await getBackgroundRecord();
  if (!record) return null;

  return {
    url: publicPhotoUrl(record.path, "lg"),
    width: record.width,
    height: record.height,
    blurDataUrl: record.blurDataUrl,
  };
}
