"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-stone-card/80 backdrop-blur-md border-b border-stone-border">
      <div className="flex items-center justify-between px-6 py-2.5">
        <div />
        <Link
          href="/ocs/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: "#869087",
            color: "#fff",
            borderRadius: "8px",
          }}
        >
          + 新建 OC
        </Link>
      </div>
    </header>
  );
}
