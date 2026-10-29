"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { assertUsableFile, prepareImage, type PreparedImage } from "@/lib/image";
import { createClient } from "@/lib/supabase/client";
import { createPhoto } from "../actions";

type Category = { id: string; name: string };

type Status = "idle" | "working" | "done";

const SLOT_LABEL: Record<string, string> = { sm: "缩略图", md: "中图", lg: "大图" };

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadForm({ categories }: { categories: Category[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shotAt, setShotAt] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [percent, setPercent] = useState(0);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const preparedRef = useRef<{ file: File; image: PreparedImage } | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  function resetFile() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    preparedRef.current = null;
    setFile(null);
    setPreviewUrl(null);
    setStatus("idle");
    setPercent(0);
    setStep("");
    setError("");
    setSavedId(null);
  }

  function resetAll() {
    resetFile();
    setTitle("");
    setDescription("");
    setCategoryId("");
    setShotAt("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function selectFile(next: File) {
    if (status === "working") return;

    try {
      assertUsableFile(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "这个文件不能用。");
      return;
    }

    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(next);
    previewRef.current = url;
    preparedRef.current = null;

    setFile(next);
    setPreviewUrl(url);
    setStatus("idle");
    setError("");
    setSavedId(null);
    setPercent(0);
    setStep("");

    if (!title.trim()) {
      const guess = next.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .slice(0, 80);
      if (guess) setTitle(guess);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setError("请先选择一张照片。");
      return;
    }

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("请填写标题。");
      return;
    }
    if (cleanTitle.length > 80) {
      setError("标题最多 80 个字。");
      return;
    }

    setStatus("working");
    setError("");
    setSavedId(null);
    setPercent(3);
    setStep("准备中…");

    const uploaded: string[] = [];

    try {
      let prepared = preparedRef.current?.file === file ? preparedRef.current.image : null;

      if (!prepared) {
        prepared = await prepareImage(file, setStep);
        preparedRef.current = { file, image: prepared };
      }

      setPercent(40);
      setStep("准备上传…");

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("登录状态已失效，请重新登录后再上传。");
      }

      const now = new Date();
      const base = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}`;

      try {
        for (let i = 0; i < prepared.variants.length; i += 1) {
          const variant = prepared.variants[i];
          setStep(`上传${SLOT_LABEL[variant.slot]}（${variant.width}px）…`);

          const { error: uploadError } = await supabase.storage
            .from("photos")
            .upload(`${base}-${variant.slot}.webp`, variant.blob, {
              contentType: "image/webp",
              cacheControl: "31536000",
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`图片上传失败：${uploadError.message}`);
          }

          uploaded.push(`${base}-${variant.slot}.webp`);
          setPercent(40 + Math.round(((i + 1) / prepared.variants.length) * 45));
        }
      } catch (uploadFailure) {
        if (uploaded.length > 0) {
          await supabase.storage.from("photos").remove(uploaded);
        }
        throw uploadFailure;
      }

      setPercent(92);
      setStep("正在保存作品信息…");

      const largest = prepared.variants[prepared.variants.length - 1];
      const result = await createPhoto({
        title: cleanTitle,
        description,
        categoryId: categoryId || null,
        shotAt: shotAt || null,
        storagePath: base,
        width: largest.width,
        height: largest.height,
        blurDataUrl: prepared.blurDataUrl,
      });

      if (!result.ok) {
        await supabase.storage.from("photos").remove(uploaded);
        throw new Error(result.error);
      }

      setPercent(100);
      setStep("完成");
      setSavedId(result.id);
      setStatus("done");
      preparedRef.current = null;
    } catch (failure) {
      setStatus("idle");
      setPercent(0);
      setStep("");
      setError(failure instanceof Error ? failure.message : "上传失败，请重试。");
    }
  }

  const working = status === "working";

  if (status === "done") {
    return (
      <div className="border border-line p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent text-accent">
          ✓
        </div>
        <h2 className="mt-5 font-serif text-2xl text-paper">上传成功</h2>
        <p className="mt-3 text-sm text-muted">
          《{title.trim()}》已经存入数据库和图片存储。
        </p>
        <p className="mt-1 text-xs text-faint">
          前台作品墙会在下一步接入数据库后显示它。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={resetAll}
            className="border border-accent px-5 py-2.5 text-sm tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-ink"
          >
            继续上传
          </button>
          <Link
            href="/admin/photos"
            className="border border-line px-5 py-2.5 text-sm tracking-[0.12em] text-muted transition-colors hover:border-line-strong hover:text-paper"
          >
            查看作品列表
          </Link>
        </div>
        {savedId ? <p className="mt-4 text-[11px] text-faint">记录编号 {savedId.slice(0, 8)}</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 选图区 */}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const dropped = event.dataTransfer.files?.[0];
          if (dropped) selectFile(dropped);
        }}
        className={`border border-dashed p-4 transition-colors ${
          dragging ? "border-accent bg-surface" : "border-line"
        }`}
      >
        <input
          ref={inputRef}
          id="photo-file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={working}
          onChange={(event) => {
            const picked = event.target.files?.[0];
            if (picked) selectFile(picked);
          }}
        />

        {previewUrl && file ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="待上传照片预览"
              className="h-32 w-32 shrink-0 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-paper">{file.name}</p>
              <p className="mt-1 text-xs text-faint">
                原图 {formatSize(file.size)} · 上传时会自动压成三档 WebP，原图不会上传
              </p>
              <button
                type="button"
                disabled={working}
                onClick={() => inputRef.current?.click()}
                className="mt-3 border border-line px-4 py-2 text-xs tracking-[0.12em] text-muted transition-colors hover:border-line-strong hover:text-paper disabled:opacity-50"
              >
                换一张
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={working}
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 py-10 text-center"
          >
            <span className="text-sm text-paper">点击选择照片</span>
            <span className="text-xs text-faint">也可以把照片直接拖到这里</span>
            <span className="mt-2 text-[11px] text-faint">支持 JPG / PNG / WebP，单张不超过 25MB</span>
          </button>
        )}
      </div>

      {/* 信息表单 */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="photo-title" className="text-xs tracking-[0.2em] text-muted">
            标题 <span className="text-accent">*</span>
          </label>
          <input
            id="photo-title"
            value={title}
            maxLength={80}
            disabled={working}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：晨雾中的山脊"
            className="mt-2 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper placeholder:text-faint focus:border-accent focus:outline-none disabled:opacity-60"
          />
        </div>

        <div>
          <label htmlFor="photo-category" className="text-xs tracking-[0.2em] text-muted">
            分类
          </label>
          <select
            id="photo-category"
            value={categoryId}
            disabled={working}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-2 w-full appearance-none border border-line bg-ink px-4 py-3 text-sm text-paper focus:border-accent focus:outline-none disabled:opacity-60"
          >
            <option value="">未分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="photo-shot-at" className="text-xs tracking-[0.2em] text-muted">
            拍摄日期
          </label>
          <input
            id="photo-shot-at"
            type="date"
            value={shotAt}
            disabled={working}
            onChange={(event) => setShotAt(event.target.value)}
            className="mt-2 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper focus:border-accent focus:outline-none disabled:opacity-60"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="photo-description" className="text-xs tracking-[0.2em] text-muted">
            描述
          </label>
          <textarea
            id="photo-description"
            value={description}
            maxLength={2000}
            rows={4}
            disabled={working}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="这张照片拍摄时的地点、光线或想法（可留空）"
            className="mt-2 w-full resize-y border border-line bg-transparent px-4 py-3 text-sm leading-6 text-paper placeholder:text-faint focus:border-accent focus:outline-none disabled:opacity-60"
          />
          <p className="mt-2 text-right text-[11px] text-faint">{description.length} / 2000</p>
        </div>
      </div>

      {/* 进度 */}
      {working ? (
        <div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>{step || "处理中…"}</span>
            <span>{percent}%</span>
          </div>
          <div className="mt-2 h-[3px] w-full bg-line">
            <div
              className="h-full bg-accent transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] text-faint">
            上传过程中请不要关闭页面；压缩和上传都在你的浏览器里完成。
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="border border-[#c25b4e]/60 bg-[#c25b4e]/10 px-4 py-3 text-sm text-[#e8a59c]">
          {error}
          <span className="ml-2 text-xs text-[#e8a59c]/70">可以修正后重新点上传。</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={working || !file}
          className="border border-accent px-8 py-3 text-sm tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-ink disabled:cursor-not-allowed disabled:border-line disabled:text-faint disabled:hover:bg-transparent"
        >
          {working ? "上传中…" : "开始上传"}
        </button>
        <Link href="/admin/photos" className="text-xs text-faint underline-offset-4 hover:text-muted hover:underline">
          返回作品列表
        </Link>
      </div>
    </form>
  );
}
