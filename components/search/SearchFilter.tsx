"use client";

import { useState } from "react";

interface SearchFilterProps {
  search: string; onSearchChange: (v: string) => void;
  species: string; onSpeciesChange: (v: string) => void; speciesOptions: string[];
  occupation: string; onOccupationChange: (v: string) => void; occupationOptions: string[];
  tag: string; onTagChange: (v: string) => void;
}

export default function SearchFilter({
  search, onSearchChange, species, onSpeciesChange, speciesOptions,
  occupation, onOccupationChange, occupationOptions, tag, onTagChange,
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasFilters = species || occupation || tag;

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索 OC 名称、种族、职业..."
            className="w-full pl-4 pr-4 py-2.5 border border-stone-border bg-stone-card text-stone-text placeholder-stone-muted focus:outline-none focus:ring-2 focus:ring-sage/30 text-sm"
            style={{ borderRadius: "8px" }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 border text-sm transition-colors ${showFilters || hasFilters ? "bg-sage-100/60 border-sage-300 text-sage-700" : "border-stone-border text-stone-muted hover:bg-stone-hover"}`}
          style={{ borderRadius: "8px" }}>
          筛选 {hasFilters ? "●" : ""}
        </button>
      </div>
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-stone-card border border-stone-border animate-slide-up" style={{ borderRadius: "10px" }}>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-stone-muted mb-1">种族</label>
            <select value={species} onChange={(e) => onSpeciesChange(e.target.value)}
              className="w-full px-3 py-2 border border-stone-border bg-stone-page text-sm" style={{ borderRadius: "6px" }}>
              <option value="">全部</option>
              {speciesOptions.map((s)=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-stone-muted mb-1">职业</label>
            <select value={occupation} onChange={(e) => onOccupationChange(e.target.value)}
              className="w-full px-3 py-2 border border-stone-border bg-stone-page text-sm" style={{ borderRadius: "6px" }}>
              <option value="">全部</option>
              {occupationOptions.map((o)=><option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-stone-muted mb-1">标签</label>
            <input type="text" value={tag} onChange={(e) => onTagChange(e.target.value)}
              placeholder="输入标签名..." className="w-full px-3 py-2 border border-stone-border bg-stone-page text-sm" style={{ borderRadius: "6px" }} />
          </div>
          {(species||occupation||tag) && (
            <div className="flex items-end">
              <button onClick={() => { onSpeciesChange(""); onOccupationChange(""); onTagChange(""); }}
                className="px-3 py-2 text-sm text-red-500 hover:text-red-700">清除筛选</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
