import { createClient } from "@/lib/supabase/server";

export type AboutContent = {
  /** 正文，段落之间空一行 */
  intro: string;
  /** 联系邮箱，留空则不显示 */
  email: string;
};

export const DEFAULT_ABOUT: AboutContent = {
  intro: [
    "我叫 LvYT，一个把相机带在身边很多年的人。这个网站是我自己的照片仓库，也是我练习“看”的地方——看光线怎么落在墙上，看人群怎么聚拢又散开。",
    "这里不放器材评测，也不追热点。多数照片拍于清晨、傍晚和下雨天，那时的世界安静一点，我也更容易按下快门。",
    "目前收录风光、城市、人像、街拍、建筑和旅行六类。如果你喜欢其中某一张，欢迎登录后点赞或留言，我会看到。",
  ].join("\n\n"),
  email: "",
};

/** 把正文按空行切成段落。 */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

/** 读取后台保存的“关于我”内容；没保存过就用默认文案。 */
export async function getAboutContent(): Promise<AboutContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "about")
    .maybeSingle();

  const value = data?.value as Partial<AboutContent> | null;
  const intro = typeof value?.intro === "string" ? value.intro.trim() : "";
  const email = typeof value?.email === "string" ? value.email.trim() : "";

  return {
    intro: intro.length > 0 ? intro : DEFAULT_ABOUT.intro,
    email,
  };
}
