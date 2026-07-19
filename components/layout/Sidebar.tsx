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

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-warm-paper border-r border-warm-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-warm-border border-dashed">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl" style={{ filter: "grayscale(0.3) opacity(0.8)" }}>📖</span>
          <span className="text-lg font-serif font-bold text-warm-brown tracking-wide">
            OC 管理器
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-amber-100 text-amber-900 font-medium shadow-sm"
                  : "text-warm-brown hover:bg-warm-cream hover:text-amber-800"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-warm-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm">
            {user.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-brown truncate">
              {user.name}
            </p>
            <p className="text-xs text-warm-muted truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-xs text-warm-muted hover:text-red-600 transition-colors py-1.5 rounded hover:bg-red-50"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
