"use client";

import { useEffect, useState } from "react";

type Phase = "idle" | "leaving" | "done";

const SEEN_KEY = "lvyt-intro-played";

/**
 * 首屏入场动画：一层深色幕布盖住页面，品牌字与金线出现后向上收起。
 * - 每个标签页只播放一次（sessionStorage）
 * - 系统开启「减少动态效果」时直接跳过
 * - 没有 JS 时由 layout 里的 noscript 样式隐藏
 */
export function IntroCurtain() {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let played = false;
    try {
      played = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      played = false;
    }

    if (reduce || played) {
      setPhase("done");
      return;
    }

    document.body.style.overflow = "hidden";
    const leaveTimer = window.setTimeout(() => setPhase("leaving"), 1150);
    const doneTimer = window.setTimeout(() => {
      setPhase("done");
      document.body.style.overflow = "";
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* 隐私模式下存不了就每次都播，不影响功能 */
      }
    }, 1850);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "done") return null;

  const leaving = phase === "leaving";

  return (
    <div
      id="intro-curtain"
      aria-hidden
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 100,
        backgroundColor: "#0b0b0c",
        transform: leaving ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 700ms cubic-bezier(0.76, 0, 0.24, 1)",
      }}
    >
      <div
        className="text-center"
        style={{
          opacity: leaving ? 0 : 1,
          transform: leaving ? "translateY(-16px)" : "translateY(0)",
          transition: "opacity 420ms ease, transform 480ms ease",
        }}
      >
        <p className="intro-brand text-[15px] tracking-[0.5em] text-paper">lvyt.top</p>
        <span className="intro-line mx-auto mt-6 block h-px w-16 bg-[#c8a97e]/70" />
        <p className="intro-caption mt-6 text-[10px] tracking-[0.42em] text-[#6a6a70]">
          PERSONAL PHOTOGRAPHY
        </p>
      </div>
    </div>
  );
}
