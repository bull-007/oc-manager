"use client";

import { useState } from "react";
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

  const batchAction = async (action: "move" | "delete") => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (action === "move" && !moveTarget && moveTarget !== "") return;
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
    <div className="flex gap-8 animate-slide-up max-w-5xl mx-auto">
      {/* Category Sidebar */}
      <div className="w-36 flex-shrink-0 space-y-1.5 sticky top-0 self-start">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-hand text-warm-brown">分类</h3>
          <button onClick={() => setShowNewCat(!showNewCat)}
            className="text-[11px] px-2 py-0.5 rounded-full border border-warm-border text-warm-muted hover:text-amber-700 hover:border-amber-300 transition-colors">
            {showNewCat ? "收起" : "+"}
          </button>
        </div>

        {showNewCat && (
          <div className="flex gap-1.5 mb-2 animate-slide-up">
            <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCategory()}
              placeholder="输入名称..." className="flex-1 px-2.5 py-1.5 text-xs border border-warm-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" autoFocus />
            <button onClick={createCategory} className="text-xs px-3 py-1.5 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors">确定</button>
          </div>
        )}

        <div className="bg-warm-paper border border-warm-border rounded-xl p-1.5 space-y-0.5">
          <button onClick={() => setCatFilter("")}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all ${!catFilter ? "bg-amber-100/60 text-amber-700 font-medium" : "text-warm-muted hover:bg-warm-bg"}`}>
            全部 ({ocs.length})
          </button>
          {categories.map((cat: any) => (
            <div key={cat.id} className="group flex items-center">
              <button onClick={() => setCatFilter(cat.id)}
                className={`flex-1 text-left text-xs px-3 py-2 rounded-lg transition-all ${catFilter === cat.id ? "bg-amber-100/60 text-amber-700 font-medium" : "text-warm-muted hover:bg-warm-bg"}`}>
                {cat.name} <span className="text-warm-muted/50">({cat._count?.ocs||0})</span>
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
      <div className="flex-1 min-w-0 space-y-5 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-hand text-warm-brown">OC 档案</h1>
            <p className="text-warm-muted text-sm mt-1">
              {data ? `${ocs.length} 个角色` : "加载中..."}{catFilter && ` · 已筛选`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setBatchMode(!batchMode); setSelected(new Set()); }}
              className={`text-sm px-4 py-2 border transition-all ${batchMode ? "bg-amber-100/60 border-amber-300 text-amber-700" : "border-warm-border text-warm-muted hover:bg-warm-paper"}`}
              style={{ borderRadius: "14px 4px 14px 4px / 12px 3px 12px 3px" }}>
              {batchMode ? "退出批量" : "批量管理"}
            </button>
            <Link href="/ocs/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-warm-cream text-sm font-medium transition-colors shadow-sm"
              style={{ background: "#B8977E", borderRadius: "16px 5px 16px 5px / 14px 4px 14px 4px" }}>
              + 新建 OC
            </Link>
          </div>
        </div>

        {batchMode && selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-amber-50/60 border border-amber-200 rounded-xl animate-slide-up">
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
          <div className="bg-warm-paper border border-dashed border-warm-border rounded-xl p-12 text-center">
            <p className="text-warm-muted mb-3">{search||species||occupation||tag||catFilter ? "没有找到匹配的 OC" : "还没有创建任何 OC"}</p>
            {!search&&!species&&!occupation&&!tag&&!catFilter && (
              <Link href="/ocs/new" className="text-amber-700 hover:text-amber-800 font-medium text-sm">创建第一个 OC →</Link>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((oc: any) => (
            <Link key={oc.id} href={`/ocs/${oc.id}/panel`}
              onClick={(e) => { if (batchMode) { e.preventDefault(); toggleSelect(oc.id); } }}>
              <Card hover={!batchMode} padding="md" className={`h-full relative ${selected.has(oc.id) ? "ring-2 ring-amber-400" : ""}`}>
                {batchMode && (
                  <div className={`absolute top-3 right-3 z-10 w-5 h-5 rounded border-2 flex items-center justify-center ${selected.has(oc.id) ? "bg-amber-500 border-amber-500 text-white" : "border-warm-border bg-white"}`}>
                    {selected.has(oc.id) && "✓"}
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center overflow-hidden border border-warm-border">
                      {oc.media?.[0]?.url ? (
                        <img src={oc.media[0].url} alt={oc.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl text-amber-600 font-hand">{oc.name?.charAt(0)}</span>
                      )}
                    </div>
                    <ProgressRing percent={getOCProgress(oc).percent} size="sm" className="absolute -bottom-1.5 -right-1.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-hand text-warm-brown text-lg truncate">{oc.name}</h3>
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
