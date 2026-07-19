"use client";

import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "bg-warm-paper border-2 border-dashed border-warm-border shadow-2xl w-full animate-scale-in relative overflow-hidden",
          sizeClasses[size]
        )}
        style={{ borderRadius: "24px 8px 24px 8px / 20px 6px 20px 6px" }}
      >
        {/* Watercolor wash behind content */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 25% 30%, rgba(200,146,107,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 45% at 75% 65%, rgba(160,184,160,0.04) 0%, transparent 55%)",
          }} />

        {/* Corner decorations */}
        <span className="absolute top-1 left-2 text-[10px] text-amber-300/30 pointer-events-none select-none">✦</span>
        <span className="absolute bottom-1 right-2 text-[10px] text-amber-300/30 pointer-events-none select-none">✿</span>

        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-dashed border-warm-border relative">
            <h2 className="text-lg font-serif font-bold text-warm-brown">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-warm-muted hover:text-warm-brown transition-colors text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-warm-cream"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-6 max-h-[70vh] overflow-y-auto relative">{children}</div>
      </div>
    </div>
  );
}
