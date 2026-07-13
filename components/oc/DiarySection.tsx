"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function DiarySection({ ocId }: { ocId: string }) {
  const [diary, setDiary] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/diary?ocId=${ocId}`)
      .then((r) => r.json())
      .then((d) => setDiary(d.diary));
  }, [ocId]);

  const handleAnswer = async () => {
    if (!answer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ocId, answer: answer.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setDiary(data.diary);
        setAnswer("");
        toast.success("已记录 ✨");
      }
    } catch { toast.error("保存失败"); }
    setSaving(false);
  };

  if (!diary) return null;

  return (
    <section>
      <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
        📝 今日问答
      </h3>
      <p className="text-[10px] text-warm-brown/70 italic mb-1.5 leading-relaxed">
        " {diary.question} "
      </p>
      {diary.answered ? (
        <p className="text-[10px] text-warm-brown/60 bg-amber-50/50 rounded-md px-2 py-1">
          💬 {diary.answer}
        </p>
      ) : (
        <div className="space-y-1.5">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="写下你的回答..."
            rows={2}
            className="w-full px-2 py-1 text-[10px] border border-warm-border rounded-md bg-warm-cream resize-none focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button
            onClick={handleAnswer}
            disabled={saving || !answer.trim()}
            className="text-[10px] px-2 py-0.5 bg-amber-700 text-white rounded-md hover:bg-amber-800 disabled:opacity-40"
          >
            保存
          </button>
        </div>
      )}
    </section>
  );
}
