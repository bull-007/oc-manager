"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function DeleteOCButton({ ocId, ocName }: { ocId: string; ocName: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/ocs/${ocId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("已删除");
        router.push("/ocs");
        router.refresh();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败");
    }
    setDeleting(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-[11px] px-2.5 py-1.5 rounded-full bg-warm-paper/80 border border-red-200 text-red-400/60 hover:text-red-500 hover:border-red-300 transition-all"
      >
        删除
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center animate-scale-in border border-warm-border">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="font-bold text-warm-brown mb-1">确认删除</p>
            <p className="text-sm text-warm-muted mb-2">
              确定要删除 <span className="font-bold text-warm-brown">「{ocName}」</span> 吗？
            </p>
            <p className="text-xs text-red-400 mb-5">此操作不可恢复，所有数据将被永久删除</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowConfirm(false)} disabled={deleting}
                className="px-5 py-2 text-sm border border-warm-border rounded-lg text-warm-muted hover:bg-warm-cream disabled:opacity-50">
                取消
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-5 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
                {deleting ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
