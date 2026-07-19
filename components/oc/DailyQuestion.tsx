"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface QuestionItem {
  ocId: string;
  ocName: string;
  question: string;
  answered: boolean;
  diaryId: string | null;
  answer: string | null;
}

export default function DailyQuestion() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    fetch("/api/diary?all=true")
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions || []))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (ocId: string) => {
    if (!answer.trim()) return;
    try {
      const res = await fetch("/api/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ocId, answer: answer.trim() }),
      });
      if (res.ok) {
        toast.success("回答已记录 📝");
        setQuestions((prev) =>
          prev.map((q) => (q.ocId === ocId ? { ...q, answered: true, answer: answer.trim() } : q))
        );
        setAnswer("");
        setAnswering(null);
      }
    } catch { toast.error("保存失败"); }
  };

  if (loading) return null;
  if (questions.length === 0) return null;

  const unanswered = questions.filter((q) => !q.answered);

  return (
    <section className="watercolor-section">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif font-bold text-warm-brown">📝 今日OC问答</h2>
          <p className="text-xs text-warm-muted mt-0.5">
            {unanswered.length > 0
              ? `${unanswered.length} 个问题等待回答`
              : "今日全部完成 ✨"}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div
            key={q.ocId}
            className={`p-3 border transition-colors ${
              q.answered
                ? "border-green-200"
                : "border-amber-200"
            }`}
            style={{
              borderRadius: "14px 4px 14px 4px / 12px 3px 12px 3px",
              background: q.answered
                ? "radial-gradient(ellipse 50% 50% at 70% 30%, rgba(160,184,160,0.06) 0%, transparent 60%), #FFFBF2"
                : "radial-gradient(ellipse 50% 50% at 70% 30%, rgba(200,146,107,0.06) 0%, transparent 60%), #FFFBF2",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link
                    href={`/ocs/${q.ocId}/panel`}
                    className="text-sm font-medium text-warm-brown hover:text-amber-700"
                  >
                    ◆ {q.ocName}
                  </Link>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      q.answered
                        ? "bg-green-100 text-green-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {q.answered ? "已答" : "待答"}
                  </span>
                </div>
                <p className="text-sm text-warm-brown/80 italic">
                  " {q.question} "
                </p>
                {q.answered && q.answer && (
                  <p className="text-xs text-warm-muted mt-1.5 bg-white/50 rounded-md px-2.5 py-1.5">
                    💬 {q.answer}
                  </p>
                )}
              </div>
            </div>

            {!q.answered && answering === q.ocId && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(q.ocId)}
                  placeholder="写下你的回答..."
                  className="flex-1 px-3 py-1.5 text-sm border border-warm-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  autoFocus
                />
                <button
                  onClick={() => handleSubmit(q.ocId)}
                  className="px-3 py-1.5 text-sm bg-amber-700 text-white hover:bg-amber-800 transition-colors"
                  style={{ borderRadius: "12px 4px 12px 4px / 10px 3px 10px 3px" }}
                >
                  保存
                </button>
              </div>
            )}

            {!q.answered && answering !== q.ocId && (
              <button
                onClick={() => setAnswering(q.ocId)}
                className="mt-2 text-xs text-amber-700 hover:text-amber-800 font-medium"
              >
                ✎ 回答这个问题
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
