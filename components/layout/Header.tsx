"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-warm-paper/80 backdrop-blur-md border-b border-dashed border-warm-border">
      <div className="flex items-center justify-between px-6 py-3">
        <div />
        <div className="flex items-center gap-3">
          <Link
            href="/ocs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-warm-cream text-sm font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
            style={{
              background: "#B8977E",
              borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px",
            }}
          >
            <span className="text-base">+</span> 新建 OC
          </Link>
        </div>
      </div>
    </header>
  );
}
