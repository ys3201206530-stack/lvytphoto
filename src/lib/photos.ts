/**
 * 示例数据（第三阶段专用）
 * 第四阶段接入 Supabase 后，这里会被数据库查询替换。
 * background 是渐变占位，等真实照片上传后换成图片地址。
 */

export type Photo = {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  location: string;
  shotAt: string;
  /** CSS aspect-ratio 值，用于占位，防止页面跳动 */
  aspectRatio: string;
  /** 占位渐变 */
  background: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  background: string;
};

export const categories: Category[] = [
  {
    slug: "landscape",
    name: "风光",
    description: "山川、海与天光",
    background: "linear-gradient(160deg, #1b2a33 0%, #2f4048 100%)",
  },
  {
    slug: "city",
    name: "城市",
    description: "楼宇之间的呼吸",
    background: "linear-gradient(160deg, #241a16 0%, #3a2a1f 100%)",
  },
  {
    slug: "portrait",
    name: "人像",
    description: "光下的面孔",
    background: "linear-gradient(160deg, #2a1b18 0%, #4a3029 100%)",
  },
  {
    slug: "street",
    name: "街拍",
    description: "擦肩而过的瞬间",
    background: "linear-gradient(160deg, #141b23 0%, #26333d 100%)",
  },
  {
    slug: "architecture",
    name: "建筑",
    description: "线与面的秩序",
    background: "linear-gradient(160deg, #15181d 0%, #2f3742 100%)",
  },
  {
    slug: "travel",
    name: "旅行",
    description: "在别处",
    background: "linear-gradient(160deg, #12202a 0%, #26414d 100%)",
  },
];

export const photos: Photo[] = [
  {
    slug: "morning-ridge",
    title: "晨雾山脊",
    category: "风光",
    categorySlug: "landscape",
    location: "安徽 · 黄山",
    shotAt: "2025-03-18",
    aspectRatio: "4 / 5",
    background:
      "radial-gradient(90% 60% at 30% 12%, rgba(150,176,184,0.48), transparent 62%), linear-gradient(175deg, #16222b 0%, #2c3b42 45%, #0b0f11 100%)",
  },
  {
    slug: "city-breath",
    title: "城市的呼吸",
    category: "城市",
    categorySlug: "city",
    location: "重庆 · 渝中",
    shotAt: "2025-04-02",
    aspectRatio: "3 / 2",
    background:
      "radial-gradient(80% 70% at 70% 18%, rgba(214,160,110,0.40), transparent 62%), linear-gradient(160deg, #1a1512 0%, #3a2a20 55%, #0d0a09 100%)",
  },
  {
    slug: "warm-light",
    title: "她说光很暖",
    category: "人像",
    categorySlug: "portrait",
    location: "杭州 · 良渚",
    shotAt: "2025-04-20",
    aspectRatio: "4 / 5",
    background:
      "radial-gradient(70% 60% at 45% 28%, rgba(226,178,146,0.55), transparent 66%), linear-gradient(170deg, #241a16 0%, #4a3228 50%, #120c0a 100%)",
  },
  {
    slug: "after-rain",
    title: "雨后的巷口",
    category: "街拍",
    categorySlug: "street",
    location: "苏州 · 平江路",
    shotAt: "2025-05-06",
    aspectRatio: "2 / 3",
    background:
      "radial-gradient(60% 50% at 60% 22%, rgba(120,150,170,0.42), transparent 62%), linear-gradient(180deg, #101820 0%, #1f2c35 60%, #080b0e 100%)",
  },
  {
    slug: "glass-steel",
    title: "玻璃与钢筋",
    category: "建筑",
    categorySlug: "architecture",
    location: "上海 · 陆家嘴",
    shotAt: "2025-05-21",
    aspectRatio: "1 / 1",
    background:
      "linear-gradient(135deg, #12161c 0%, #2b3440 40%, #3d4956 56%, #0d1014 100%)",
  },
  {
    slug: "seventh-day",
    title: "海边的第七天",
    category: "旅行",
    categorySlug: "travel",
    location: "福建 · 平潭",
    shotAt: "2025-06-11",
    aspectRatio: "3 / 2",
    background:
      "radial-gradient(100% 80% at 70% 82%, rgba(94,140,160,0.48), transparent 66%), linear-gradient(180deg, #0f1b24 0%, #24404d 55%, #0a1216 100%)",
  },
  {
    slug: "last-bus",
    title: "末班车",
    category: "街拍",
    categorySlug: "street",
    location: "成都 · 玉林",
    shotAt: "2025-06-29",
    aspectRatio: "4 / 5",
    background:
      "radial-gradient(60% 40% at 30% 58%, rgba(200,150,90,0.38), transparent 62%), linear-gradient(168deg, #0c0f14 0%, #1b232c 55%, #070809 100%)",
  },
  {
    slug: "silent-snow",
    title: "雪落无声",
    category: "风光",
    categorySlug: "landscape",
    location: "吉林 · 长白山",
    shotAt: "2025-01-14",
    aspectRatio: "3 / 2",
    background:
      "radial-gradient(80% 60% at 50% 18%, rgba(200,214,224,0.42), transparent 72%), linear-gradient(180deg, #1b232a 0%, #39464f 50%, #12171b 100%)",
  },
  {
    slug: "rooftop-dusk",
    title: "天台上的黄昏",
    category: "城市",
    categorySlug: "city",
    location: "广州 · 海珠",
    shotAt: "2025-07-08",
    aspectRatio: "4 / 5",
    background:
      "radial-gradient(90% 60% at 65% 28%, rgba(224,150,96,0.48), transparent 62%), linear-gradient(175deg, #1c1712 0%, #3d2a1d 50%, #0e0b09 100%)",
  },
  {
    slug: "backlight",
    title: "逆光",
    category: "人像",
    categorySlug: "portrait",
    location: "青岛 · 八大关",
    shotAt: "2025-07-22",
    aspectRatio: "4 / 5",
    background:
      "radial-gradient(65% 55% at 55% 25%, rgba(236,196,150,0.50), transparent 64%), linear-gradient(172deg, #221913 0%, #47311f 52%, #100c09 100%)",
  },
  {
    slug: "old-window",
    title: "老楼的窗",
    category: "建筑",
    categorySlug: "architecture",
    location: "天津 · 五大道",
    shotAt: "2025-08-03",
    aspectRatio: "2 / 3",
    background:
      "radial-gradient(55% 45% at 40% 20%, rgba(170,150,120,0.35), transparent 62%), linear-gradient(180deg, #16130f 0%, #2e2820 58%, #0b0a08 100%)",
  },
  {
    slug: "westward-train",
    title: "向西的列车",
    category: "旅行",
    categorySlug: "travel",
    location: "甘肃 · 张掖",
    shotAt: "2025-08-19",
    aspectRatio: "3 / 2",
    background:
      "radial-gradient(90% 70% at 30% 70%, rgba(196,140,90,0.42), transparent 65%), linear-gradient(170deg, #101820 0%, #2b3630 55%, #0a0d0b 100%)",
  },
];
