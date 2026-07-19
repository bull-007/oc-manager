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
    <aside className="w-48 min-h-screen bg-warm-paper border-r border-dashed border-warm-border flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-dashed border-warm-border">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <span className="text-xl transition-transform group-hover:scale-110 group-hover:-rotate-6">📖</span>
          <div>
            <span className="text-base font-hand text-warm-brown tracking-wide block leading-tight">
              OC 管理器
            </span>
            <span className="text-[10px] text-warm-muted/60 block leading-tight">创作伴侣</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 group",
                active
                  ? "bg-amber-100/60 text-amber-700 font-medium"
                  : "text-warm-brown/60 hover:bg-warm-bg hover:text-warm-brown hover:translate-x-1"
              )}
            >
              <span className={cn(
                "text-sm w-5 text-center transition-transform",
                active ? "scale-110" : "group-hover:scale-110",
              )}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="m-3 p-3 rounded-2xl bg-warm-bg/50 border border-dashed border-warm-border/50">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-200/50 flex items-center justify-center text-amber-700 font-bold text-xs">
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
