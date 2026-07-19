"use client";

import { useState, useEffect } from "react";

interface SearchFilterProps {
  search: string;
  onSearchChange: (v: string) => void;
  species: string;
  onSpeciesChange: (v: string) => void;
  speciesOptions: string[];
  occupation: string;
  onOccupationChange: (v: string) => void;
  occupationOptions: string[];
  tag: string;
  onTagChange: (v: string) => void;
}

export default function SearchFilter({
  search,
  onSearchChange,
  species,
  onSpeciesChange,
  speciesOptions,
  occupation,
  onOccupationChange,
  occupationOptions,
  tag,
  onTagChange,
}: SearchFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasFilters = species || occupation || tag;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-muted/60">
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索 OC 名称、种族、职业..."
            className="w-full pl-10 pr-4 py-2.5 border border-warm-border rounded-lg bg-warm-paper text-warm-brown placeholder-warm-muted watercolor-focus text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2.5 border transition-colors text-sm ${
            showFilters || hasFilters
              ? "bg-amber-100 border-amber-300 text-amber-800"
              : "border-warm-border text-warm-muted hover:bg-warm-paper"
          }`}
          style={{ borderRadius: "12px 3px 12px 3px / 10px 2px 10px 2px" }}
        >
          筛选 {hasFilters ? "●" : "○"}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 border rounded-lg animate-slide-up watercolor-amber"
          style={{
            borderColor: "#D4CABC",
            borderRadius: "16px 5px 16px 5px / 14px 4px 14px 4px",
          }}>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-warm-muted mb-1">种族</label>
            <select
              value={species}
              onChange={(e) => onSpeciesChange(e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm"
            >
              <option value="">全部</option>
              {speciesOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-warm-muted mb-1">职业</label>
            <select
              value={occupation}
              onChange={(e) => onOccupationChange(e.target.value)}
              className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm"
            >
              <option value="">全部</option>
              {occupationOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-warm-muted mb-1">标签</label>
            <input
              type="text"
              value={tag}
              onChange={(e) => onTagChange(e.target.value)}
              placeholder="输入标签名..."
              className="w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm"
            />
          </div>
          {(species || occupation || tag) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  onSpeciesChange("");
                  onOccupationChange("");
                  onTagChange("");
                }}
                className="px-3 py-2 text-sm text-red-500 hover:text-red-700"
              >
                清除筛选
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
