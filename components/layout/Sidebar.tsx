"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "仪表盘" },
  { href: "/ocs", label: "OC 档案" },
  { href: "/worlds", label: "世界观" },
  { href: "/relations", label: "关系图谱" },
  { href: "/inspirations", label: "灵感速记" },
];

export default function Sidebar({ user }: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const pathname = usePathname();

  return (
    <aside className="w-44 min-h-screen bg-stone-card border-r border-stone-border flex flex-col">
      <div className="px-4 py-5 border-b border-stone-border">
        <Link href="/dashboard" className="block group">
          <span className="text-lg font-serif font-medium text-stone-text tracking-wide">
            OC 管理器
          </span>
          <span className="text-[10px] text-stone-muted block mt-0.5">创作伴侣</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm transition-colors duration-150",
                active
                  ? "bg-sage-100/60 text-sage-700 font-medium"
                  : "text-stone-muted hover:bg-stone-hover hover:text-stone-text"
              )}
              style={{ borderRadius: "6px" }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="m-3 p-3 bg-stone-page/60 border border-stone-border" style={{ borderRadius: "8px" }}>
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-sage-100 border border-sage-200 flex items-center justify-center text-sage-700 font-medium text-xs">
            {user.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
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
