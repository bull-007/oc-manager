"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BirthdayOC {
  id: string;
  name: string;
  birthday: string;
  avatarUrl: string | null;
}

export default function BirthdayBanner() {
  const [birthdayOCs, setBirthdayOCs] = useState<BirthdayOC[]>([]);
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; e: string; d: number }[]>([]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setConfetti((prev) => {
        const now = Date.now();
        const fresh = prev.filter((c) => now - c.d < 2500);
        const newParticles = Array.from({ length: 3 }, () => ({
          x: Math.random() * 100,
          y: -10,
          e: ["🎂","🎉","🎁","✨","🎀","💝","🌟","🍰","🎈","💐","✿","✦"][Math.floor(Math.random()*12)],
          d: now,
        }));
        return [...fresh, ...newParticles];
      });
    }, 400);
    return () => clearInterval(interval);
  }, [show]);

  useEffect(() => {
    fetch("/api/ocs?limit=100")
      .then((r) => r.json())
      .then((data) => {
        const today = new Date();
        const mmdd = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
        const ocs = (data.ocs||[]).filter((oc:any) => oc.birthday === mmdd).map((oc:any) => ({
          id:oc.id, name:oc.name, birthday:oc.birthday, avatarUrl:oc.media?.[0]?.url||null
        }));
        const todayKey = `bday-dismissed-${mmdd}`;
        if (ocs.length > 0 && !localStorage.getItem(todayKey)) {
          setBirthdayOCs(ocs);
          setTimeout(() => setShow(true), 500);
        }
      }).catch(()=>{});
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(0,0,0,0.30)", backdropFilter: "blur(2px)" }}>
      {/* Confetti particles */}
      {confetti.map((c, i) => (
        <span key={i} className="absolute pointer-events-none select-none text-lg"
          style={{
            left: `${c.x}%`, top: `${c.y}%`,
            animation: "confetti-fall 2.5s linear forwards",
          }}>
          {c.e}
        </span>
      ))}

      {/* Watercolor celebration modal */}
      <div className="relative z-10 shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 60% 45% at 30% 25%, rgba(212,160,160,0.12) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 70% 60%, rgba(200,146,107,0.08) 0%, transparent 55%), #FFFBF2",
          borderRadius: "28px 8px 28px 8px / 22px 6px 22px 6px",
          border: "2px dashed #D4A0A0",
        }}>
        {/* Corner decorations */}
        <span className="absolute top-2 left-3 text-xs text-rose-300/30 pointer-events-none">✿</span>
        <span className="absolute bottom-2 right-3 text-xs text-amber-300/30 pointer-events-none">✦</span>
        <span className="absolute top-3 right-4 text-[10px] text-sage-300/25 pointer-events-none">❀</span>

        <h2 className="text-2xl font-serif font-bold text-warm-brown mb-1 relative">
          🎂 生日快乐！
        </h2>
        <p className="text-sm text-warm-muted mb-6">今天是TA的生日，送上祝福吧！</p>

        <div className="space-y-3 mb-6">
          {birthdayOCs.map((oc) => (
            <Link key={oc.id} href={`/ocs/${oc.id}/panel`}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:translate-x-0.5 transition-all border border-transparent hover:border-rose-200"
              style={{
                background: "radial-gradient(ellipse 60% 50% at 30% 40%, rgba(212,160,160,0.08) 0%, transparent 60%), #FFFDF7",
                borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px",
              }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{
                  background: "radial-gradient(circle at 40% 40%, rgba(212,160,160,0.20) 0%, rgba(243,235,216,0.5) 100%)",
                  border: "2px solid rgba(212,160,160,0.3)",
                }}>
                {oc.avatarUrl ? (
                  <img src={oc.avatarUrl} alt={oc.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-rose-400 font-serif">{oc.name.charAt(0)}</span>
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-warm-brown text-lg">{oc.name}</p>
                <p className="text-xs text-rose-500">点击送上祝福 ✨</p>
              </div>
            </Link>
          ))}
        </div>

        <button onClick={() => {
          const today = new Date();
          const mmdd = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
          localStorage.setItem(`bday-dismissed-${mmdd}`, "1");
          setShow(false);
        }}
          className="px-6 py-2 text-white font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #D4A0A0 0%, #C98282 100%)",
            borderRadius: "20px 6px 20px 6px / 16px 4px 16px 4px",
          }}
        >🎉 知道啦！</button>
      </div>
    </div>
  );
}
