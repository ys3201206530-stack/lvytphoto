"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePhoto } from "./actions";

export function DeletePhotoButton({
  id,
  title,
  redirectTo,
}: {
  id: string;
  title: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError("");
    startTransition(async () => {
      const result = await deletePhoto(id);
      if (result.ok) {
        setConfirming(false);
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.refresh();
        }
      } else {
        setError(result.error);
      }
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-[11px] tracking-[0.12em] text-faint transition-colors hover:text-[#e8a59c]"
      >
        删除
      </button>
    );
  }

  return (
    <div className="mt-3 border border-[#c25b4e]/50 bg-[#c25b4e]/10 p-3">
      <p className="text-[11px] leading-5 text-[#e8a59c]">
        确定删除《{title}》？图片文件也会一起删除，无法恢复。
      </p>
      {error ? <p className="mt-2 text-[11px] text-[#e8a59c]">{error}</p> : null}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={handleDelete}
          className="border border-[#c25b4e] px-3 py-1.5 text-[11px] text-[#e8a59c] transition-colors hover:bg-[#c25b4e] hover:text-ink disabled:opacity-50"
        >
          {pending ? "删除中…" : "确认删除"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="text-[11px] text-muted transition-colors hover:text-paper disabled:opacity-50"
        >
          取消
        </button>
      </div>
    </div>
  );
}
