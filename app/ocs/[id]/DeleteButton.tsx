"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function DeleteButton({
  ocId,
  ocName,
}: {
  ocId: string;
  ocName: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
      >
        删除
      </button>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="确认删除">
        <p className="text-warm-brown mb-2">
          确定要删除 <span className="font-bold">{ocName}</span> 吗？
        </p>
        <p className="text-sm text-warm-muted mb-6">此操作不可撤销，相关的图片和关系也会被删除。</p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            取消
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "删除中..." : "确认删除"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
