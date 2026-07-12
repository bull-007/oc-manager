import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-warm-bg">
      <div className="max-w-2xl mx-auto text-center animate-slide-up">
        <div className="mb-8">
          <span className="text-6xl">📖</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-warm-brown mb-4">
          OC 管理器
        </h1>
        <p className="text-lg text-warm-muted mb-2">原创角色管理系统</p>
        <p className="text-warm-muted mb-10 max-w-md mx-auto leading-relaxed">
          在这里，构建属于你的角色宇宙。管理原创角色档案、编织世界观、绘制关系图谱——让每一个灵感都有处可栖。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3 bg-amber-700 text-warm-cream rounded-xl font-medium text-lg hover:bg-amber-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            开始使用
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-warm-border text-warm-brown rounded-xl font-medium text-lg hover:bg-warm-paper transition-all hover:-translate-y-0.5"
          >
            登录
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left">
          {[
            {
              icon: "◆",
              title: "OC 档案",
              desc: "详尽的角色信息管理，从外貌性格到背景故事",
            },
            {
              icon: "◎",
              title: "世界观",
              desc: "构建完整的世界设定体系，地理历史文化",
            },
            {
              icon: "⬡",
              title: "关系图谱",
              desc: "可视化人物关系网，亲密度与连线一目了然",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-xl bg-warm-paper border border-warm-border shadow-sm"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-serif font-bold text-warm-brown mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-warm-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-xs text-warm-muted">
          温暖叙事 · 创作伴侣 · 灵感永存
        </p>
      </div>
    </div>
  );
}
