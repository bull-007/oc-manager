"use client";

import { useState, useEffect } from "react";

export default function PanelInteractions({ quotes }: { quotes: string[] }) {
  const [current, setCurrent] = useState(0);

  // Auto-rotate quotes
  useEffect(() => {
    if (quotes.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  if (quotes.length === 0) return null;

  return (
    <div className="bg-warm-paper border border-warm-border rounded-xl p-5 text-center relative overflow-hidden">
      {/* Quote icon */}
      <div className="text-3xl text-amber-300 mb-2">"</div>

      {/* Quote text */}
      <div className="relative min-h-[3rem] flex items-center justify-center">
        {quotes.map((q, i) => (
          <p
            key={i}
            className={`text-warm-brown/80 italic transition-all duration-500 absolute inset-0 flex items-center justify-center px-4 ${
              i === current
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            {q}
          </p>
        ))}
      </div>

      {/* Dots */}
      {quotes.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {quotes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current
                  ? "bg-amber-500 w-4"
                  : "bg-warm-border hover:bg-amber-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
