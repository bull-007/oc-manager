"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "仪表盘", mark: "◇" },
  { href: "/ocs", label: "OC 档案", mark: "◆" },
  { href: "/worlds", label: "世界观", mark: "◎" },
  { href: "/relations", label: "关系图谱", mark: "⬡" },
  { href: "/inspirations", label: "灵感速记", mark: "△" },
];

export default function Sidebar({ user }: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();

  return (
    <aside className="w-44 min-h-screen bg-stone-card border-r border-stone-border flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-stone-border">
        <Link href="/dashboard" className="block group">
          <div className="flex items-center gap-2">
            <span className="text-stone-text/60 text-sm transition-colors group-hover:text-sage-600">◇</span>
            <span className="text-base font-serif font-medium text-stone-text tracking-wide">
              OC 管理器
            </span>
          </div>
          <span className="text-[10px] text-stone-muted block mt-0.5 ml-6">创作伴侣</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-sage-100/60 text-sage-700 font-medium"
                  : "text-stone-muted hover:bg-stone-hover hover:text-stone-text"
              )}
              style={{ borderRadius: "6px" }}
            >
              <span className={cn(
                "text-xs w-4 text-center flex-shrink-0 transition-transform",
                active && "scale-110"
              )}>
                {item.mark}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="m-3 p-3 bg-stone-page/60 border border-stone-border flex-shrink-0" style={{ borderRadius: "8px" }}>
        <div className="flex items-center gap-2.5 mb-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-700 font-medium text-xs flex-shrink-0">
            {user.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-xs font-medium text-stone-text truncate">{user.name}</p>
            <p className="text-[10px] text-stone-muted truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-[11px] text-stone-muted hover:text-red-500 transition-colors py-1"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
