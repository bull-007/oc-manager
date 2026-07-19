"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function DiarySection({ ocId }: { ocId: string }) {
  const [diary, setDiary] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/diary?ocId=${ocId}`).then(r=>r.json()).then(d=>setDiary(d.diary));
  }, [ocId]);

  const handleAnswer = async () => {
    if (!answer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/diary", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ocId, answer:answer.trim()}) });
      if (res.ok) { const data = await res.json(); setDiary(data.diary); setAnswer(""); toast.success("已记录"); }
    } catch { toast.error("保存失败"); }
    setSaving(false);
  };

  if (!diary) return null;

  return (
    <section>
      <h3 className="text-[10px] font-medium text-stone-muted/60 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        <span className="text-[8px] opacity-50 flex-shrink-0">◇</span>
        今日问答
      </h3>
      <p className="text-[10px] text-stone-text/70 italic mb-1.5 leading-relaxed break-words">
        &ldquo;{diary.question}&rdquo;
      </p>
      {diary.answered ? (
        <p className="text-[10px] text-stone-text/60 bg-stone-hover px-2 py-1 break-words" style={{borderRadius:"6px"}}>
          {diary.answer}
        </p>
      ) : (
        <div className="space-y-1.5">
          <textarea value={answer} onChange={e=>setAnswer(e.target.value)}
            placeholder="写下你的回答..." rows={2}
            className="w-full px-2 py-1 text-[10px] border border-stone-border bg-stone-page resize-none focus:outline-none focus:ring-1 focus:ring-sage/40"
            style={{borderRadius:"6px"}} />
          <button onClick={handleAnswer} disabled={saving||!answer.trim()}
            className="text-[10px] px-2 py-0.5 text-white disabled:opacity-40 transition-colors"
            style={{background:"#869087",borderRadius:"4px"}}>保存</button>
        </div>
      )}
    </section>
  );
}
