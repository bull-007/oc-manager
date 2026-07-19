"use client";

import Link from "next/link";
import useSWR from "swr";
import Card from "@/components/ui/Card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function WorldsPage() {
  const { data, error, isLoading } = useSWR("/api/worlds", fetcher);
  const worlds = data?.worlds || [];

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-medium text-stone-text">世界观</h1>
          <p className="text-stone-muted text-sm mt-0.5">{data ? `${worlds.length} 个世界` : "加载中..."}</p>
        </div>
        <Link href="/worlds/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-colors"
          style={{ background: "#869087", color: "#fff", borderRadius: "8px" }}>+ 新建世界观</Link>
      </div>

      {isLoading && <p className="text-center py-12 text-stone-muted">加载中...</p>}

      {!isLoading && worlds.length === 0 && (
        <div className="bg-stone-card border border-stone-border p-12 text-center" style={{ borderRadius: "10px" }}>
          <p className="text-stone-muted mb-3 text-sm">还没有创建任何世界观</p>
          <Link href="/worlds/new" className="text-sage-600 hover:text-sage-700 font-medium text-sm">创建第一个世界观 →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {worlds.map((world: any) => (
          <Link key={world.id} href={`/worlds/${world.id}`}>
            <Card hover padding="md" className="h-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-sage-100 flex items-center justify-center flex-shrink-0 text-lg" style={{ borderRadius: "8px" }}>◎</div>
                <div className="min-w-0">
                  <h3 className="font-serif font-medium text-stone-text truncate">{world.name}</h3>
                  <p className="text-xs text-stone-muted">{[world.type, world.era].filter(Boolean).join(" · ")}</p>
                  {world.coreConcept && <p className="text-xs text-stone-muted mt-1.5 line-clamp-2">{world.coreConcept}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-muted">
                    <span>◆ {world._count?.ocs || 0} 个OC</span>
                    <span className={`px-1.5 py-0.5 ${world.status === "public" ? "bg-green-100 text-green-700" : "bg-stone-hover text-stone-muted"}`} style={{ borderRadius: "4px" }}>
                      {world.status === "public" ? "公开" : "草稿"}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
