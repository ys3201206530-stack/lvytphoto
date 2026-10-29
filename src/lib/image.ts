/**
 * 浏览器端图片处理：把用户选的原图压成三档 WebP + 一张极小模糊占位图。
 * 只在浏览器里运行（用到 canvas / createImageBitmap），不要在任何服务端组件里调用。
 */

export const MAX_SOURCE_BYTES = 100 * 1024 * 1024;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type PhotoSlot = "sm" | "md" | "lg";

export type Variant = {
  slot: PhotoSlot;
  width: number;
  height: number;
  blob: Blob;
};

export type PreparedImage = {
  /** 最大一档的真实像素尺寸 */
  width: number;
  height: number;
  blurDataUrl: string;
  variants: Variant[];
};

const SLOTS: { slot: PhotoSlot; max: number }[] = [
  { slot: "sm", max: 480 },
  { slot: "md", max: 1280 },
  { slot: "lg", max: 2560 },
];

/** 选择文件后立即做的检查，错误信息直接给用户看。 */
export function assertUsableFile(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("只支持 JPG、PNG、WebP。iPhone 的 HEIC 照片请先在相册里导出为 JPG。");
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error("这张原图超过 100MB，请先导出成小一点的 JPG 再上传。");
  }
}

async function encode(bitmap: ImageBitmap, targetWidth: number): Promise<{ blob: Blob; width: number; height: number }> {
  const scale = Math.min(1, targetWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("当前浏览器不支持图片压缩，请换用 Chrome 或 Edge。");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.86),
  );

  if (!blob) throw new Error("图片压缩失败，请换一张试试。");
  if (blob.type !== "image/webp") {
    throw new Error("当前浏览器不支持 WebP 压缩，请换用最新版 Chrome 或 Edge。");
  }

  return { blob, width, height };
}

function makeBlur(bitmap: ImageBitmap): string {
  const width = 20;
  const height = Math.max(1, Math.round((bitmap.height / bitmap.width) * width));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(bitmap, 0, 0, width, height);

  const webp = canvas.toDataURL("image/webp", 0.4);
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.5);
}

/**
 * 把一张原图压成 sm/md/lg 三档。
 * onStep 用来在界面上显示「正在压缩中图…」这类文字。
 */
export async function prepareImage(
  file: File,
  onStep?: (label: string) => void,
): Promise<PreparedImage> {
  assertUsableFile(file);

  onStep?.("正在读取图片…");
  // imageOrientation: "from-image" 会自动把手机竖拍的方向转正
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      "浏览器无法解码这张图片，可能是尺寸过大或格式特殊。请先导出为 JPG（长边不超过 8000 像素）再试。",
    );
  }

  try {
    const variants: Variant[] = [];

    for (const { slot, max } of SLOTS) {
      onStep?.(
        slot === "sm" ? "正在生成缩略图…" : slot === "md" ? "正在压缩中图…" : "正在压缩大图…",
      );
      const out = await encode(bitmap, max);
      variants.push({ slot, ...out });
    }

    onStep?.("正在生成模糊占位图…");
    const blurDataUrl = makeBlur(bitmap);
    const largest = variants[variants.length - 1];

    return {
      width: largest.width,
      height: largest.height,
      blurDataUrl,
      variants,
    };
  } finally {
    bitmap.close();
  }
}

export type PreparedBackground = {
  width: number;
  height: number;
  blurDataUrl: string;
  blob: Blob;
};

/** 首页背景图只需要一张大图（最长边 2560）。 */
export async function prepareBackground(
  file: File,
  onStep?: (label: string) => void,
): Promise<PreparedBackground> {
  assertUsableFile(file);

  onStep?.("正在读取图片…");
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error(
      "浏览器无法解码这张图片，请先导出为 JPG（长边不超过 8000 像素）再试。",
    );
  }

  try {
    onStep?.("正在压缩背景图…");
    const out = await encode(bitmap, 2560);
    onStep?.("正在生成模糊占位图…");
    return { ...out, blurDataUrl: makeBlur(bitmap) };
  } finally {
    bitmap.close();
  }
}

/** 头像：居中裁成正方形，512px WebP。 */
export async function prepareAvatar(file: File): Promise<Blob> {
  assertUsableFile(file);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("浏览器无法解码这张图片，请换一张 JPG 或 PNG。");
  }

  try {
    const size = 512;
    const side = Math.min(bitmap.width, bitmap.height);
    const sx = (bitmap.width - side) / 2;
    const sy = (bitmap.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("当前浏览器不支持图片处理，请换用 Chrome 或 Edge。");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.9),
    );

    if (!blob) throw new Error("头像处理失败，请换一张试试。");
    return blob;
  } finally {
    bitmap.close();
  }
}
