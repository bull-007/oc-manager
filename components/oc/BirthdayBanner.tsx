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

  // Spawn confetti particles
  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setConfetti((prev) => {
        const now = Date.now();
        const fresh = prev.filter((c) => now - c.d < 2500);
        const newParticles = Array.from({ length: 3 }, () => ({
          x: Math.random() * 100,
          y: -10,
          e: ["🎂","🎉","🎁","✨","🎀","💝","🌟","🍰","🎈","💐"][Math.floor(Math.random()*10)],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}>
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

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in border-4 border-pink-200">
        <h2 className="text-2xl font-serif font-bold text-pink-700 mb-1">🎂 生日快乐！</h2>
        <p className="text-sm text-warm-muted mb-6">今天是TA的生日，送上祝福吧！</p>

        <div className="space-y-3 mb-6">
          {birthdayOCs.map((oc) => (
            <Link key={oc.id} href={`/ocs/${oc.id}/panel`}
              className="flex items-center gap-4 bg-pink-50 rounded-2xl px-4 py-3 hover:bg-pink-100 transition-colors border border-pink-100">
              <div className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden border-2 border-pink-200 flex-shrink-0">
                {oc.avatarUrl ? (
                  <img src={oc.avatarUrl} alt={oc.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-pink-400 font-serif">{oc.name.charAt(0)}</span>
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-warm-brown text-lg">{oc.name}</p>
                <p className="text-xs text-pink-500">点击送上祝福 ✨</p>
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
          className="px-6 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-colors shadow-lg"
        >🎉 知道啦！</button>
      </div>
    </div>
  );
}
