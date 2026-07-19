"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TagInput from "@/components/ui/TagInput";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const watercolorVariants = ["amber", "rose", "sage"] as const;

export default function InspirationsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/inspirations", fetcher);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [relatedOcId, setRelatedOcId] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: ocsData } = useSWR("/api/ocs", fetcher);

  const inspirations = data?.inspirations || [];
  const ocs = ocsData?.ocs || [];

  // Deterministic watercolor assignment based on content hash
  const getWatercolor = (id: string) => {
    const idx = id.charCodeAt(id.length - 1) % 3;
    return watercolorVariants[idx];
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("请输入灵感内容");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/inspirations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tags, relatedOcId: relatedOcId || null }),
      });
      if (res.ok) {
        toast.success("灵感已记录 ✧");
        setContent("");
        setTags([]);
        setRelatedOcId("");
        setShowForm(false);
        mutate();
      } else {
        toast.error("保存失败");
      }
    } catch {
      toast.error("保存失败");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("删除这条灵感？")) return;
    try {
      await fetch(`/api/inspirations/${id}`, { method: "DELETE" });
      toast.success("已删除");
      mutate();
    } catch {
      toast.error("删除失败");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-warm-brown">
            灵感速记
          </h1>
          <p className="text-warm-muted text-sm mt-1">
            快速记录创作灵感，随时捕捉闪现的想法
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "收起" : "+ 记录灵感"}
        </Button>
      </div>

      {/* Input Form */}
      {showForm && (
        <Card padding="md" className="animate-slide-up" watercolor="mixed" decorated>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-brown mb-1">
                灵感内容 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="写下你的灵感..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-brown mb-1">
                标签
              </label>
              <TagInput
                tags={tags}
                onChange={setTags}
                placeholder="添加标签..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-brown mb-1">
                关联 OC（可选）
              </label>
              <select
                value={relatedOcId}
                onChange={(e) => setRelatedOcId(e.target.value)}
                className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm"
              >
                <option value="">不关联</option>
                {ocs.map((oc: any) => (
                  <option key={oc.id} value={oc.id}>
                    {oc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : "记录灵感 ✧"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoading && <p className="text-center py-12 text-warm-muted">加载中...</p>}

      {!isLoading && inspirations.length === 0 && !showForm && (
        <div className="illustrated-empty">
          <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="35" cy="24" r="10" stroke="#8A7E6E" strokeWidth="1" fill="none" opacity="0.35"/>
            <path d="M28 30 L35 22 L42 30 L35 28 Z" stroke="#8A7E6E" strokeWidth="0.8" fill="none" opacity="0.3"/>
            <circle cx="35" cy="24" r="4" fill="#C89860" opacity="0.08"/>
            <line x1="35" y1="36" x2="35" y2="42" stroke="#8A7E6E" strokeWidth="0.8" opacity="0.3"/>
            <line x1="30" y1="48" x2="40" y2="48" stroke="#8A7E6E" strokeWidth="0.6" opacity="0.2"/>
            <circle cx="22" cy="16" r="1.2" fill="#D4A0A0" opacity="0.3"/>
            <circle cx="48" cy="18" r="1" fill="#C8926B" opacity="0.25"/>
            <circle cx="20" cy="30" r="0.8" fill="#A0B8A0" opacity="0.2"/>
          </svg>
          <p className="text-warm-muted mb-4">还没有记录任何灵感</p>
          <p className="text-xs text-warm-muted">
            点击上方按钮，开始记录你的第一个灵感
          </p>
        </div>
      )}

      {/* Inspiration Wall */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {inspirations.map((insp: any) => {
          const inspTags = JSON.parse(insp.tags || "[]");
          const wc = getWatercolor(insp.id);
          const wcColors = {
            amber: "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(200,146,107,0.10) 0%, transparent 55%)",
            rose: "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(212,160,160,0.09) 0%, transparent 55%)",
            sage: "radial-gradient(ellipse 60% 50% at 30% 30%, rgba(160,184,160,0.09) 0%, transparent 55%)",
          };
          return (
            <div
              key={insp.id}
              className="break-inside-avoid bg-warm-paper border border-warm-border rounded-xl p-4 hover:shadow-md transition-shadow group"
              style={{
                background: `${wcColors[wc]}, #FFFBF2`,
                borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px",
                transform: `rotate(${(insp.id.charCodeAt(0) % 5 - 2) * 0.6}deg)`,
              }}
            >
              {/* Tiny corner star */}
              <span className="absolute top-2 right-3 text-[8px] text-amber-300/25 pointer-events-none">
                {["✦","✧","·"][insp.id.charCodeAt(1) % 3]}
              </span>

              <p className="text-sm text-warm-brown whitespace-pre-wrap leading-relaxed mb-3">
                {insp.content}
              </p>

              {inspTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {inspTags.map((tag: string, i: number) => (
                    <span key={i} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {insp.relatedOc && (
                <p className="text-xs text-warm-muted mb-2">
                  ◆ {insp.relatedOc.name}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-warm-muted">
                  {formatDate(insp.createdAt)}
                </span>
                <button
                  onClick={() => handleDelete(insp.id)}
                  className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
