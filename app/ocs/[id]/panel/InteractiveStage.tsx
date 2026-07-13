"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
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
  cutoutZoom: number;
  quotes: string[];
  species: string | null;
  occupation: string | null;
  mbti: string | null;
  worldName?: string | null;
  ocId: string;
  relations: Relation[];
}

const FLOAT_ICONS = ["✦", "✧", "◇", "◆", "♢", "♤", "♧", "♡"];

// Random positions close around the character for speech bubbles
const BUBBLE_POSITIONS = [
  { top: "50%", left: "50%", tx: "-50%", ty: "-120%" },  // above
  { top: "50%", left: "50%", tx: "-50%", ty: "10%" },    // below
  { top: "50%", left: "50%", tx: "60%", ty: "-50%" },    // right
  { top: "50%", left: "50%", tx: "-160%", ty: "-50%" },  // left
  { top: "50%", left: "50%", tx: "50%", ty: "-90%" },    // top-right
  { top: "50%", left: "50%", tx: "-150%", ty: "-90%" },  // top-left
  { top: "50%", left: "50%", tx: "50%", ty: "0" },       // bottom-right
  { top: "50%", left: "50%", tx: "-150%", ty: "0" },     // bottom-left
];

export default function InteractiveStage({
  ocName,
  avatarUrl,
  cutoutUrl,
  cutoutPosX,
  cutoutPosY,
  cutoutZoom,
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
  const [zoom, setZoom] = useState(cutoutZoom);
  const [bubblePos, setBubblePos] = useState(BUBBLE_POSITIONS[0]);
  const [showToolbar, setShowToolbar] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

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
      setPopping(true);
      setTimeout(() => setPopping(false), 300);

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
        setTimeout(() => setSparkles((prev) => prev.filter((s) => !newSparkles.includes(s))), 600);
      }

      if (quotes.length === 0) return;
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      const randomPos = BUBBLE_POSITIONS[Math.floor(Math.random() * BUBBLE_POSITIONS.length)];
      setSpeech(randomQuote);
      setBubblePos(randomPos);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 6000);
    },
    [quotes]
  );

  useEffect(() => {
    if (quotes.length > 0) {
      setSpeech(quotes[Math.floor(Math.random() * quotes.length)]);
      setBubblePos(BUBBLE_POSITIONS[Math.floor(Math.random() * BUBBLE_POSITIONS.length)]);
      setShowSpeech(true);
      setTimeout(() => setShowSpeech(false), 6000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={stageRef}
      className="flex-1 flex flex-col items-center justify-center relative"
      onMouseEnter={() => setShowToolbar(true)}
      onMouseLeave={() => setShowToolbar(false)}
    >
      {/* Floating decorations */}
      {floatElements.map((el, i) => (
        <span
          key={i}
          className="absolute text-amber-300/20 pointer-events-none select-none"
          style={{
            left: `${el.x}%`, top: `${el.y}%`, fontSize: `${el.size}px`,
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
            { right: "14%", top: "12%" }, { left: "12%", top: "22%" },
            { right: "18%", bottom: "22%" }, { left: "16%", bottom: "16%" },
          ];
          const type = RELATION_TYPES[r.type as RelationType] || RELATION_TYPES.other;
          return (
            <Link key={r.id} href={`/ocs/${r.id}/panel`} className="absolute pointer-events-auto" style={positions[i]}>
              <div className="flex flex-col items-center gap-0.5 group cursor-pointer" title={`${type.label}: ${r.name}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md transition-all duration-300 group-hover:scale-125 group-hover:shadow-lg"
                  style={{ backgroundColor: type.color }}>
                  {r.name.charAt(0)}
                </div>
                <span className="text-[10px] text-warm-muted/50 group-hover:text-warm-brown transition-colors max-w-[50px] truncate">
                  {r.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Center stage */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Speech bubble - oval pill, no arrow */}
        <div
          className={`absolute z-20 transition-all duration-300 pointer-events-none ${
            showSpeech && speech ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
          style={{
            ...bubblePos,
            transform: `translate(${bubblePos.tx}, ${bubblePos.ty})`,
            width: "max-content",
            maxWidth: "260px",
          }}
        >
          <div className="bg-warm-paper/95 backdrop-blur-sm border border-amber-200 rounded-full px-5 py-2.5 shadow-lg">
            <p className="text-[13px] text-warm-brown leading-relaxed" style={{ whiteSpace: "normal" }}>
              {speech || " "}
            </p>
          </div>
        </div>

        {/* Character */}
        <button
          onClick={handleClick}
          className="group relative cursor-pointer select-none outline-none"
          title="点击互动"
        >
          {sparkles.map((s) => (
            <span key={s.id} className="absolute text-amber-400 pointer-events-none animate-sparkle-out"
              style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: "10px" }}>✦</span>
          ))}

          <div
            ref={avatarRef}
            className={`relative transition-all duration-300 ${
              cutoutUrl ? "w-56 h-80 sm:w-64 sm:h-96" : "w-44 h-44 sm:w-52 sm:h-52 rounded-full border-[3px] overflow-hidden bg-amber-50 shadow-2xl"
            } ${
              popping ? "scale-105 border-amber-400" :
              `scale-100 ${cutoutUrl ? "" : "border-amber-200 shadow-amber-200/20 group-hover:scale-[1.03] group-hover:border-amber-300"}`
            }`}
            style={{ animation: popping ? "pop-bounce 0.3s ease-out" : "none" }}
          >
            {cutoutUrl ? (
              <img src={cutoutUrl} alt={ocName}
                className="w-full h-full object-contain"
                style={{
                  transform: `translate(${(posX - 50) * 0.4}%, ${(posY - 50) * 0.4}%) scale(${zoom})`,
                }}
                draggable={false}
              />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt={ocName} className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                <span className="text-6xl font-serif text-amber-400 select-none">{ocName.charAt(0)}</span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Top-right toolbar */}
      <div className={`absolute top-4 right-4 z-30 flex items-center gap-1.5 transition-all duration-300 ${
        showToolbar ? "opacity-100" : "opacity-0"
      }`}>
        {cutoutUrl && (
          <button
            onClick={() => {
              if (editPosition) {
                setPosX(cutoutPosX);
                setPosY(cutoutPosY);
                setZoom(cutoutZoom);
              }
              setEditPosition(!editPosition);
            }}
            className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-all ${
              editPosition
                ? "bg-amber-100 border-amber-300 text-amber-800"
                : "bg-warm-paper/80 border-warm-border/50 text-warm-muted/60 hover:text-warm-brown hover:border-warm-border"
            }`}
          >
            {editPosition ? "完成" : "位置"}
          </button>
        )}
        <Link
          href={`/ocs/${ocId}/edit`}
          className="text-[11px] px-2.5 py-1.5 rounded-full bg-warm-paper/80 border border-warm-border/50 text-warm-muted/60 hover:text-warm-brown hover:border-warm-border transition-all"
        >
          编辑
        </Link>
      </div>

      {/* Position controls */}
      {editPosition && cutoutUrl && (
        <div className="absolute bottom-6 left-6 right-6 z-30 animate-slide-up">
          <div className="bg-warm-paper/95 backdrop-blur-sm border border-amber-200 rounded-xl p-3 shadow-lg max-w-md mx-auto">
            <p className="text-[10px] text-warm-muted mb-2 text-center">拖拽滑块调节角色</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] text-warm-muted mb-0.5">
                  <span>← 水平 →</span><span>{posX}%</span>
                </div>
                <input type="range" min="0" max="100" value={posX}
                  onChange={(e) => setPosX(Number(e.target.value))}
                  className="w-full accent-amber-600 h-1" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-warm-muted mb-0.5">
                  <span>↑ 垂直 ↓</span><span>{posY}%</span>
                </div>
                <input type="range" min="0" max="100" value={posY}
                  onChange={(e) => setPosY(Number(e.target.value))}
                  className="w-full accent-amber-600 h-1" />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-warm-muted mb-0.5">
                  <span>🔍 缩放</span><span>{zoom.toFixed(1)}x</span>
                </div>
                <input type="range" min="0.5" max="2.5" step="0.1" value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-amber-600 h-1" />
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={() => { setPosX(50); setPosY(50); setZoom(1); }}
                className="text-[10px] px-2 py-1 text-warm-muted border border-warm-border rounded hover:bg-warm-cream"
              >
                重置
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/ocs/${ocId}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ cutoutPosX: posX, cutoutPosY: posY, cutoutZoom: zoom }),
                    });
                    if (res.ok) toast.success("已保存");
                    else toast.error("保存失败");
                  } catch { toast.error("网络错误"); }
                  setEditPosition(false);
                }}
                className="text-xs px-4 py-1 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
