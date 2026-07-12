"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-warm-paper/90 backdrop-blur-md border-b border-warm-border">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-lg font-serif font-bold text-warm-brown hover:text-amber-700 transition-colors"
          >
            📖 OC 管理器
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ocs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 text-warm-cream rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors shadow-sm"
          >
            <span>+</span> 新建 OC
          </Link>
        </div>
      </div>
    </header>
  );
}
