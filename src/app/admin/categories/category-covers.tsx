"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { assertUsableFile, prepareCategoryCover } from "@/lib/image";
import { clearCategoryCover, setCategoryCover } from "./actions";

export type CoverItem = {
  id: string;
  name: string;
  coverUrl: string | null;
};

export function CategoryCovers({ items }: { items: CoverItem[] }) {
  const router = useRouter();
  const supabase = createClient();
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  async function upload(id: string, file: File) {
    setError(null);
    setBusy(id);
    try {
      assertUsableFile(file);
      const prepared = await prepareCategoryCover(file);
      const base = `category/${crypto.randomUUID()}`;
      const objectPath = `${base}-md.webp`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(objectPath, prepared.blob, {
          contentType: "image/webp",
          upsert: false,
        });

      if (uploadError) {
        console.error("category cover upload failed:", uploadError.message);
        setError({ id, message: `上传失败：${uploadError.message}` });
        return;
      }

      const result = await setCategoryCover(id, base);
      if (!result.ok) {
        await supabase.storage.from("photos").remove([objectPath]);
        setError({ id, message: result.error });
        return;
      }

      startTransition(() => router.refresh());
    } catch (err) {
      setError({ id, message: err instanceof Error ? err.message : "上传失败。" });
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setError(null);
    setBusy(id);
    try {
      const result = await clearCategoryCover(id);
      if (!result.ok) setError({ id, message: result.error });
      else startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const working = busy === item.id || pending;
        return (
          <div
            key={item.id}
            className="lv-glass flex gap-3 rounded-xl p-3"
            style={{ borderRadius: 14 }}
          >
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-surface">
              {item.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverUrl}
                  alt={`${item.name} 招牌图`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] tracking-[0.18em] text-faint">
                  未设置
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-paper">{item.name}</p>
              <p className="mt-1 text-[10px] leading-4 text-faint">
                招牌图会显示在首页「按分类浏览」里。
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={working}
                  onClick={() => inputs.current[item.id]?.click()}
                  className="border border-line px-3 py-1.5 text-[11px] tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {busy === item.id ? "处理中…" : item.coverUrl ? "更换招牌" : "上传招牌"}
                </button>
                {item.coverUrl ? (
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => remove(item.id)}
                    className="border border-line px-3 py-1.5 text-[11px] tracking-[0.1em] text-faint transition-colors hover:border-[#c25b4e] hover:text-[#e8a59c] disabled:opacity-50"
                  >
                    移除
                  </button>
                ) : null}
              </div>

              {error?.id === item.id ? (
                <p className="mt-2 text-[11px] text-red-400">{error.message}</p>
              ) : null}
            </div>

            <input
              ref={(el) => {
                inputs.current[item.id] = el;
              }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(item.id, file);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
