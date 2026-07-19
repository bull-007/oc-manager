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
      <div className="max-w-xl mx-auto text-center animate-slide-up">
        <div className="mb-8">
          <span className="text-5xl">📖</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-hand text-warm-brown mb-4">
          OC 管理器
        </h1>
        <p className="text-base text-warm-muted mb-2">原创角色管理系统</p>
        <p className="text-warm-muted mb-10 max-w-sm mx-auto leading-relaxed text-sm">
          在这里，构建属于你的角色宇宙。管理原创角色档案、编织世界观、绘制关系图谱——让每一个灵感都有处可栖。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-7 py-2.5 text-warm-cream font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            style={{
              background: "#B8977E",
              borderRadius: "20px 6px 20px 6px / 16px 4px 16px 4px",
            }}
          >
            开始使用
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-7 py-2.5 border-2 border-warm-border text-warm-brown font-medium transition-all hover:bg-warm-paper hover:-translate-y-0.5"
            style={{ borderRadius: "20px 6px 20px 6px / 16px 4px 16px 4px", background: "#F7F3EC" }}
          >
            登录
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-16 text-left">
          {[
            { icon: "◆", title: "OC 档案", desc: "详尽的角色信息管理，从外貌性格到背景故事" },
            { icon: "◎", title: "世界观", desc: "构建完整的世界设定体系，地理历史文化" },
            { icon: "⬡", title: "关系图谱", desc: "可视化人物关系网，亲密度与连线一目了然" },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 border border-warm-border shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              style={{ borderRadius: "20px 6px 20px 6px / 18px 5px 18px 5px", background: "#F7F3EC" }}
            >
              <div className="text-xl mb-2">{f.icon}</div>
              <h3 className="font-hand text-warm-brown mb-1 text-base">{f.title}</h3>
              <p className="text-sm text-warm-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-14 text-xs text-warm-muted/50 tracking-wider">
          温暖叙事 · 创作伴侣 · 灵感永存
        </p>
      </div>
    </div>
  );
}
