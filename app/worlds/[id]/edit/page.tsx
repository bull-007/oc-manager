"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";

const inputClass =
  "w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm text-warm-brown placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent";
const labelClass = "block text-sm font-medium text-warm-brown mb-1";
const textareaClass = `${inputClass} resize-none`;

export default function EditWorldPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({
    name: "", type: "", coreConcept: "", era: "", techLevel: "",
    overview: "", geography: "", history: "", society: "",
    religions: "", festivals: "", laws: "", currency: "", artStyle: "",
    factions: "", magicSystem: "", status: "draft",
  });

  useEffect(() => {
    fetch(`/api/worlds/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.world) {
          const w = data.world;
          setForm({
            name: w.name || "", type: w.type || "", coreConcept: w.coreConcept || "",
            era: w.era || "", techLevel: w.techLevel || "", overview: w.overview || "",
            geography: w.geography || "", history: w.history || "", society: w.society || "",
            religions: w.religions || "", festivals: w.festivals || "", laws: w.laws || "",
            currency: w.currency || "", artStyle: w.artStyle || "", factions: w.factions || "",
            magicSystem: w.magicSystem || "", status: w.status || "draft",
          });
        }
        setLoadingData(false);
      });
  }, [id]);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/worlds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("已更新");
        router.push(`/worlds/${id}`);
        router.refresh();
      } else {
        toast.error("更新失败");
      }
    } catch {
      toast.error("更新失败");
    }
    setLoading(false);
  };

  if (loadingData) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-warm-muted">加载中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-warm-brown">编辑世界观</h1>
        <p className="text-warm-muted text-sm mt-1">修改「{form.name}」的信息</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-warm-paper border border-warm-border rounded-xl p-6 space-y-4">
        <h3 className="font-serif font-bold text-warm-brown text-lg mb-4">概述</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>世界名称 *</label>
            <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>世界观类型</label>
            <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
              <option value="">选择类型</option>
              <option value="奇幻">奇幻</option>
              <option value="科幻">科幻</option>
              <option value="现代">现代</option>
              <option value="古代">古代</option>
              <option value="末日">末日</option>
              <option value="混合">混合</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>核心设定</label>
            <input type="text" value={form.coreConcept} onChange={(e) => update("coreConcept", e.target.value)} className={inputClass} />
          </div>
          <div><label className={labelClass}>时代背景</label><input type="text" value={form.era} onChange={(e) => update("era", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>科技水平</label><input type="text" value={form.techLevel} onChange={(e) => update("techLevel", e.target.value)} className={inputClass} /></div>
          <div className="md:col-span-2">
            <label className={labelClass}>世界概述</label>
            <textarea value={form.overview} onChange={(e) => update("overview", e.target.value)} className={textareaClass} rows={4} />
          </div>
        </div>

        <h3 className="font-serif font-bold text-warm-brown text-lg mb-4 pt-4 border-t border-warm-border">地理</h3>
        <textarea value={form.geography} onChange={(e) => update("geography", e.target.value)} className={textareaClass} rows={4} />

        <h3 className="font-serif font-bold text-warm-brown text-lg mb-4 pt-4 border-t border-warm-border">历史</h3>
        <textarea value={form.history} onChange={(e) => update("history", e.target.value)} className={textareaClass} rows={4} />

        <h3 className="font-serif font-bold text-warm-brown text-lg mb-4 pt-4 border-t border-warm-border">社会文化</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>社会结构</label><textarea value={form.society} onChange={(e) => update("society", e.target.value)} className={textareaClass} rows={3} /></div>
          <div><label className={labelClass}>宗教信仰</label><input type="text" value={form.religions} onChange={(e) => update("religions", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>节日庆典</label><input type="text" value={form.festivals} onChange={(e) => update("festivals", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>法律制度</label><input type="text" value={form.laws} onChange={(e) => update("laws", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>货币</label><input type="text" value={form.currency} onChange={(e) => update("currency", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass}>艺术风格</label><input type="text" value={form.artStyle} onChange={(e) => update("artStyle", e.target.value)} className={inputClass} /></div>
        </div>

        <h3 className="font-serif font-bold text-warm-brown text-lg mb-4 pt-4 border-t border-warm-border">势力 & 特殊体系</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelClass}>势力/组织</label><textarea value={form.factions} onChange={(e) => update("factions", e.target.value)} className={textareaClass} rows={3} /></div>
          <div><label className={labelClass}>魔法/科技法则</label><textarea value={form.magicSystem} onChange={(e) => update("magicSystem", e.target.value)} className={textareaClass} rows={3} /></div>
        </div>

        <div>
          <label className={labelClass}>状态</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputClass + " w-auto"}>
            <option value="draft">草稿</option>
            <option value="public">公开</option>
            <option value="private">私密</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-warm-border">
          <Button type="button" variant="secondary" onClick={() => router.back()}>取消</Button>
          <Button type="submit" disabled={loading}>{loading ? "保存中..." : "保存修改"}</Button>
        </div>
      </form>
    </div>
  );
}
