"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useSWR from "swr";
import Card from "@/components/ui/Card";
import ProgressRing from "@/components/ui/ProgressRing";
import SearchFilter from "@/components/search/SearchFilter";
import { getOCProgress } from "@/lib/utils";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function OCsPage() {
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("");
  const [occupation, setOccupation] = useState("");
  const [tag, setTag] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [moveTarget, setMoveTarget] = useState("");

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (species) query.set("species", species);
  if (occupation) query.set("occupation", occupation);
  if (tag) query.set("tag", tag);

  const { data, error, isLoading, mutate } = useSWR(`/api/ocs?${query.toString()}`, fetcher);
  const { data: catData, mutate: mutateCats } = useSWR("/api/categories", fetcher);

  const ocs = data?.ocs || [];
  const categories = catData?.categories || [];
  const filtered = catFilter ? ocs.filter((oc: any) => oc.categoryId === catFilter) : ocs;
  const allSpecies = [...new Set(ocs.map((oc: any) => oc.species).filter(Boolean))] as string[];
  const allOccupations = [...new Set(ocs.map((oc: any) => oc.occupation).filter(Boolean))] as string[];

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((oc: any) => oc.id)));
  };

  const batchAction = async (action: "move" | "delete") => {
    const ids = Array.from(selected);
    if (!ids.length) return;

    if (action === "move") {
      if (!moveTarget && moveTarget !== "") return;
    }

    if (action === "delete" && !confirm(`确定删除选中的 ${ids.length} 个 OC？此操作不可恢复。`)) return;

    try {
      const res = await fetch("/api/ocs/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action, categoryId: moveTarget || null }),
      });
      if (res.ok) {
        toast.success(action === "move" ? "已移动" : "已删除");
        setSelected(new Set());
        setBatchMode(false);
        mutate();
        mutateCats();
      } else {
        const d = await res.json();
        toast.error(d.error || "操作失败");
      }
    } catch { toast.error("操作失败"); }
  };

  const createCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        toast.success("分类已创建");
        setNewCatName("");
        setShowNewCat(false);
        mutateCats();
      } else {
        const d = await res.json();
        toast.error(d.error || "创建失败");
      }
    } catch { toast.error("创建失败"); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("删除分类不会删除OC，确定？")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (catFilter === id) setCatFilter("");
    mutateCats();
  };

  return (
    <div className="flex gap-6 animate-slide-up">
      {/* Category Sidebar */}
      <div className="w-40 flex-shrink-0 space-y-1.5 sticky top-0 self-start">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-serif font-bold text-warm-brown">📁 分类</h3>
          <button onClick={() => setShowNewCat(!showNewCat)}
            className="text-[11px] px-2 py-0.5 rounded-full border border-warm-border text-warm-muted hover:text-amber-700 hover:border-amber-300 transition-colors">
            {showNewCat ? "收起" : "+ 新建"}
          </button>
        </div>

        {showNewCat && (
          <div className="flex gap-1.5 mb-2 animate-slide-up">
            <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCategory()}
              placeholder="输入名称..." className="flex-1 px-2.5 py-1.5 text-xs border border-warm-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300" autoFocus />
            <button onClick={createCategory} className="text-xs px-3 py-1.5 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors">确定</button>
          </div>
        )}

        <div className="bg-warm-paper border border-warm-border rounded-xl p-1.5 space-y-0.5 relative overflow-hidden"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 70% 20%, rgba(160,184,160,0.06) 0%, transparent 55%), #FFFBF2",
          }}>
          <button onClick={() => setCatFilter("")}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${
              !catFilter ? "bg-amber-100 text-amber-800 font-medium shadow-sm" : "text-warm-muted hover:bg-warm-cream"
            }`}>
            📁 全部 ({ocs.length})
          </button>

          {categories.map((cat: any) => (
            <div key={cat.id} className="group flex items-center">
              <button onClick={() => setCatFilter(cat.id)}
                className={`flex-1 text-left text-xs px-3 py-2 rounded-lg transition-all ${
                  catFilter === cat.id ? "bg-amber-100 text-amber-800 font-medium shadow-sm" : "text-warm-muted hover:bg-warm-cream"
                }`}>
                📁 {cat.name} <span className="text-warm-muted/50">({cat._count?.ocs||0})</span>
              </button>
              <button onClick={() => deleteCategory(cat.id)}
                className="text-warm-muted/20 hover:text-red-400 opacity-0 group-hover:opacity-100 text-xs px-1.5 py-1 transition-all">✕</button>
            </div>
          ))}

          {categories.length === 0 && !showNewCat && (
            <p className="text-xs text-warm-muted/40 px-3 py-2 text-center">暂无分类</p>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-warm-brown">OC 档案</h1>
            <p className="text-warm-muted text-sm mt-1">
              {data ? `${ocs.length} 个角色` : "加载中..."}
              {catFilter && ` · 已筛选`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setBatchMode(!batchMode); setSelected(new Set()); }}
              className={`text-sm px-4 py-2 border transition-all ${
                batchMode ? "bg-amber-100 border-amber-300 text-amber-800 shadow-sm" : "border-warm-border text-warm-muted hover:bg-warm-paper hover:text-warm-brown"
              }`}
              style={{ borderRadius: "14px 4px 14px 4px / 12px 3px 12px 3px" }}>
              {batchMode ? "退出批量" : "批量管理"}
            </button>
            <Link href="/ocs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-warm-cream text-sm font-medium hover:bg-amber-800 transition-colors shadow-sm"
              style={{ borderRadius: "16px 5px 16px 5px / 14px 4px 14px 4px" }}>
              + 新建 OC
            </Link>
          </div>
        </div>

        {/* Batch toolbar */}
        {batchMode && selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 border border-amber-200 rounded-xl animate-slide-up"
            style={{ background: "radial-gradient(ellipse 60% 40% at 30% 50%, rgba(200,146,107,0.08) 0%, transparent 60%), #FFFBF2" }}>
            <span className="text-sm text-warm-brown font-medium">已选 {selected.size} 项</span>
            <select value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}
              className="text-xs px-2 py-1.5 border border-warm-border rounded bg-white">
              <option value="">移动到...</option>
              <option value="">无分类</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => batchAction("move")} disabled={moveTarget === ""}
              className="text-xs px-3 py-1.5 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-40">移动</button>
            <button onClick={() => batchAction("delete")}
              className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600">删除选中</button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-warm-muted hover:text-warm-brown">取消选择</button>
          </div>
        )}

        <SearchFilter search={search} onSearchChange={setSearch}
          species={species} onSpeciesChange={setSpecies} speciesOptions={allSpecies}
          occupation={occupation} onOccupationChange={setOccupation} occupationOptions={allOccupations}
          tag={tag} onTagChange={setTag} />

        {isLoading && <p className="text-center py-12 text-warm-muted">加载中...</p>}

        {!isLoading && filtered.length === 0 && (
          <div className="illustrated-empty">
            <svg width="100" height="70" viewBox="0 0 100 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 8 Q24 6 40 8 Q45 40 40 58 Q38 60 22 56 Q20 38 22 8Z" stroke="#8A7E6E" strokeWidth="1.2" fill="none" opacity="0.45"/>
              <path d="M40 8 Q48 7 78 12 Q75 40 72 58 Q74 60 40 58" stroke="#8A7E6E" strokeWidth="1.2" fill="none" opacity="0.45"/>
              <line x1="40" y1="8" x2="40" y2="58" stroke="#8A7E6E" strokeWidth="0.7" opacity="0.35"/>
              <circle cx="55" cy="28" r="7" fill="none" stroke="#C8926B" strokeWidth="0.8" opacity="0.3"/>
              <circle cx="55" cy="28" r="3" fill="#C8926B" opacity="0.12"/>
              <line x1="62" y1="28" x2="72" y2="28" stroke="#C8926B" strokeWidth="0.6" opacity="0.25"/>
              <circle cx="28" cy="35" r="2" fill="#D4A0A0" opacity="0.25"/>
              <circle cx="70" cy="38" r="1.5" fill="#A0B8A0" opacity="0.2"/>
            </svg>
            <p className="text-warm-muted mb-4">{search||species||occupation||tag||catFilter ? "没有找到匹配的 OC" : "还没有创建任何 OC"}</p>
            {!search&&!species&&!occupation&&!tag&&!catFilter && (
              <Link href="/ocs/new" className="text-amber-700 hover:text-amber-800 font-medium">创建第一个 OC →</Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((oc: any) => (
            <Link key={oc.id} href={`/ocs/${oc.id}/panel`}
              onClick={(e) => { if (batchMode) { e.preventDefault(); toggleSelect(oc.id); } }}>
              <Card hover={!batchMode} padding="md" className={`h-full relative ${selected.has(oc.id) ? "ring-2 ring-amber-400" : ""}`}
                watercolor="amber">
                {batchMode && (
                  <div className={`absolute top-3 right-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center ${selected.has(oc.id) ? "bg-amber-500 border-amber-500 text-white" : "border-warm-border bg-white"}`}>
                    {selected.has(oc.id) && "✓"}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center overflow-hidden border-2 border-warm-border"
                      style={{
                        background: "radial-gradient(circle at 40% 40%, rgba(200,146,107,0.18) 0%, rgba(243,235,216,0.5) 100%)",
                      }}>
                      {oc.media?.[0]?.url ? (
                        <img src={oc.media[0].url} alt={oc.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl text-amber-600 font-serif">{oc.name?.charAt(0)}</span>
                      )}
                    </div>
                    <ProgressRing percent={getOCProgress(oc).percent} size="sm" className="absolute -bottom-1.5 -right-1.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-warm-brown text-lg truncate">{oc.name}</h3>
                    <p className="text-xs text-warm-muted mt-0.5">{[oc.species,oc.gender,oc.occupation].filter(Boolean).join(" · ")}</p>
                    {oc.world && <p className="text-xs text-amber-700 mt-1">◎ {oc.world.name}</p>}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {oc.ocTags?.slice(0,3).map((t:any) => (
                        <span key={t.tag.id} className="tag-pill">{t.tag.name}</span>
                      ))}
                      {oc.ocTags?.length > 3 && <span className="text-xs text-warm-muted">+{oc.ocTags.length-3}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
