"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePhoto, type UpdatePhotoState } from "../../actions";

type Category = { id: string; name: string };

export type EditablePhoto = {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  shot_at: string | null;
  is_published: boolean;
  imageUrl: string;
  width: number;
  height: number;
  createdAt: string;
};

export function EditForm({
  photo,
  categories,
}: {
  photo: EditablePhoto;
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState<UpdatePhotoState, FormData>(updatePhoto, {});

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={photo.id} />

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div>
          <div
            className="w-full overflow-hidden border border-line bg-surface"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.imageUrl} alt={photo.title} className="h-full w-full object-cover" />
          </div>
          <p className="mt-3 text-[11px] text-faint">
            {photo.width} × {photo.height} · 上传于 {photo.createdAt.slice(0, 10)}
          </p>
          <p className="mt-1 text-[11px] text-faint">
            想换图请先删除这条再重新上传（换图会重新压缩三档）。
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="edit-title" className="text-xs tracking-[0.2em] text-muted">
              标题 <span className="text-accent">*</span>
            </label>
            <input
              id="edit-title"
              name="title"
              defaultValue={photo.title}
              maxLength={80}
              disabled={pending}
              className="mt-2 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper focus:border-accent focus:outline-none disabled:opacity-60"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-category" className="text-xs tracking-[0.2em] text-muted">
                分类
              </label>
              <select
                id="edit-category"
                name="categoryId"
                defaultValue={photo.category_id ?? ""}
                disabled={pending}
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
              <label htmlFor="edit-shot-at" className="text-xs tracking-[0.2em] text-muted">
                拍摄日期
              </label>
              <input
                id="edit-shot-at"
                name="shotAt"
                type="date"
                defaultValue={photo.shot_at ?? ""}
                disabled={pending}
                className="mt-2 w-full border border-line bg-transparent px-4 py-3 text-sm text-paper focus:border-accent focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-description" className="text-xs tracking-[0.2em] text-muted">
              描述
            </label>
            <textarea
              id="edit-description"
              name="description"
              defaultValue={photo.description ?? ""}
              maxLength={2000}
              rows={6}
              disabled={pending}
              className="mt-2 w-full resize-y border border-line bg-transparent px-4 py-3 text-sm leading-6 text-paper focus:border-accent focus:outline-none disabled:opacity-60"
            />
          </div>

          <label className="flex items-center gap-3 text-sm text-muted">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={photo.is_published}
              disabled={pending}
              className="h-4 w-4 accent-[#c8a97e]"
            />
            在前台公开展示（取消勾选则保存为草稿）
          </label>

          {state.error ? (
            <div className="border border-[#c25b4e]/60 bg-[#c25b4e]/10 px-4 py-3 text-sm text-[#e8a59c]">
              {state.error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="border border-accent px-7 py-3 text-sm tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
            >
              {pending ? "保存中…" : "保存修改"}
            </button>
            <Link
              href="/admin/photos"
              className="text-xs text-faint underline-offset-4 hover:text-muted hover:underline"
            >
              放弃修改
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
