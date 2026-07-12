"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import TagInput from "@/components/ui/TagInput";
import { formatDate } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function InspirationsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/inspirations", fetcher);
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [relatedOcId, setRelatedOcId] = useState("");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Load OCs for relation
  const { data: ocsData } = useSWR("/api/ocs", fetcher);

  const inspirations = data?.inspirations || [];
  const ocs = ocsData?.ocs || [];

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
        <Card padding="md" className="animate-slide-up">
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

      {/* Inspiration List */}
      {isLoading && <p className="text-center py-12 text-warm-muted">加载中...</p>}

      {!isLoading && inspirations.length === 0 && !showForm && (
        <div className="bg-warm-paper border border-warm-border border-dashed rounded-xl p-12 text-center">
          <div className="text-5xl mb-3">✧</div>
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
          return (
            <div
              key={insp.id}
              className="break-inside-avoid bg-warm-paper border border-warm-border rounded-xl p-4 hover:shadow-md transition-shadow group"
              style={{
                transform: `rotate(${Math.random() * 2 - 1}deg)`,
              }}
            >
              <p className="text-sm text-warm-brown whitespace-pre-wrap leading-relaxed mb-3">
                {insp.content}
              </p>

              {inspTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {inspTags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"
                    >
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
