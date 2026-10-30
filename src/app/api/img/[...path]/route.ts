import { NextResponse } from "next/server";

/**
 * 图片代理：把 Supabase Storage 的图片转成同源地址，并强制长缓存。
 *
 * 为什么需要它：Supabase 免费版的公开图片响应头是 `Cache-Control: private, no-cache`，
 * 浏览器每次打开详情页都会重新下载；而图片源站在美国，单次要 0.8–1.6 秒。
 * 经过这里之后，浏览器和 Vercel 边缘节点都会把图片缓存一年，只有第一次慢。
 */

const BUCKET = "photos";
const KEY_RE = /^[A-Za-z0-9][A-Za-z0-9/_.-]*$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const key = path.join("/");
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");

  if (!base || !KEY_RE.test(key) || key.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const upstream = await fetch(
    `${base}/storage/v1/object/public/${BUCKET}/${key}`,
    { cache: "no-store" },
  );

  if (!upstream.ok || !upstream.body) {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "image/webp",
    "Cache-Control":
      "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
  });

  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new NextResponse(upstream.body, { status: 200, headers });
}
