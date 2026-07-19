"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-warm-paper/85 backdrop-blur-md border-b-2 border-dashed border-warm-border">
      <div className="flex items-center justify-between px-5 py-2.5">
        <div className="flex items-center gap-2 text-warm-muted/30 select-none text-xs">
          ✿ · ❀
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ocs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-700 text-warm-cream rounded-2xl text-sm font-medium hover:bg-amber-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <span className="text-base">+</span> 新建 OC
          </Link>
        </div>
      </div>
    </header>
  );
}
