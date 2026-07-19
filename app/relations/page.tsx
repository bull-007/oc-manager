"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useSWR from "swr";
import * as d3 from "d3";
import { RELATION_TYPES, type RelationType } from "@/lib/utils";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface GraphNode extends d3.SimulationNodeDatum { id: string; name: string; species?: string; avatar?: string; }
interface GraphLink extends d3.SimulationLinkDatum<GraphNode> { id?: string; type: string; intimacy: number; label: string; relationId?: string; }

export default function RelationsPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [activeType, setActiveType] = useState<RelationType | null>(null);
  const [mode, setMode] = useState<"view" | "connect">("view");
  const [firstNode, setFirstNode] = useState<string | null>(null);
  const simRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);
  const { data, error, isLoading, mutate } = useSWR("/api/relations", fetcher);

  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => { if (containerRef.current) setDimensions({ width: containerRef.current.clientWidth, height: Math.max(600, window.innerHeight - 280) }); };
    resize(); window.addEventListener("resize", resize); return () => window.removeEventListener("resize", resize);
  }, []);

  const createRelation = useCallback(async (fromId: string, toId: string, type: string) => {
    const res = await fetch("/api/relations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fromOcId: fromId, toOcId: toId, type, intimacy: 50 }) });
    if (res.ok) { toast.success("关系已创建"); mutate(); } else { const d = await res.json(); toast.error(d.error || "创建失败"); }
  }, [mutate]);

  const deleteRelation = useCallback(async (id: string) => { await fetch(`/api/relations/${id}`, { method: "DELETE" }); toast.success("关系已删除"); mutate(); }, [mutate]);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    const { relations, ocs } = data;
    if (ocs.length === 0) return;
    const nodes: GraphNode[] = ocs.map((oc: any) => ({ id: oc.id, name: oc.name, species: oc.species, avatar: oc.media?.[0]?.url }));
    const links: GraphLink[] = relations.map((r: any) => ({ id: r.id, source: r.fromOcId, target: r.toOcId, type: r.type, intimacy: r.intimacy, label: RELATION_TYPES[r.type as RelationType]?.label || "", relationId: r.id }));

    const svg = d3.select(svgRef.current); svg.selectAll("*").remove();
    const { width, height } = dimensions;
    const defs = svg.append("defs");
    links.forEach((l) => { const c = RELATION_TYPES[l.type as RelationType]?.color || "#999"; const g = defs.append("linearGradient").attr("id", `g-${l.id}`); g.append("stop").attr("offset","0%").attr("stop-color",c).attr("stop-opacity",0.4); g.append("stop").attr("offset","100%").attr("stop-color",c).attr("stop-opacity",0.4); });
    const g = svg.append("g");
    svg.call(d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3,3]).on("zoom",(e) => g.attr("transform", e.transform)));
    svg.call((s: any) => s.call(d3.zoom().transform, d3.zoomIdentity.translate(width/2,height/2)));

    const sim = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d:any) => d.id).distance(180))
      .force("charge", d3.forceManyBody().strength(-500)).force("center", d3.forceCenter(0,0)).force("collision", d3.forceCollide().radius(55));
    simRef.current = sim;

    const lg = g.append("g");
    lg.selectAll("line").data(links).join("line")
      .attr("stroke", (d) => RELATION_TYPES[d.type as RelationType]?.color || "#999").attr("stroke-width", (d) => Math.max(2, d.intimacy/20)).attr("stroke-opacity",0.35)
      .attr("stroke-dasharray", (d) => d.type==="enemy"?"6,3":"none").style("cursor","pointer")
      .on("click", (e,d) => { e.stopPropagation(); if((d as any).relationId && confirm("删除这条关系？")) deleteRelation((d as any).relationId); })
      .on("mouseenter",function(){d3.select(this).attr("stroke-opacity",0.8).attr("stroke-width",4);})
      .on("mouseleave",function(){d3.select(this).attr("stroke-opacity",0.35).attr("stroke-width",(d) => Math.max(2,(d as any).intimacy/20));});

    g.append("g").selectAll("text").data(links).join("text").text((d)=>d.label).attr("font-size","10px").attr("fill","#82817C").attr("text-anchor","middle").attr("dy",-6);

    const ng = g.append("g").selectAll("g").data(nodes).join("g").style("cursor","pointer");
    ng.append("circle").attr("r",30).attr("fill","#E5E4E0").attr("stroke","#D3D2CE").attr("stroke-width",2);
    ng.each(function(d){const g=d3.select(this);if(d.avatar){g.append("clipPath").attr("id",`c-${d.id}`).append("circle").attr("r",28);g.append("image").attr("xlink:href",d.avatar).attr("x",-28).attr("y",-28).attr("width",56).attr("height",56).attr("clip-path",`url(#c-${d.id})`);}else{g.append("text").text(d.name.charAt(0)).attr("text-anchor","middle").attr("dy","0.35em").attr("font-size","20px").attr("font-weight","500").attr("fill","#869087").attr("font-family","Noto Serif SC, serif");}});
    ng.append("text").text((d)=>d.name).attr("text-anchor","middle").attr("dy",44).attr("font-size","11px").attr("fill","#54534E");

    ng.on("click",(e,d)=>{e.stopPropagation();if(mode==="connect"&&activeType){if(!firstNode){setFirstNode(d.id);ng.filter((n:any)=>n.id===d.id).select("circle").attr("stroke",RELATION_TYPES[activeType].color).attr("stroke-width",3);}else if(d.id!==firstNode){createRelation(firstNode,d.id,activeType);setFirstNode(null);setMode("view");setActiveType(null);}}else{window.location.href=`/ocs/${d.id}/panel`;}});

    const drag = d3.drag<SVGGElement, GraphNode>().on("start",(e,d)=>{if(!e.active)sim.alphaTarget(0.3).restart();d.fx=d.x;d.fy=d.y;}).on("drag",(e,d)=>{d.fx=e.x;d.fy=e.y;}).on("end",(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;});
    ng.call(drag as any);
    sim.on("tick",()=>{lg.selectAll("line").attr("x1",(d:any)=>d.source.x).attr("y1",(d:any)=>d.source.y).attr("x2",(d:any)=>d.target.x).attr("y2",(d:any)=>d.target.y);ng.attr("transform",(d:any)=>`translate(${d.x},${d.y})`);});
    svg.on("click",()=>{if(firstNode){setFirstNode(null);setMode("view");setActiveType(null);}});
    return ()=>{sim.stop();};
  }, [data, dimensions, mode, activeType, firstNode, createRelation, deleteRelation]);

  const startConnect = (type: RelationType) => { setMode("connect"); setActiveType(type); setFirstNode(null); toast(`点击两个角色来创建${RELATION_TYPES[type].label}关系`,{icon:"🔗"}); };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
      <div>
        <h1 className="text-xl font-serif font-medium text-stone-text">关系图谱</h1>
        <p className="text-stone-muted text-sm mt-0.5">{mode==="connect"?"正在连接 — 点击两个角色":"拖拽节点 · 点击查看 · 点击连线删除"}</p>
      </div>
      <div className="bg-stone-card border border-stone-border p-5" style={{borderRadius:"10px"}}>
        <p className="text-xs text-stone-muted mb-3">{mode==="connect"?"选择目标角色完成连接":"点击下方关系类型，再依次点击两个角色即可连线"}</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {(Object.keys(RELATION_TYPES) as RelationType[]).map((key) => (
            <button key={key} onClick={()=>startConnect(key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white transition-all ${activeType===key?"scale-105 shadow-lg":"hover:scale-105 hover:shadow-md"}`}
              style={{backgroundColor:RELATION_TYPES[key].color, borderRadius:"8px"}}>
              <span className="w-2 h-2 rounded-full bg-white/30"/>{RELATION_TYPES[key].label}
            </button>
          ))}
          {mode==="connect"&&<button onClick={()=>{setMode("view");setActiveType(null);setFirstNode(null);}} className="px-3.5 py-2 text-sm text-stone-muted border border-stone-border hover:bg-stone-hover transition-colors" style={{borderRadius:"8px"}}>取消</button>}
        </div>
      </div>
      <div className="flex gap-4 text-xs text-stone-muted">
        {(data as any)?.ocs?.length>0&&<><span>◆ {(data as any).ocs.length} 个角色</span><span>🔗 {(data as any).relations.length} 条关系</span></>}
      </div>
      {isLoading&&<p className="text-center py-12 text-stone-muted">加载中...</p>}
      {!isLoading&&((data as any)?.ocs?.length||0)===0&&(
        <div className="bg-stone-card border border-stone-border p-12 text-center" style={{borderRadius:"10px"}}><p className="text-stone-muted text-sm">还没有创建任何 OC</p></div>
      )}
      <div ref={containerRef}
        className={`overflow-hidden transition-colors border ${mode==="connect"?"border-sage-300 shadow-lg":"border-stone-border"}`}
        style={{background:"#E5E4E0", borderRadius:"12px"}}>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full"/>
      </div>
    </div>
  );
}
