"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface QuestionItem { ocId: string; ocName: string; question: string; answered: boolean; diaryId: string | null; answer: string | null; }

export default function DailyQuestion() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => { fetch("/api/diary?all=true").then(r=>r.json()).then(d=>setQuestions(d.questions||[])).finally(()=>setLoading(false)); }, []);

  const handleSubmit = async (ocId: string) => {
    if (!answer.trim()) return;
    const res = await fetch("/api/diary", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ocId, answer:answer.trim()}) });
    if (res.ok) { toast.success("回答已记录"); setQuestions(prev=>prev.map(q=>(q.ocId===ocId?{...q,answered:true,answer:answer.trim()}:q))); setAnswer(""); setAnswering(null); }
    else { toast.error("保存失败"); }
  };

  if (loading) return null;
  if (questions.length === 0) return null;
  const unanswered = questions.filter(q=>!q.answered);

  return (
    <section className="bg-stone-card border border-stone-border p-6" style={{borderRadius:"10px"}}>
      <h2 className="font-serif font-medium text-stone-text mb-4">📝 今日OC问答</h2>
      <p className="text-xs text-stone-muted -mt-3 mb-4">{unanswered.length>0?`${unanswered.length} 个问题等待回答`:"今日全部完成 ✨"}</p>
      <div className="space-y-2.5">
        {questions.map((q)=>(
          <div key={q.ocId} className={`p-3 border transition-colors ${q.answered?"border-green-200 bg-green-50/40":"border-amber-200 bg-amber-50/40"}`} style={{borderRadius:"8px"}}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/ocs/${q.ocId}/panel`} className="text-sm font-medium text-stone-text hover:text-sage-600">{q.ocName}</Link>
                  <span className={`text-[10px] px-1.5 py-0.5 ${q.answered?"bg-green-100 text-green-600":"bg-amber-100 text-amber-700"}`} style={{borderRadius:"4px"}}>{q.answered?"已答":"待答"}</span>
                </div>
                <p className="text-sm text-stone-text/80 italic">"{q.question}"</p>
                {q.answered&&q.answer&&<p className="text-xs text-stone-muted mt-1.5 bg-white/50 px-2.5 py-1.5" style={{borderRadius:"6px"}}>💬 {q.answer}</p>}
              </div>
            </div>
            {!q.answered&&answering===q.ocId&&(
              <div className="mt-2 flex gap-2">
                <input type="text" value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit(q.ocId)}
                  placeholder="写下你的回答..." className="flex-1 px-3 py-1.5 text-sm border border-stone-border bg-white focus:outline-none focus:ring-2 focus:ring-sage/30" style={{borderRadius:"6px"}} autoFocus/>
                <button onClick={()=>handleSubmit(q.ocId)} className="px-3 py-1.5 text-sm text-white transition-colors" style={{background:"#869087",borderRadius:"6px"}}>保存</button>
              </div>
            )}
            {!q.answered&&answering!==q.ocId&&<button onClick={()=>setAnswering(q.ocId)} className="mt-2 text-xs text-sage-600 hover:text-sage-700 font-medium">✎ 回答这个问题</button>}
          </div>
        ))}
      </div>
    </section>
  );
}
