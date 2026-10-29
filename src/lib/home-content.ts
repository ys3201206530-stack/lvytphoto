import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";

export type HomeContent = {
  /** 主视觉上方的小字，例如 PERSONAL PHOTOGRAPHY */
  eyebrow: string;
  /** 首页大标题 */
  title: string;
  /** 大标题下面的一句话 */
  tagline: string;
};

export const DEFAULT_HOME: HomeContent = {
  eyebrow: "Personal Photography",
  title: site.name,
  tagline: site.tagline,
};

/** 读取后台保存的首页主视觉文案；没保存过就用默认文案。 */
export async function getHomeContent(): Promise<HomeContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "homepage")
    .maybeSingle();

  const value = data?.value as Partial<HomeContent> | null;
  const read = (key: keyof HomeContent) => {
    const raw = value?.[key];
    return typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : DEFAULT_HOME[key];
  };

  return {
    eyebrow: read("eyebrow"),
    title: read("title"),
    tagline: read("tagline"),
  };
}
