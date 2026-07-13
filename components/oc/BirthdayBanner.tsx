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
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/ocs?limit=100")
      .then((r) => r.json())
      .then((data) => {
        const today = new Date();
        const mmdd = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        const ocs = (data.ocs || [])
          .filter((oc: any) => oc.birthday === mmdd)
          .map((oc: any) => ({
            id: oc.id,
            name: oc.name,
            birthday: oc.birthday,
            avatarUrl: oc.media?.[0]?.url || null,
          }));
        setBirthdayOCs(ocs);
      })
      .catch(() => {});
  }, []);

  if (birthdayOCs.length === 0 || dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-100 via-amber-50 to-pink-100 border-2 border-pink-200 p-5 shadow-lg animate-slide-up">
      {/* Confetti dots */}
      <div className="absolute inset-0 pointer-events-none">
        {["🎂", "🎉", "🎁", "✨", "🎀", "💝", "🌟", "🍰"].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-sm opacity-60"
            style={{
              left: `${10 + i * 10}%`,
              top: `${Math.random() * 80}%`,
              animation: `float ${2 + Math.random() * 3}s ease-in-out ${i * 0.3}s infinite`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-pink-800 flex items-center gap-2">
              🎂 今天是TA的生日！
            </h2>
            <div className="mt-3 space-y-2">
              {birthdayOCs.map((oc) => (
                <Link
                  key={oc.id}
                  href={`/ocs/${oc.id}/panel`}
                  className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2.5 hover:bg-white/90 transition-colors border border-pink-100"
                >
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden border-2 border-pink-200 flex-shrink-0">
                    {oc.avatarUrl ? (
                      <img src={oc.avatarUrl} alt={oc.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg text-pink-400 font-serif">{oc.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-warm-brown">{oc.name}</p>
                    <p className="text-xs text-pink-600">生日快乐！🎉</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-pink-400 hover:text-pink-600 text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
