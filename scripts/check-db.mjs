// 数据库/存储连接体检脚本
// 用法：在 lvytphoto 目录执行 `npm run db:check`
// 它只用 anon（可公开）密钥，模拟一个“未登录访客”，验证结构与权限是否就绪。

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), ".env.local");

if (!existsSync(envPath)) {
  console.error("❌ 找不到 .env.local，请先在 lvytphoto 目录创建它并填写两个变量。");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!url.startsWith("https://") || url.includes("your-project-ref")) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL 还没填成真实地址（形如 https://abcdxyz.supabase.co）。");
  process.exit(1);
}
if (key.length < 20) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_ANON_KEY 还没填好。");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let failed = 0;
const pass = (message) => console.log(`  ✅ ${message}`);
const fail = (message, detail) => {
  failed += 1;
  console.log(`  ❌ ${message}`);
  if (detail) console.log(`     ${detail}`);
};

console.log(`\n数据库：${url}\n`);

// 1. 分类表可读，且有 6 个初始分类
{
  const { count, error } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });
  if (error) fail("无法读取 categories（表或权限未建好）", error.message);
  else if (count === 6) pass(`分类表可读，初始分类 ${count} 个`);
  else fail(`分类表可读，但数量是 ${count}，预期 6 个（可能 SQL 没执行完）`);
}

// 2. 作品表可读（初始 0 条）
{
  const { count, error } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true });
  if (error) fail("无法读取 photos（表或权限未建好）", error.message);
  else pass(`作品表可读，当前 ${count ?? 0} 张作品`);
}

// 3. 未登录访客不是管理员
{
  const { data, error } = await supabase.rpc("is_admin");
  if (error) fail("is_admin() 函数不存在或无权限", error.message);
  else if (data === false) pass("未登录访客被判定为非管理员");
  else fail(`is_admin() 对匿名用户返回了 ${JSON.stringify(data)}，权限有漏洞`);
}

// 4. 未登录访客不能新增分类（应被数据库拦截）
{
  const { error } = await supabase
    .from("categories")
    .insert({ slug: "security-test", name: "越权测试" });
  if (error) pass("匿名用户新增分类被拒绝（RLS 生效）");
  else fail("严重漏洞：匿名用户可以新增分类，请检查 categories 的 RLS 策略");
}

// 5. 未登录访客不能上传作品记录
{
  const { error } = await supabase.from("photos").insert({
    title: "越权测试",
    storage_path: "security-test.webp",
    width: 100,
    height: 100,
  });
  if (error) pass("匿名用户新增作品被拒绝（RLS 生效）");
  else fail("严重漏洞：匿名用户可以新增作品，请检查 photos 的 RLS 策略");
}

// 6. 图片存储桶存在
{
  const { data, error } = await supabase.storage.from("photos").list("", { limit: 1 });
  if (error) fail("无法访问 photos 存储桶（桶或策略未建好）", error.message);
  else pass(`存储桶 photos 可访问，当前文件 ${data?.length ?? 0} 个`);
}

console.log("");
if (failed === 0) {
  console.log("🎉 全部通过：数据库、权限、存储都已就绪。\n");
  process.exit(0);
} else {
  console.log(`⚠️  有 ${failed} 项没通过，请把上面的 ❌ 内容发给我。\n`);
  process.exit(1);
}
