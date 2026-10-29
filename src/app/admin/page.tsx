import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export default async function AdminHomePage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ count: photoCount }, { count: categoryCount }] = await Promise.all([
    supabase.from("photos").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
  ]);

  const steps = [
    {
      title: "上传作品",
      detail: "浏览器内压成三档 WebP，直传 Supabase 存储，带进度与重试。",
      status: "已完成",
    },
    {
      title: "编辑与删除",
      detail: "修改标题、描述、分类、拍摄日期；删除前二次确认并同时清理图片文件。",
      status: "已完成",
    },
    {
      title: "分类管理",
      detail: "新增、改名、排序、删除；删除后该分类的作品自动变为“未分类”。",
      status: "已完成",
    },
    {
      title: "站点背景",
      detail: "只允许管理员更换首页背景图，访客和普通用户无权修改。",
      status: "已完成",
    },
    {
      title: "点赞与评论",
      detail: "登录后才能点赞和评论；一人一图只有一个赞，作者和管理员可以删除评论。",
      status: "已完成",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-line bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-faint">作品</p>
          <p className="mt-3 font-serif text-4xl text-paper">{photoCount ?? 0}</p>
        </div>
        <div className="border border-line bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-faint">分类</p>
          <p className="mt-3 font-serif text-4xl text-paper">{categoryCount ?? 0}</p>
        </div>
        <div className="border border-line bg-surface p-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-faint">当前身份</p>
          <p className="mt-3 text-sm text-paper">管理员</p>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl tracking-wide text-paper">接下来要做的事</h2>
        <div className="mt-5 divide-y divide-line border border-line">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div>
                <p className="text-sm text-paper">{step.title}</p>
                <p className="mt-2 max-w-xl text-xs leading-6 text-muted">{step.detail}</p>
              </div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-faint">
                {step.status}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
