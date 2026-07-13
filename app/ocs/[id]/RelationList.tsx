"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RELATION_TYPES, type RelationType } from "@/lib/utils";
import Link from "next/link";

interface RelationItem {
  id: string;
  type: string;
  intimacy: number;
  description: string | null;
  direction: "from" | "to";
  fromOc?: { id: string; name: string };
  toOc?: { id: string; name: string };
}

export default function RelationList({
  relations,
  currentOcId,
}: {
  relations: RelationItem[];
  currentOcId: string;
}) {
  const router = useRouter();

  const handleDelete = async (relationId: string) => {
    if (!confirm("确定删除这条关系吗？")) return;
    try {
      const res = await fetch(`/api/relations/${relationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("关系已删除");
        router.refresh();
      } else {
        toast.error("删除失败");
      }
    } catch {
      toast.error("删除失败");
    }
  };

  return (
    <div className="space-y-2">
      {relations.map((r) => {
        const relatedOc =
          r.direction === "from" ? r.toOc : r.fromOc;
        const type = RELATION_TYPES[r.type as RelationType] || RELATION_TYPES.other;
        const isFromCurrent = r.direction === "from";

        return (
          <div
            key={r.id}
            className="flex items-center justify-between p-3 bg-warm-cream rounded-lg border border-warm-border group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="text-xs px-2 py-1 rounded-full font-medium text-white"
                style={{ backgroundColor: type.color }}
              >
                {isFromCurrent ? "→" : "←"} {type.label}
              </span>
              <Link
                href={`/ocs/${relatedOc?.id}/panel`}
                className="font-medium text-warm-brown hover:text-amber-700 truncate"
              >
                {relatedOc?.name}
              </Link>
              <span className="text-xs text-warm-muted">
                亲密度: {r.intimacy}
              </span>
              {r.description && (
                <span className="text-xs text-warm-muted truncate hidden sm:inline">
                  — {r.description}
                </span>
              )}
            </div>
            <button
              onClick={() => handleDelete(r.id)}
              className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
            >
              删除
            </button>
          </div>
        );
      })}
    </div>
  );
}
