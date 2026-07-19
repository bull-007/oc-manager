"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-stone-card/80 backdrop-blur-md border-b border-stone-border">
      <div className="flex items-center justify-between px-6 py-2.5">
        <div className="flex items-center gap-3 text-stone-muted/30 text-xs select-none">
          <span className="text-stone-border/40">◆</span>
          <span className="text-stone-border/30">◎</span>
          <span className="text-stone-border/40">⬡</span>
        </div>
        <Link
          href="/ocs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors"
          style={{ background: "#869087", color: "#fff", borderRadius: "8px" }}
        >
          <span className="text-base leading-none">+</span> 新建 OC
        </Link>
      </div>
    </header>
  );
}
