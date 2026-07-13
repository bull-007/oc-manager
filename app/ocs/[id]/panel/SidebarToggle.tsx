"use client";

import { useState, ReactNode } from "react";

export default function SidebarToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Sliding sidebar */}
      <div
        className={`h-full overflow-hidden transition-all duration-300 ease-out flex-shrink-0 ${
          open ? "w-48 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div className="w-48 h-full">{children}</div>
      </div>

      {/* Toggle button - sticks to the left edge of the stage */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-5 h-12 flex items-center justify-center bg-warm-paper/60 backdrop-blur-sm border border-warm-border/40 rounded-r-lg hover:bg-warm-paper hover:border-warm-border transition-all group"
        title={open ? "收起信息" : "展开信息"}
      >
        <svg
          className={`w-3 h-3 text-warm-muted/50 group-hover:text-warm-brown transition-transform duration-300 ${
            open ? "rotate-0" : "rotate-180"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </>
  );
}
