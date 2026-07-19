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
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 text-warm-cream font-medium hover:bg-amber-800 transition-colors shadow-sm"
          style={{ borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px" }}
        >
          + 新建世界观
        </Link>
      </div>

      {isLoading && <p className="text-center py-12 text-warm-muted">加载中...</p>}

      {!isLoading && worlds.length === 0 && (
        <div className="illustrated-empty">
          <svg width="80" height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="32" r="22" stroke="#8A7E6E" strokeWidth="1.2" fill="none" opacity="0.4"/>
            <ellipse cx="40" cy="25" rx="12" ry="5" stroke="#8A7E6E" strokeWidth="0.7" fill="none" opacity="0.3"/>
            <path d="M25 38 Q30 40 40 38 Q50 40 55 38" stroke="#8A7E6E" strokeWidth="0.7" fill="none" opacity="0.3"/>
            <circle cx="32" cy="28" r="2" fill="#C8926B" opacity="0.2"/>
            <circle cx="45" cy="22" r="1.5" fill="#D4A0A0" opacity="0.2"/>
            <circle cx="38" cy="38" r="1" fill="#A0B8A0" opacity="0.2"/>
            <circle cx="50" cy="35" r="1" fill="#C8926B" opacity="0.15"/>
            {/* Stars */}
            <text x="12" y="14" fontSize="8" fill="#C8926B" opacity="0.3">✦</text>
            <text x="60" y="16" fontSize="6" fill="#D4A0A0" opacity="0.25">✧</text>
          </svg>
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
            <Card hover padding="md" className="h-full" watercolor="sage">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl border border-warm-border"
                  style={{
                    background: "radial-gradient(circle at 40% 40%, rgba(160,184,160,0.18) 0%, rgba(243,235,216,0.5) 100%)",
                  }}>
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
