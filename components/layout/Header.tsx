"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-warm-paper/85 backdrop-blur-md border-b-2 border-dashed border-warm-border">
      {/* Watercolor wash stripe */}
      <div className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: "linear-gradient(to right, transparent, rgba(200,146,107,0.3) 20%, rgba(200,146,107,0.3) 80%, transparent)",
        }} />
      <div className="flex items-center justify-between px-5 py-2.5">
        <div className="flex items-center gap-1.5 text-warm-muted/25 select-none text-xs">
          <span className="text-[10px] opacity-50">✦</span>
          <span className="opacity-30">·</span>
          <span className="text-[8px] opacity-40">✿</span>
          <span className="opacity-30">·</span>
          <span className="text-[9px] opacity-50">❀</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ocs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-warm-cream rounded-2xl text-sm font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #8A5D3E 0%, #6B4830 100%)",
              borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px",
            }}
          >
            {/* Sheen overlay on hover */}
            <span className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)",
              }} />
            <span className="text-base relative">+</span>
            <span className="relative">新建 OC</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
