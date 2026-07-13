"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RELATION_TYPES, type RelationType } from "@/lib/utils";

interface Relation {
  name: string;
  id: string;
  type: string;
  intimacy: number;
}

interface Props {
  ocName: string;
  avatarUrl: string | null;
  quotes: string[];
  species: string | null;
  occupation: string | null;
  mbti: string | null;
  worldName?: string | null;
  ocId: string;
  relations: Relation[];
}

const FLOAT_ICONS = ["✦", "✧", "◇", "◆", "♢", "♤", "♧", "♡"];

export default function InteractiveStage({
  ocName,
  avatarUrl,
  quotes,
  species,
  occupation,
  mbti,
  worldName,
  ocId,
  relations,
}: Props) {
  const [speech, setSpeech] = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const [speechIndex, setSpeechIndex] = useState(0);
  const [floatElements] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      icon: FLOAT_ICONS[i % FLOAT_ICONS.length],
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 70,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 12 + Math.random() * 14,
    }))
  );

  const handleClick = useCallback(() => {
    if (quotes.length === 0) return;
    const nextIndex = (speechIndex + 1) % quotes.length;
    setSpeechIndex(nextIndex);
    setSpeech(quotes[nextIndex]);
    setShowSpeech(true);
    setTimeout(() => setShowSpeech(false), 4000);
  }, [quotes, speechIndex]);

  // Auto-speak on first load
  useEffect(() => {
    if (quotes.length > 0) {
      setSpeech(quotes[0]);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 4000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Floating decorative elements */}
      {floatElements.map((el, i) => (
        <span
          key={i}
          className="absolute text-amber-300/30 pointer-events-none select-none"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            fontSize: `${el.size}px`,
            animation: `float ${el.duration}s ease-in-out ${el.delay}s infinite`,
          }}
        >
          {el.icon}
        </span>
      ))}

      {/* Close relations as floating companions */}
      <div className="absolute inset-0 pointer-events-none">
        {relations.slice(0, 4).map((r, i) => {
          const positions = [
            { right: "15%", top: "15%" },
            { left: "15%", top: "25%" },
            { right: "20%", bottom: "25%" },
            { left: "20%", bottom: "20%" },
          ];
          const type = RELATION_TYPES[r.type as RelationType] || RELATION_TYPES.other;
          return (
            <Link
              key={r.id}
              href={`/ocs/${r.id}/panel`}
              className="absolute pointer-events-auto"
              style={positions[i]}
            >
              <div
                className="flex flex-col items-center gap-0.5 group cursor-pointer"
                title={`${type.label}: ${r.name} (${r.intimacy})`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md transition-transform group-hover:scale-125 group-hover:shadow-lg"
                  style={{ backgroundColor: type.color }}
                >
                  {r.name.charAt(0)}
                </div>
                <span className="text-xs text-warm-muted group-hover:text-warm-brown transition-colors max-w-[60px] truncate">
                  {r.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Character display area */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Speech bubble */}
        {showSpeech && speech && (
          <div
            className="mb-4 bg-warm-paper border-2 border-amber-200 rounded-2xl px-6 py-3 max-w-xs text-center shadow-lg animate-scale-in relative"
          >
            <p className="text-sm text-warm-brown leading-relaxed">{speech}</p>
            {/* Triangle */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-warm-paper border-r-2 border-b-2 border-amber-200 rotate-45" />
          </div>
        )}

        {/* Character avatar circle */}
        <button
          onClick={handleClick}
          className="group relative cursor-pointer select-none"
          title="点击互动"
        >
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-2xl scale-150 group-hover:bg-amber-400/30 transition-all duration-500" />

          {/* Main avatar */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-amber-300 shadow-2xl overflow-hidden bg-amber-50 transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400 group-hover:shadow-amber-200/50 group-active:scale-95">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={ocName}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                <span className="text-7xl font-serif text-amber-500 select-none">
                  {ocName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Sparkle hint */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-warm-muted opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ✦ 点击互动 ✦
          </div>
        </button>

        {/* Name & info */}
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-serif font-bold text-warm-brown">
            {ocName}
          </h1>
          <p className="text-sm text-warm-muted mt-1">
            {[species, occupation, mbti].filter(Boolean).join(" · ") || "未知"}
          </p>
          {worldName && (
            <p className="text-xs text-amber-700 mt-1">◎ {worldName}</p>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      {quotes.length > 0 && (
        <p className="absolute bottom-4 text-xs text-warm-muted/50 animate-pulse">
          点击角色听听她想说什么
        </p>
      )}

      {/* Edit button */}
      <Link
        href={`/ocs/${ocId}/edit`}
        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-warm-paper/60 backdrop-blur-sm border border-warm-border/50 text-warm-muted/50 hover:text-warm-brown hover:bg-warm-paper hover:border-warm-border transition-all"
        title="编辑"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </Link>
    </div>
  );
}
