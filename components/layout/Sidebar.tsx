"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "仪表盘", icon: "~" },
  { href: "/ocs", label: "OC 档案", icon: "◇" },
  { href: "/worlds", label: "世界观", icon: "◎" },
  { href: "/relations", label: "关系图谱", icon: "⤳" },
  { href: "/inspirations", label: "灵感速记", icon: "✧" },
];

export default function Sidebar({ user }: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-warm-paper border-r-2 border-dashed border-warm-border flex flex-col relative watercolor-amber">
      {/* Decorative vine along right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none opacity-[0.20]" aria-hidden="true">
        <svg width="20" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="v" x="0" y="0" width="20" height="64" patternUnits="userSpaceOnUse">
              <path d="M10 0 Q14 16 10 32 Q6 48 10 64" stroke="#8A7E6E" fill="none" strokeWidth="0.6"/>
              <circle cx="10" cy="12" r="1.6" fill="#C8926B" opacity="0.5"/>
              <circle cx="4" cy="28" r="1.2" fill="#D4A0A0" opacity="0.4"/>
              <circle cx="10" cy="44" r="1.6" fill="#C8926B" opacity="0.5"/>
              <circle cx="16" cy="56" r="1.0" fill="#A0B8A0" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="20" height="100%" fill="url(#v)"/>
        </svg>
      </div>

      {/* Decorative top doodle */}
      <div className="px-4 pt-2 text-warm-muted/25 text-xs select-none leading-none text-center tracking-[0.3em]">
        ✦ ◇ ✧ ◎ ⬡ ✦
      </div>

      {/* Logo */}
      <div className="relative px-5 py-4 border-b-2 border-dashed border-warm-border">
        {/* Watercolor blob behind logo */}
        <div className="absolute inset-2 rounded-2xl opacity-60 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(200,146,107,0.12) 0%, transparent 70%)",
          }} />
        <Link href="/dashboard" className="flex items-center gap-2.5 group relative">
          <span className="text-2xl transition-transform group-hover:scale-110 group-hover:-rotate-6"
            style={{ filter: "hue-rotate(-10deg) saturate(0.8)" }}>📖</span>
          <div>
            <span className="text-base font-serif font-bold text-warm-brown tracking-wide block leading-tight">
              OC 管理器
            </span>
            <span className="text-xs text-warm-muted/50 block leading-tight">创作伴侣</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 group relative overflow-hidden",
                active
                  ? "text-amber-800 font-medium shadow-sm"
                  : "text-warm-brown/70 hover:text-amber-700 hover:translate-x-1"
              )}
              style={active ? {
                background: "radial-gradient(ellipse 100% 100% at 50% 50%, rgba(212,160,160,0.15) 0%, rgba(200,146,107,0.10) 40%, rgba(243,235,216,0.6) 100%)",
                border: "1px solid rgba(200,146,107,0.2)",
              } : undefined}
            >
              {/* Watercolor hover blob */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(200,146,107,0.08) 0%, transparent 70%)",
                }} />
              <span className={cn(
                "text-base w-6 text-center transition-transform relative",
                active ? "scale-110" : "group-hover:scale-110",
              )}>
                {item.icon}
              </span>
              <span className="relative">{item.label}</span>
              {active && (
                <span className="ml-auto text-amber-400 text-xs">·</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Decorative bottom flowers */}
      <div className="px-4 pb-1 text-warm-muted/20 text-xs select-none leading-none text-center tracking-[0.2em]">
        ✿ ❀ ✾ ✿
      </div>

      {/* User */}
      <div className="m-3 p-3 rounded-2xl border border-dashed border-amber-200/50 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 30% 30%, rgba(200,146,107,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 70% 70%, rgba(160,184,160,0.04) 0%, transparent 60%), #FFFBF2",
        }}>
        {/* Corner sparkles */}
        <span className="absolute top-1.5 left-2 text-[9px] text-amber-300/40 pointer-events-none">✦</span>
        <span className="absolute bottom-1.5 right-2 text-[8px] text-rose-300/30 pointer-events-none">✿</span>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-xs">
            {user.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-warm-brown truncate">{user.name}</p>
            <p className="text-[10px] text-warm-muted/50 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-[11px] text-warm-muted/50 hover:text-red-400 transition-colors py-1 rounded-lg hover:bg-red-50/50"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
