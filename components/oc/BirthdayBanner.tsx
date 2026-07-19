"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface BirthdayOC { id: string; name: string; birthday: string; avatarUrl: string | null; }

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
        const emoji = ["🎂","🎉","🎁","✨","🎀","💝","🌟","🍰","🎈","💐"];
        const newParticles = Array.from({ length: 3 }, () => ({ x: Math.random()*100, y: -10, e: emoji[Math.floor(Math.random()*10)], d: now }));
        return [...fresh, ...newParticles];
      });
    }, 400);
    return () => clearInterval(interval);
  }, [show]);

  useEffect(() => {
    fetch("/api/ocs?limit=100").then(r=>r.json()).then(data=>{
      const today = new Date();
      const mmdd = `${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
      const ocs = (data.ocs||[]).filter((oc:any)=>oc.birthday===mmdd).map((oc:any)=>({id:oc.id,name:oc.name,birthday:oc.birthday,avatarUrl:oc.media?.[0]?.url||null}));
      const key = `bday-dismissed-${mmdd}`;
      if (ocs.length > 0 && !localStorage.getItem(key)) { setBirthdayOCs(ocs); setTimeout(()=>setShow(true),500); }
    }).catch(()=>{});
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" style={{background:"rgba(0,0,0,0.2)",backdropFilter:"blur(2px)"}}>
      {confetti.map((c,i)=>(<span key={i} className="absolute pointer-events-none select-none text-lg" style={{left:`${c.x}%`,top:`${c.y}%`,animation:"confetti-fall 2.5s linear forwards"}}>{c.e}</span>))}
      <div className="relative z-10 shadow-xl p-8 max-w-sm w-full mx-4 text-center animate-scale-in bg-stone-card" style={{borderRadius:"16px",border:"1px solid #D3D2CE"}}>
        <h2 className="text-xl font-serif font-medium text-stone-text mb-1">🎂 生日快乐！</h2>
        <p className="text-sm text-stone-muted mb-6">今天是TA的生日，送上祝福吧！</p>
        <div className="space-y-3 mb-6">
          {birthdayOCs.map((oc)=>(
            <Link key={oc.id} href={`/ocs/${oc.id}/panel`}
              className="flex items-center gap-4 px-4 py-3 bg-stone-page border border-stone-border hover:border-sage transition-all"
              style={{borderRadius:"10px"}}>
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden flex-shrink-0 bg-sage-100 border border-sage-200" style={{borderRadius:"50%"}}>
                {oc.avatarUrl ? <img src={oc.avatarUrl} alt={oc.name} className="w-full h-full object-cover"/> : <span className="text-xl font-serif text-sage-600">{oc.name.charAt(0)}</span>}
              </div>
              <div className="text-left">
                <p className="font-serif font-medium text-stone-text">{oc.name}</p>
                <p className="text-xs text-stone-muted">点击送上祝福 ✨</p>
              </div>
            </Link>
          ))}
        </div>
        <button onClick={()=>{const today=new Date();const mmdd=`${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;localStorage.setItem(`bday-dismissed-${mmdd}`,"1");setShow(false);}}
          className="px-6 py-2 text-sm font-medium text-white transition-colors" style={{background:"#869087",borderRadius:"8px"}}>🎉 知道啦！</button>
      </div>
    </div>
  );
}
