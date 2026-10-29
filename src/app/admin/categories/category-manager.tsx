"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createCategory, deleteCategory, renameCategory } from "./actions";

export type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  photoCount: number;
};

export function CategoryManager({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleAdd(formData: FormData) {
    setError("");
    setPending(true);
    const result = await createCategory(formData);
    setPending(false);
    if (result.ok) {
      formRef.current?.reset();
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="space-y-10">
      <section className="border border-line bg-surface/40 p-6">
        <h2 className="font-serif text-lg text-paper">新增分类</h2>
        <p className="mt-2 text-xs leading-6 text-muted">
          英文标识会用在网址里（例如 <code className="text-accent">landscape</code>），创建后不能修改。
        </p>

        <form ref={formRef} action={handleAdd} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_120px_auto]">
          <label className="block">
            <span className="text-[11px] tracking-[0.2em] text-faint">英文标识</span>
            <input
              name="slug"
              required
              maxLength={40}
              placeholder="night-sky"
              className="mt-2 w-full border border-line bg-transparent px-3 py-2.5 text-sm text-paper placeholder:text-faint focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[11px] tracking-[0.2em] text-faint">中文名称</span>
            <input
              name="name"
              required
              maxLength={20}
              placeholder="星空"
              className="mt-2 w-full border border-line bg-transparent px-3 py-2.5 text-sm text-paper placeholder:text-faint focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[11px] tracking-[0.2em] text-faint">排序</span>
            <input
              name="sortOrder"
              type="number"
              min={0}
              max={999}
              defaultValue={0}
              className="mt-2 w-full border border-line bg-transparent px-3 py-2.5 text-sm text-paper focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="self-end border border-accent px-5 py-2.5 text-sm tracking-[0.12em] text-accent transition-colors hover:bg-accent hover:text-ink disabled:opacity-50"
          >
            {pending ? "添加中…" : "添加"}
          </button>
        </form>

        {error ? <p className="mt-3 text-xs text-[#e8a59c]">{error}</p> : null}
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-lg text-paper">现有分类</h2>
          <p className="text-xs text-faint">共 {categories.length} 个 · 数字越小越靠前</p>
        </div>

        <ul className="mt-5 divide-y divide-line border border-line">
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryItem }) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [sort, setSort] = useState(String(category.sortOrder));
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  async function save() {
    setError("");
    setSaved(false);
    setPending(true);
    const result = await renameCategory(category.id, name, Number(sort));
    setPending(false);
    if (result.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  async function remove() {
    setError("");
    setPending(true);
    const result = await deleteCategory(category.id);
    setPending(false);
    if (result.ok) {
      router.refresh();
    } else {
      setError(result.error);
    }
  }

  return (
    <li className="p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          maxLength={20}
          aria-label={`${category.name} 的名称`}
          className="w-36 border border-line bg-transparent px-3 py-2 text-sm text-paper focus:border-accent focus:outline-none"
        />
        <input
          value={sort}
          onChange={(event) => {
            setSort(event.target.value);
            setSaved(false);
          }}
          type="number"
          min={0}
          max={999}
          aria-label={`${category.name} 的排序`}
          className="w-20 border border-line bg-transparent px-3 py-2 text-sm text-paper focus:border-accent focus:outline-none"
        />
        <code className="text-[11px] text-faint">{category.slug}</code>
        <span className="text-[11px] text-faint">{category.photoCount} 张作品</span>

        <div className="ml-auto flex items-center gap-4">
          {saved ? <span className="text-[11px] text-accent">已保存</span> : null}
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="text-[11px] tracking-[0.12em] text-accent underline-offset-4 hover:underline disabled:opacity-50"
          >
            保存
          </button>
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-[11px] tracking-[0.12em] text-faint transition-colors hover:text-[#e8a59c]"
            >
              删除
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-2 text-[11px] text-[#e8a59c]">{error}</p> : null}

      {confirming ? (
        <div className="mt-3 border border-[#c25b4e]/50 bg-[#c25b4e]/10 p-3">
          <p className="text-[11px] leading-5 text-[#e8a59c]">
            确定删除「{category.name}」？
            {category.photoCount > 0
              ? `该分类下的 ${category.photoCount} 张作品会变成“未分类”，不会丢图。`
              : "这个分类目前没有作品。"}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={remove}
              disabled={pending}
              className="border border-[#c25b4e] px-3 py-1.5 text-[11px] text-[#e8a59c] transition-colors hover:bg-[#c25b4e] hover:text-ink disabled:opacity-50"
            >
              {pending ? "删除中…" : "确认删除"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="text-[11px] text-muted hover:text-paper disabled:opacity-50"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
