"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  cutoutUrl: string | null;
  cutoutPosX: number;
  cutoutPosY: number;
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
  cutoutUrl,
  cutoutPosX,
  cutoutPosY,
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
  const [popping, setPopping] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [editPosition, setEditPosition] = useState(false);
  const [posX, setPosX] = useState(cutoutPosX);
  const [posY, setPosY] = useState(cutoutPosY);
  const avatarRef = useRef<HTMLDivElement>(null);

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

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Smooth pop animation
      setPopping(true);
      setTimeout(() => setPopping(false), 300);

      // Sparkle particles at click position
      const rect = avatarRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const newSparkles = Array.from({ length: 4 }, (_, i) => ({
          id: Date.now() + i,
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
        }));
        setSparkles((prev) => [...prev, ...newSparkles]);
        setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => !newSparkles.includes(s)));
        }, 600);
      }

      // Random quote
      if (quotes.length === 0) return;
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setSpeech(quotes[randomIndex]);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 3500);
    },
    [quotes]
  );

  // First-load random greeting
  useEffect(() => {
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setSpeech(quotes[randomIndex]);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 3500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Floating decorative elements */}
      {floatElements.map((el, i) => (
        <span
          key={i}
          className="absolute text-amber-300/25 pointer-events-none select-none"
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

      {/* Relations as floating companions */}
      <div className="absolute inset-0 pointer-events-none">
        {relations.slice(0, 4).map((r, i) => {
          const positions = [
            { right: "14%", top: "12%" },
            { left: "12%", top: "22%" },
            { right: "18%", bottom: "22%" },
            { left: "16%", bottom: "16%" },
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
                title={`${type.label}: ${r.name}`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg"
                  style={{ backgroundColor: type.color }}
                >
                  {r.name.charAt(0)}
                </div>
                <span className="text-[10px] text-warm-muted/60 group-hover:text-warm-brown transition-colors max-w-[50px] truncate">
                  {r.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Center stage */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Speech bubble */}
        <div
          className={`mb-3 transition-all duration-300 ${
            showSpeech && speech
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-2 scale-95 pointer-events-none"
          }`}
        >
          <div className="bg-warm-paper/95 backdrop-blur-sm border border-amber-200 rounded-2xl px-5 py-2.5 max-w-[220px] text-center shadow-lg relative">
            <p className="text-[13px] text-warm-brown leading-relaxed">{speech || " "}</p>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-warm-paper/95 border-r border-b border-amber-200 rotate-45" />
          </div>
        </div>

        {/* Character avatar */}
        <button
          onClick={handleClick}
          className="group relative cursor-pointer select-none outline-none"
          title="点击互动"
        >
          {/* Glow pulse */}
          <div
            className={`absolute inset-0 rounded-full bg-amber-300/15 blur-2xl scale-125 transition-all duration-700 ${
              popping ? "scale-150 bg-amber-400/30" : "group-hover:bg-amber-400/20 group-hover:scale-140"
            }`}
          />

          {/* Click sparkles */}
          {sparkles.map((s) => (
            <span
              key={s.id}
              className="absolute text-amber-400 pointer-events-none animate-sparkle-out"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                fontSize: "10px",
              }}
            >
              ✦
            </span>
          ))}

          {/* Avatar / Cutout display */}
          <div
            ref={avatarRef}
            className={`relative transition-all duration-300 ${
              cutoutUrl
                ? "w-64 h-80 sm:w-72 sm:h-96"
                : "w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[3px] overflow-hidden bg-amber-50 shadow-2xl"
            } ${
              popping
                ? "scale-105 border-amber-400"
                : `scale-100 ${cutoutUrl ? "" : "border-amber-200 shadow-amber-200/20 group-hover:scale-[1.03] group-hover:border-amber-300 group-hover:shadow-amber-200/30"}`
            }`}
            style={{
              animation: popping ? "pop-bounce 0.3s ease-out" : "none",
            }}
          >
            {cutoutUrl ? (
              <img
                src={cutoutUrl}
                alt={ocName}
                className="w-full h-full object-contain"
                style={{
                  objectPosition: `${posX}% ${posY}%`,
                }}
                draggable={false}
              />
            ) : avatarUrl ? (
              <img
                src={avatarUrl}
                alt={ocName}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                <span className="text-6xl font-serif text-amber-400 select-none">
                  {ocName.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </button>

        {/* Name */}
        <div className="mt-5 text-center">
          <h1 className="text-xl font-serif font-bold text-warm-brown">
            {ocName}
          </h1>
          <p className="text-xs text-warm-muted/70 mt-0.5">
            {[species, occupation, mbti].filter(Boolean).join(" · ") || ""}
          </p>
          {worldName && (
            <p className="text-[11px] text-amber-700/60 mt-0.5">◎ {worldName}</p>
          )}
        </div>
      </div>

      {/* Bottom hint */}
      {quotes.length > 0 && !editPosition && (
        <p className="absolute bottom-4 text-[11px] text-warm-muted/40">
          点击角色互动
        </p>
      )}

      {/* Position edit bar */}
      {cutoutUrl && (
        <div className="absolute bottom-4 left-4 right-4 z-30">
          {editPosition ? (
            <div className="bg-warm-paper/95 backdrop-blur-sm border border-amber-200 rounded-xl p-3 space-y-2 shadow-lg animate-slide-up">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-warm-brown">位置微调</span>
                <div className="flex gap-1">
                  <button
                    onClick={async () => {
                      // Save position
                      await fetch(`/api/ocs/${ocId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ cutoutPosX: posX, cutoutPosY: posY }),
                      });
                      setEditPosition(false);
                    }}
                    className="text-xs px-2 py-0.5 bg-amber-700 text-white rounded"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setPosX(cutoutPosX);
                      setPosY(cutoutPosY);
                      setEditPosition(false);
                    }}
                    className="text-xs px-2 py-0.5 text-warm-muted border border-warm-border rounded"
                  >
                    取消
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-[10px] text-warm-muted mb-0.5">
                    <span>水平</span><span>{posX}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={posX} onChange={(e) => setPosX(Number(e.target.value))} className="w-full accent-amber-600 h-1" />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-warm-muted mb-0.5">
                    <span>垂直</span><span>{posY}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={posY} onChange={(e) => setPosY(Number(e.target.value))} className="w-full accent-amber-600 h-1" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setEditPosition(true)}
                className="text-[11px] px-2.5 py-1 bg-warm-paper/80 backdrop-blur-sm border border-warm-border/50 rounded-full text-warm-muted/60 hover:text-warm-brown hover:border-warm-border transition-all"
              >
                调节位置
              </button>
              <Link
                href={`/ocs/${ocId}/edit`}
                className="text-[11px] px-2.5 py-1 bg-warm-paper/80 backdrop-blur-sm border border-warm-border/50 rounded-full text-warm-muted/60 hover:text-warm-brown hover:border-warm-border transition-all"
              >
                编辑 OC
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
