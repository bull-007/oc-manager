import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-stone-page">
      <div className="max-w-lg mx-auto text-center animate-slide-up">
        <h1 className="text-3xl font-serif font-medium text-stone-text mb-3">OC 管理器</h1>
        <p className="text-stone-muted mb-2 text-sm">原创角色管理系统</p>
        <p className="text-stone-muted mb-10 max-w-xs mx-auto leading-relaxed text-sm">
          构建属于你的角色宇宙。管理原创角色档案、编织世界观、绘制关系图谱——让每一个灵感都有处可栖。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register"
            className="inline-flex items-center justify-center px-7 py-2.5 text-sm font-medium transition-colors"
            style={{ background: "#869087", color: "#fff", borderRadius: "8px" }}>
            开始使用
          </Link>
          <Link href="/login"
            className="inline-flex items-center justify-center px-7 py-2.5 text-sm font-medium text-stone-text transition-colors border border-stone-border hover:bg-stone-hover"
            style={{ borderRadius: "8px" }}>
            登录
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-16 text-left">
          {[
            { title: "OC 档案", desc: "详尽的角色信息管理，从外貌性格到背景故事" },
            { title: "世界观", desc: "构建完整的世界设定体系，地理历史文化" },
            { title: "关系图谱", desc: "可视化人物关系网，亲密度与连线一目了然" },
          ].map((f) => (
            <div key={f.title}
              className="p-5 border border-stone-border bg-stone-card transition-colors hover:border-sage"
              style={{ borderRadius: "10px" }}>
              <h3 className="font-serif font-medium text-stone-text mb-1 text-base">{f.title}</h3>
              <p className="text-sm text-stone-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-14 text-xs text-stone-muted">温暖叙事 · 创作伴侣 · 灵感永存</p>
      </div>
    </div>
  );
}
