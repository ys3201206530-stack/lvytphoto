export const site = {
  /** 站点名，显示在导航、页脚、浏览器标签 */
  name: "lvyt.art",
  /** 一句话简介，显示在首页主视觉 */
  tagline: "光与影之间，收藏每一次遇见。",
  /** 首页与关于页的介绍文字 */
  intro:
    "这里记录我在路上看见的光、颜色和安静的时刻。相机只是借口，走出去才是目的。",
  /** 占位邮箱，第五阶段后台可改 */
  email: "hi@lvyt.art",
  year: 2025,
} as const;

export const nav = [
  { href: "/", label: "首页" },
  { href: "/works", label: "作品" },
  { href: "/about", label: "关于" },
] as const;
