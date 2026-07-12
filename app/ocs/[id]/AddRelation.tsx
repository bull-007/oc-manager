"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { RELATION_TYPES, type RelationType } from "@/lib/utils";

interface OtherOc {
  id: string;
  name: string;
}

export default function AddRelation({
  ocId,
  otherOcs,
}: {
  ocId: string;
  otherOcs: OtherOc[];
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    toOcId: "",
    type: "friend" as RelationType,
    intimacy: 50,
    description: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.toOcId) return;

    setLoading(true);
    try {
      const res = await fetch("/api/relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromOcId: ocId,
          toOcId: form.toOcId,
          type: form.type,
          intimacy: form.intimacy,
          description: form.description,
        }),
      });

      if (res.ok) {
        toast.success("关系已添加");
        setShowModal(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "添加失败");
      }
    } catch {
      toast.error("添加失败");
    }
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-amber-700 hover:text-amber-800 font-medium"
      >
        + 添加关系
      </button>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="添加关系">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-brown mb-1">
              关联角色
            </label>
            <select
              value={form.toOcId}
              onChange={(e) =>
                setForm({ ...form, toOcId: e.target.value })
              }
              required
              className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm"
            >
              <option value="">选择角色...</option>
              {otherOcs.map((oc) => (
                <option key={oc.id} value={oc.id}>
                  {oc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-brown mb-1">
              关系类型
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(RELATION_TYPES) as RelationType[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, type: key })}
                  className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                    form.type === key
                      ? "border-amber-500 bg-amber-100 text-amber-900"
                      : "border-warm-border text-warm-muted hover:bg-warm-cream"
                  }`}
                  style={{
                    borderColor:
                      form.type === key
                        ? RELATION_TYPES[key].color
                        : undefined,
                  }}
                >
                  {RELATION_TYPES[key].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-brown mb-1">
              亲密度: {form.intimacy}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.intimacy}
              onChange={(e) =>
                setForm({ ...form, intimacy: Number(e.target.value) })
              }
              className="w-full accent-amber-600"
            />
            <div className="flex justify-between text-xs text-warm-muted">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-brown mb-1">
              关系描述（可选）
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm resize-none"
              placeholder="描述你们的关系..."
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading || !form.toOcId}>
              {loading ? "添加中..." : "确认添加"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
