"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserGlyph } from "@/components/user-glyph";
import { prepareAvatar } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { removeAvatar, updateAvatar } from "./actions";

/**
 * 头像上传：浏览器里裁成 512px 正方形 WebP，直接传到 Supabase Storage 的 avatars 桶，
 * 再把路径写进 profiles.avatar_path。文件不会经过我们的服务器。
 */
export function AvatarForm({
  userId,
  currentUrl,
}: {
  userId: string;
  currentUrl: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;

    setBusy(true);
    setError(null);
    setStatus("正在处理…");

    try {
      const blob = await prepareAvatar(file);
      const supabase = createClient();
      const path = `${userId}/avatar-${crypto.randomUUID()}.webp`;

      setStatus("正在上传…");
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, {
          contentType: "image/webp",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("avatar upload failed:", uploadError.message);
        throw new Error("上传失败，请检查网络后重试。");
      }

      const result = await updateAvatar(path);
      if (!result.ok) {
        await supabase.storage.from("avatars").remove([path]);
        throw new Error(result.error);
      }

      setPreview(URL.createObjectURL(blob));
      setStatus(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "头像更新失败，请重试。");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (busy) return;
    if (!window.confirm("恢复默认头像？现在的头像文件会被删除。")) return;

    setBusy(true);
    setError(null);
    setStatus("正在恢复…");

    try {
      const result = await removeAvatar();
      if (!result.ok) throw new Error(result.error);
      setPreview(null);
      setStatus(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "恢复失败，请重试。");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="当前头像" className="h-full w-full object-cover" />
        ) : (
          <UserGlyph className="h-10 w-10 text-faint" />
        )}
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="border border-accent px-5 py-2.5 text-sm tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
          >
            {busy ? "处理中…" : "更换头像"}
          </button>
          {preview ? (
            <button
              type="button"
              onClick={handleRemove}
              disabled={busy}
              className="px-2 py-2.5 text-sm text-faint transition-colors hover:text-muted disabled:opacity-50"
            >
              恢复默认
            </button>
          ) : null}
        </div>
        <p className="text-xs leading-6 text-faint">
          支持 JPG / PNG / WebP。会自动居中裁成正方形并压到 512px，单张不超过 100MB。
        </p>
        {status ? <p className="text-xs text-accent">{status}</p> : null}
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
