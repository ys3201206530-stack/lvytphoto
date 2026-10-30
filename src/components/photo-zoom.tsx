"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PhotoZoomProps = {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  alt: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_CLICK_SCALE = 2.5;

/** 把拖动范围限制在图片边缘，避免把照片拖出屏幕。 */
function clampOffset(
  el: HTMLDivElement | null,
  x: number,
  y: number,
  scale: number,
) {
  if (!el) return { x, y };
  const rect = el.getBoundingClientRect();
  const maxX = Math.max(0, ((scale - 1) * rect.width) / 2);
  const maxY = Math.max(0, ((scale - 1) * rect.height) / 2);
  return {
    x: Math.max(-maxX, Math.min(maxX, x)),
    y: Math.max(-maxY, Math.min(maxY, y)),
  };
}

/**
 * 详情页大图：点击后全屏查看。
 * - 电脑：滚轮缩放，按住拖动
 * - 手机：双指缩放，单指拖动
 * - 关闭：右上角、Esc、点空白处
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
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const boxRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const applyScale = useCallback((next: number) => {
    const value = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    scaleRef.current = value;
    setScale(value);
    setOffset((prev) =>
      value === 1
        ? { x: 0, y: 0 }
        : clampOffset(boxRef.current, prev.x, prev.y, value),
    );
  }, []);

  const applyScaleRef = useRef(applyScale);
  applyScaleRef.current = applyScale;

  const close = useCallback(() => {
    setOpen(false);
    setScale(1);
    scaleRef.current = 1;
    setOffset({ x: 0, y: 0 });
    pointers.current.clear();
    pinchStart.current = null;
    dragStart.current = null;
  }, []);

  // Esc 关闭 + 锁住页面滚动
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  // 滚轮缩放：必须用原生监听才能 preventDefault，避免整页跟着滚
  useEffect(() => {
    if (!open) return;
    const el = boxRef.current;
    if (!el) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const factor = Math.exp(-event.deltaY * 0.0015);
      applyScaleRef.current(scaleRef.current * factor);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [open]);

  const distanceBetween = (points: { x: number; y: number }[]) => {
    const [a, b] = points;
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const box = event.currentTarget;
    box.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    moved.current = false;

    if (pointers.current.size === 1) {
      dragStart.current = { x: event.clientX, y: event.clientY };
    } else if (pointers.current.size === 2) {
      pinchStart.current = {
        distance: distanceBetween([...pointers.current.values()]),
        scale: scaleRef.current,
      };
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = [...pointers.current.values()];

    if (points.length >= 2) {
      const distance = distanceBetween(points);
      if (!pinchStart.current) {
        pinchStart.current = { distance, scale: scaleRef.current };
        return;
      }
      moved.current = true;
      // 以双指刚按下时的距离为基准（不累积），避免一次手势里越缩越快
      applyScaleRef.current(
        pinchStart.current.scale * (distance / pinchStart.current.distance),
      );
      return;
    }

    if (dragStart.current && scaleRef.current > 1) {
      const dx = event.clientX - dragStart.current.x;
      const dy = event.clientY - dragStart.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) moved.current = true;
      dragStart.current = { x: event.clientX, y: event.clientY };
      setOffset((prev) =>
        clampOffset(
          boxRef.current,
          prev.x + dx,
          prev.y + dy,
          scaleRef.current,
        ),
      );
    }
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) dragStart.current = null;
  };

  const onBoxClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // 只处理点空白处：点图片、拖拽之后都不关闭
    if (event.target !== event.currentTarget) return;
    if (moved.current) {
      moved.current = false;
      return;
    }
    close();
  };

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
            点击查看大图
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
            ref={boxRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={onBoxClick}
            onDoubleClick={() =>
              applyScale(scaleRef.current > 1 ? 1 : DOUBLE_CLICK_SCALE)
            }
            style={{
              minHeight: 0,
              overflow: "hidden",
              touchAction: "none",
              cursor: scale > 1 ? "grab" : "zoom-in",
            }}
            className="flex flex-1 items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              width={width}
              height={height}
              alt={alt}
              draggable={false}
              className="max-h-full max-w-full object-contain select-none"
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
                transformOrigin: "center center",
                willChange: "transform",
              }}
            />
          </div>

          <p className="shrink-0 px-5 py-4 text-center text-[10px] tracking-[0.2em] text-white/45">
            {scale > 1
              ? "拖动查看细节 · 滚轮 / 双指继续缩放"
              : "滚轮或双指缩放 · 双击放大 · 点空白处关闭"}
          </p>
        </div>
      ) : null}
    </>
  );
}
