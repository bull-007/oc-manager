"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import Card from "@/components/ui/Card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function WorldsPage() {
  const { data, error, isLoading } = useSWR("/api/worlds", fetcher);
  const worlds = data?.worlds || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-warm-brown">
            世界观
          </h1>
          <p className="text-warm-muted text-sm mt-1">
            {data ? `${worlds.length} 个世界` : "加载中..."}
          </p>
        </div>
        <Link
          href="/worlds/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 text-warm-cream rounded-lg font-medium hover:bg-amber-800 transition-colors shadow-sm"
        >
          + 新建世界观
        </Link>
      </div>

      {isLoading && <p className="text-center py-12 text-warm-muted">加载中...</p>}

      {!isLoading && worlds.length === 0 && (
        <div className="bg-warm-paper border border-warm-border border-dashed rounded-xl p-12 text-center">
          <div className="text-5xl mb-3">◎</div>
          <p className="text-warm-muted mb-4">还没有创建任何世界观</p>
          <Link
            href="/worlds/new"
            className="text-amber-700 hover:text-amber-800 font-medium"
          >
            创建第一个世界观 →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {worlds.map((world: any) => (
          <Link key={world.id} href={`/worlds/${world.id}`}>
            <Card hover padding="md" className="h-full">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 text-2xl">
                  ◎
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-warm-brown text-lg truncate">
                    {world.name}
                  </h3>
                  <p className="text-xs text-warm-muted">
                    {[world.type, world.era].filter(Boolean).join(" · ")}
                  </p>
                  {world.coreConcept && (
                    <p className="text-xs text-warm-muted mt-2 line-clamp-2">
                      {world.coreConcept}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-warm-muted">
                    <span>◆ {world._count?.ocs || 0} 个OC</span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        world.status === "public"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {world.status === "public" ? "公开" : "草稿"}
                    </span>
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
