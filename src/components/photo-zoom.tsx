"use client";

import { useEffect, useRef, useState } from "react";

type PhotoZoomProps = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  alt: string;
};

/**
 * 详情页的大图：点击后全屏查看，再点图片可以按原始尺寸放大 / 还原。
 * 关闭方式：右上角「关闭」、按 Esc、点空白处。
 */
export function PhotoZoom({
  src,
  srcSet,
  sizes,
  width,
  height,
  alt,
}: PhotoZoomProps) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 放大后把视野移到照片中间，避免一打开只看到一块天空
  useEffect(() => {
    if (!zoomed) return;
    // 等图片按新尺寸完成布局后再居中
    const timer = window.setTimeout(() => {
      const box = scrollRef.current;
      if (!box) return;
      box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2;
      box.scrollTop = (box.scrollHeight - box.clientHeight) / 2;
    }, 60);
    return () => window.clearTimeout(timer);
  }, [zoomed]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setZoomed(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setZoomed(false);
  };

  // 放大的目标宽度：不超过 2560（我们保存的最大边），也不小于 1200
  const zoomWidth = Math.min(Math.max(width, 1200), 2560);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`放大查看：${alt}`}
        className="group relative block cursor-zoom-in"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          width={width}
          height={height}
          alt={alt}
          fetchPriority="high"
          decoding="async"
          className="max-h-[78vh] w-auto max-w-full object-contain"
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="bg-black/60 px-3 py-1.5 text-[10px] tracking-[0.2em] text-white/85 uppercase">
            点击放大
          </span>
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          style={{ zIndex: 90, backgroundColor: "#000" }}
          className="fixed inset-0 flex flex-col"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 px-5 py-4">
            <span className="truncate text-xs tracking-wide text-white/70">
              {alt}
            </span>
            <button
              type="button"
              onClick={close}
              className="shrink-0 border border-white/25 px-3 py-1.5 text-[11px] tracking-[0.18em] text-white/80 transition-colors hover:border-white/60 hover:text-white"
            >
              关闭 ✕
            </button>
          </div>

          <div
            ref={scrollRef}
            style={{ minHeight: 0, overflow: zoomed ? "auto" : "hidden" }}
            className={
              zoomed
                ? "min-h-0 flex-1 overflow-auto"
                : "flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4"
            }
            onClick={zoomed ? undefined : close}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt={alt}
              onClick={(event) => {
                event.stopPropagation();
                setZoomed((value) => !value);
              }}
              className={
                zoomed
                  ? "max-w-none cursor-zoom-out"
                  : "max-h-full max-w-full cursor-zoom-in object-contain"
              }
              style={zoomed ? { width: `${zoomWidth}px`, maxWidth: "none" } : undefined}
            />
          </div>

          <p className="shrink-0 px-5 py-4 text-center text-[10px] tracking-[0.2em] text-white/45">
            {zoomed ? "点击图片还原 · 可上下左右拖动" : "点击图片放大 · 点空白处关闭"}
          </p>
        </div>
      ) : null}
    </>
  );
}
