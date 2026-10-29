"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { assertUsableFile, prepareBackground } from "@/lib/image";
import { clearBackground, setBackground } from "./actions";

export function BackgroundForm({ hasBackground }: { hasBackground: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      assertUsableFile(file);

      const prepared = await prepareBackground(file, (label) => setMessage(label));

      setMessage("正在上传…");
      const supabase = createClient();
      const path = `site/background-${crypto.randomUUID()}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(`${path}-lg.webp`, prepared.blob, {
          contentType: "image/webp",
          upsert: false,
          cacheControl: "31536000",
        });

      if (uploadError) {
        throw new Error(`上传失败：${uploadError.message}`);
      }

      setMessage("正在保存…");
      const result = await setBackground({
        path,
        width: prepared.width,
        height: prepared.height,
        blurDataUrl: prepared.blurDataUrl || null,
      });

      if (!result.ok) {
        await supabase.storage
          .from("photos")
          .remove([`${path}-lg.webp`])
          .catch(() => undefined);
        throw new Error(result.error);
      }

      setMessage("背景已更新。刷新首页就能看到。");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "上传失败，请重试。");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function reset() {
    if (!window.confirm("恢复默认渐变背景？已上传的背景图会被删除。")) return;

    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await clearBackground();
      if (result.ok) {
        setMessage("已恢复默认背景。");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-8 border-t border-line pt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || pending}
          className="inline-flex h-11 items-center justify-center border border-accent px-6 text-[13px] tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-[#16130e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "处理中…" : hasBackground ? "更换背景图" : "上传背景图"}
        </button>

        <button
          type="button"
          onClick={reset}
          disabled={busy || pending || !hasBackground}
          className="inline-flex h-11 items-center justify-center border border-line px-5 text-xs tracking-[0.12em] text-muted transition-colors hover:border-line-strong hover:text-paper disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "恢复中…" : "恢复默认渐变"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>

      <p className="mt-4 text-xs leading-6 text-faint">
        建议用横构图；单张不超过 100MB，会自动压成最长边 2560 的 WebP，墙上的文字仍然清晰可见。
      </p>

      {message ? <p className="mt-3 text-xs text-accent">{message}</p> : null}
      {error ? <p className="mt-3 text-xs text-[#e07a6a]">{error}</p> : null}
    </div>
  );
}
