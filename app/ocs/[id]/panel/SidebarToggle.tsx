"use client";

import { useState, ReactNode } from "react";

export default function SidebarToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      <div
        className={`h-full overflow-hidden transition-all duration-300 ease-out flex-shrink-0 ${
          open ? "w-48 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="w-48 h-full overflow-hidden">{children}</div>
      </div>

      <button
        onClick={() => setOpen(!open)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-5 h-12 flex items-center justify-center bg-stone-card/60 backdrop-blur-sm border border-stone-border/40 hover:bg-stone-card hover:border-stone-border transition-all group"
        style={{borderRadius:"0 6px 6px 0"}}
        title={open ? "收起信息" : "展开信息"}
      >
        <svg
          className={`w-3 h-3 text-stone-muted/50 group-hover:text-stone-text transition-transform duration-300 ${
            open ? "rotate-0" : "rotate-180"
          }`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </>
  );
}
