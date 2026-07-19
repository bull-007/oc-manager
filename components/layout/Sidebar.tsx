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
    <aside className="w-56 min-h-screen bg-warm-paper border-r-2 border-dashed border-warm-border flex flex-col">
      {/* Decorative top doodle */}
      <div className="px-4 pt-1 text-warm-muted/20 text-xs select-none leading-none text-center">
        · ✦ · ◇ · ✧ · ◎ · ⬡ · ✦ ·
      </div>

      {/* Logo */}
      <div className="px-5 py-4 border-b-2 border-dashed border-warm-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
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
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 group",
                active
                  ? "bg-amber-100/80 text-amber-800 font-medium border border-amber-200/60 shadow-sm"
                  : "text-warm-brown/70 hover:bg-amber-50/50 hover:text-amber-700 hover:translate-x-1"
              )}
            >
              <span className={cn(
                "text-base w-6 text-center transition-transform",
                active ? "scale-110" : "group-hover:scale-110",
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
              {active && (
                <span className="ml-auto text-amber-400 text-xs">·</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Decorative bottom flowers */}
      <div className="px-4 pb-1 text-warm-muted/15 text-xs select-none leading-none text-center">
        ✿ · ❀ · ✾ · ✿
      </div>

      {/* User */}
      <div className="m-3 p-3 rounded-2xl bg-amber-50/50 border border-dashed border-amber-200/50">
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
