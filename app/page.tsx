import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-warm-bg relative overflow-hidden">
      {/* Decorative watercolor blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 15% 20%, rgba(200,146,107,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 85% 30%, rgba(212,160,160,0.07) 0%, transparent 55%), radial-gradient(ellipse 60% 45% at 50% 80%, rgba(160,184,160,0.06) 0%, transparent 55%)",
        }} />

      <div className="max-w-2xl mx-auto text-center animate-slide-up relative">
        {/* Floating decorative stars */}
        <span className="absolute -top-8 left-10 text-amber-300/30 text-lg animate-gentle-float select-none" style={{ animationDelay: "0s" }}>✦</span>
        <span className="absolute top-4 right-12 text-rose-300/25 text-sm animate-gentle-float select-none" style={{ animationDelay: "1.5s" }}>✿</span>
        <span className="absolute bottom-20 left-20 text-sage-300/25 text-xs animate-gentle-float select-none" style={{ animationDelay: "0.8s" }}>❀</span>

        <div className="mb-8 relative inline-block">
          {/* Watercolor blob behind icon */}
          <div className="absolute inset-0 rounded-full opacity-60"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(200,146,107,0.18) 0%, rgba(212,160,160,0.08) 50%, transparent 70%)",
              transform: "scale(1.6)",
            }} />
          <span className="relative text-6xl" style={{ filter: "hue-rotate(-8deg) saturate(0.85)" }}>📖</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-warm-brown mb-4 relative">
          OC 管理器
          {/* Watercolor underline */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-32 h-2 opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 100% 100% at 50% 0%, rgba(200,146,107,0.5) 0%, transparent 70%)",
            }} />
        </h1>
        <p className="text-lg text-warm-muted mb-2">原创角色管理系统</p>
        <p className="text-warm-muted mb-10 max-w-md mx-auto leading-relaxed">
          在这里，构建属于你的角色宇宙。管理原创角色档案、编织世界观、绘制关系图谱——让每一个灵感都有处可栖。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3 text-warm-cream font-medium text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #8A5D3E 0%, #6B4830 100%)",
              borderRadius: "22px 6px 22px 6px / 18px 5px 18px 5px",
            }}
          >
            <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
              style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,255,255,0.12) 0%, transparent 60%)" }} />
            <span className="relative">开始使用</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-warm-border text-warm-brown font-medium text-lg transition-all hover:-translate-y-0.5 relative overflow-hidden"
            style={{ borderRadius: "22px 6px 22px 6px / 18px 5px 18px 5px", background: "#FFFBF2" }}
          >
            <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(200,146,107,0.06) 0%, transparent 60%)" }} />
            <span className="relative">登录</span>
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left">
          {[
            {
              icon: "◆",
              title: "OC 档案",
              desc: "详尽的角色信息管理，从外貌性格到背景故事",
              watercolor: "rgba(200,146,107,0.08)",
            },
            {
              icon: "◎",
              title: "世界观",
              desc: "构建完整的世界设定体系，地理历史文化",
              watercolor: "rgba(160,184,160,0.07)",
            },
            {
              icon: "⬡",
              title: "关系图谱",
              desc: "可视化人物关系网，亲密度与连线一目了然",
              watercolor: "rgba(212,160,160,0.08)",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 border border-warm-border shadow-sm relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md"
              style={{
                borderRadius: "20px 6px 20px 6px / 18px 5px 18px 5px",
                background: `radial-gradient(ellipse 60% 50% at 30% 30%, ${f.watercolor} 0%, transparent 60%), #FFFBF2`,
              }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-serif font-bold text-warm-brown mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-warm-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 text-xs text-warm-muted/60 tracking-wider">
          温暖叙事 · 创作伴侣 · 灵感永存
        </p>
      </div>
    </div>
  );
}
