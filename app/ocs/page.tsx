"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import Card from "@/components/ui/Card";
import SearchFilter from "@/components/search/SearchFilter";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function OCsPage() {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [occupation, setOccupation] = useState("");
  const [tag, setTag] = useState("");

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (species) query.set("species", species);
  if (occupation) query.set("occupation", occupation);
  if (tag) query.set("tag", tag);

  const { data, error, isLoading } = useSWR(
    `/api/ocs?${query.toString()}`,
    fetcher
  );

  const ocs = data?.ocs || [];

  // Collect unique species/occupations for filter
  const allSpecies = [...new Set(ocs.map((oc: any) => oc.species).filter(Boolean))];
  const allOccupations = [...new Set(ocs.map((oc: any) => oc.occupation).filter(Boolean))];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-warm-brown">
            OC 档案
          </h1>
          <p className="text-warm-muted text-sm mt-1">
            {data ? `${ocs.length} 个角色` : "加载中..."}
          </p>
        </div>
        <Link
          href="/ocs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 text-warm-cream rounded-lg font-medium hover:bg-amber-800 transition-colors shadow-sm"
        >
          + 新建 OC
        </Link>
      </div>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        species={species}
        onSpeciesChange={setSpecies}
        speciesOptions={allSpecies as string[]}
        occupation={occupation}
        onOccupationChange={setOccupation}
        occupationOptions={allOccupations as string[]}
        tag={tag}
        onTagChange={setTag}
      />

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-warm-muted">加载中...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">加载失败，请刷新重试</p>
        </div>
      )}

      {!isLoading && ocs.length === 0 && (
        <div className="bg-warm-paper border border-warm-border border-dashed rounded-xl p-12 text-center">
          <div className="text-5xl mb-3">◆</div>
          <p className="text-warm-muted mb-4">
            {search || species || occupation || tag
              ? "没有找到匹配的 OC"
              : "还没有创建任何 OC"}
          </p>
          {!search && !species && !occupation && !tag && (
            <Link
              href="/ocs/new"
              className="text-amber-700 hover:text-amber-800 font-medium"
            >
              创建第一个 OC →
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ocs.map((oc: any) => (
          <Link key={oc.id} href={`/ocs/${oc.id}/panel`}>
            <Card hover padding="md" className="h-full">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-warm-border">
                  {oc.media?.[0]?.url ? (
                    <img
                      src={oc.media[0].url}
                      alt={oc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-amber-600 font-serif">
                      {oc.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif font-bold text-warm-brown text-lg truncate">
                    {oc.name}
                  </h3>
                  <p className="text-xs text-warm-muted mt-0.5">
                    {[oc.species, oc.gender, oc.occupation]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {oc.world && (
                    <p className="text-xs text-amber-700 mt-1">◎ {oc.world.name}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {oc.ocTags?.slice(0, 3).map((t: any) => (
                      <span
                        key={t.tag.id}
                        className="text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700"
                      >
                        {t.tag.name}
                      </span>
                    ))}
                    {oc.ocTags?.length > 3 && (
                      <span className="text-xs text-warm-muted">
                        +{oc.ocTags.length - 3}
                      </span>
                    )}
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
