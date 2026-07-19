"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useSWR from "swr";
import * as d3 from "d3";
import { RELATION_TYPES, type RelationType } from "@/lib/utils";
import toast from "react-hot-toast";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  species?: string;
  avatar?: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  id?: string;
  type: string;
  intimacy: number;
  label: string;
  relationId?: string;
}

export default function RelationsPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [activeType, setActiveType] = useState<RelationType | null>(null);
  const [mode, setMode] = useState<"view" | "connect">("view");
  const [firstNode, setFirstNode] = useState<string | null>(null);
  const simRef = useRef<d3.Simulation<GraphNode, GraphLink> | null>(null);

  const { data, error, isLoading, mutate } = useSWR("/api/relations", fetcher);
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(600, window.innerHeight - 300),
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const createRelation = useCallback(async (fromId: string, toId: string, type: string) => {
    try {
      const res = await fetch("/api/relations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromOcId: fromId, toOcId: toId, type, intimacy: 50 }),
      });
      if (res.ok) {
        toast.success("关系已创建");
        mutate();
      } else {
        const d = await res.json();
        toast.error(d.error || "创建失败");
      }
    } catch { toast.error("创建失败"); }
  }, [mutate]);

  const deleteRelation = useCallback(async (id: string) => {
    try {
      await fetch(`/api/relations/${id}`, { method: "DELETE" });
      toast.success("关系已删除");
      mutate();
    } catch { toast.error("删除失败"); }
  }, [mutate]);

  // Build and update graph
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const { relations, ocs } = data;
    if (ocs.length === 0) return;

    const nodes: GraphNode[] = ocs.map((oc: any) => ({
      id: oc.id, name: oc.name, species: oc.species, avatar: oc.media?.[0]?.url,
    }));

    const links: GraphLink[] = relations.map((r: any) => ({
      id: r.id, source: r.fromOcId, target: r.toOcId, type: r.type,
      intimacy: r.intimacy,
      label: RELATION_TYPES[r.type as RelationType]?.label || "其他",
      relationId: r.id,
    }));

    nodesRef.current = nodes;
    linksRef.current = links;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const { width, height } = dimensions;

    // Defs
    const defs = svg.append("defs");

    // Wobbly filter for hand-drawn node circles
    const filter = defs.append("filter").attr("id", "sketch-node");
    filter.append("feTurbulence").attr("type", "turbulence").attr("baseFrequency", "0.05").attr("numOctaves", "2").attr("result", "noise");
    filter.append("feDisplacementMap").attr("in", "SourceGraphic").attr("in2", "noise").attr("scale", "1.5").attr("xChannelSelector", "R").attr("yChannelSelector", "G");

    // Watercolor glow filter
    const glowFilter = defs.append("filter").attr("id", "watercolor-glow");
    glowFilter.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "blur");
    glowFilter.append("feComposite").attr("in", "SourceGraphic").attr("in2", "blur").attr("operator", "over");

    // Link gradients
    links.forEach((l) => {
      const color = RELATION_TYPES[l.type as RelationType]?.color || "#999";
      const gradId = `grad-${l.id || Math.random()}`;
      const grad = defs.append("linearGradient").attr("id", gradId);
      grad.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.5);
      grad.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0.5);
    });

    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));

    const sim = d3.forceSimulation<GraphNode>(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links).id((d: any) => d.id).distance(180))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide().radius(55));
    simRef.current = sim;

    // Links
    const linkG = g.append("g");
    const linkLines = linkG.selectAll("line").data(links).join("line")
      .attr("stroke", (d) => RELATION_TYPES[d.type as RelationType]?.color || "#999")
      .attr("stroke-width", (d) => Math.max(2, d.intimacy / 20))
      .attr("stroke-opacity", 0.4)
      .attr("stroke-dasharray", (d) => d.type === "enemy" ? "6,3" : "none")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        if ((d as any).relationId && confirm("删除这条关系？")) {
          deleteRelation((d as any).relationId);
        }
      })
      .on("mouseenter", function () { d3.select(this).attr("stroke-opacity", 0.8).attr("stroke-width", 4); })
      .on("mouseleave", function () { d3.select(this).attr("stroke-opacity", 0.4).attr("stroke-width", (d) => Math.max(2, (d as any).intimacy / 20)); });

    // Link labels
    const linkLabels = g.append("g").selectAll("text").data(links).join("text")
      .text((d) => d.label)
      .attr("font-size", "10px").attr("fill", "#8B7E6E").attr("text-anchor", "middle")
      .attr("dy", -6).style("pointer-events", "none");

    // Node groups
    const nodeG = g.append("g").selectAll("g").data(nodes).join("g")
      .style("cursor", "pointer");

    // Watercolor glow behind node
    nodeG.append("circle").attr("r", 35)
      .attr("fill", "#C8926B").attr("opacity", 0.06)
      .attr("filter", "url(#watercolor-glow)");

    // Shadow
    nodeG.append("circle").attr("r", 32).attr("fill", "none")
      .attr("stroke", "#D4C8B8").attr("stroke-width", 6).attr("opacity", 0.25);

    // Main circle with sketch filter
    nodeG.append("circle").attr("r", 30)
      .attr("fill", "#FFFBF0").attr("stroke", "#D4C8B8").attr("stroke-width", 2.5)
      .attr("filter", "url(#sketch-node)");

    // Initial/Avatar
    nodeG.each(function (d) {
      const g = d3.select(this);
      if (d.avatar) {
        g.append("clipPath").attr("id", `clip-${d.id}`)
          .append("circle").attr("r", 28);
        g.append("image").attr("xlink:href", d.avatar).attr("x", -28).attr("y", -28)
          .attr("width", 56).attr("height", 56).attr("clip-path", `url(#clip-${d.id})`);
      } else {
        g.append("text").text(d.name.charAt(0))
          .attr("text-anchor", "middle").attr("dy", "0.35em")
          .attr("font-size", "22px").attr("font-weight", "bold")
          .attr("fill", "#B5443C").attr("font-family", "serif");
      }
    });

    // Labels
    nodeG.append("text").text((d) => d.name)
      .attr("text-anchor", "middle").attr("dy", 42)
      .attr("font-size", "12px").attr("fill", "#3D2B1F").attr("font-weight", "500");

    nodeG.append("title").text((d) => `${d.name}${d.species ? ` (${d.species})` : ""}`);

    // Click handler for connection mode
    nodeG.on("click", (event, d) => {
      event.stopPropagation();
      if (mode === "connect" && activeType) {
        if (!firstNode) {
          setFirstNode(d.id);
          nodeG.filter((n) => n.id === d.id)
            .select("circle:nth-child(3)")
            .attr("stroke", RELATION_TYPES[activeType].color)
            .attr("stroke-width", 4)
            .attr("filter", "drop-shadow(0 0 6px " + RELATION_TYPES[activeType].color + ")");
        } else if (d.id !== firstNode) {
          createRelation(firstNode, d.id, activeType);
          setFirstNode(null);
          setMode("view");
          setActiveType(null);
        }
      } else {
        window.location.href = `/ocs/${d.id}/panel`;
      }
    });

    // Drag
    const drag = d3.drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => {
        if (!event.active) sim.alphaTarget(0);
        d.fx = null; d.fy = null;
      });
    nodeG.call(drag as any);

    // Tick
    sim.on("tick", () => {
      linkLines.attr("x1", (d: any) => d.source.x).attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x).attr("y2", (d: any) => d.target.y);
      linkLabels.attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);
      nodeG.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Click background to cancel
    svg.on("click", () => {
      if (firstNode) { setFirstNode(null); setMode("view"); setActiveType(null); }
    });

    return () => { sim.stop(); };
  }, [data, dimensions, mode, activeType, firstNode, createRelation, deleteRelation]);

  const startConnect = (type: RelationType) => {
    setMode("connect");
    setActiveType(type);
    setFirstNode(null);
    toast(`点击两个角色来创建${RELATION_TYPES[type].label}关系`, { icon: "🔗" });
  };

  const cancelConnect = () => {
    setMode("view");
    setActiveType(null);
    setFirstNode(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-warm-brown">关系图谱</h1>
          <p className="text-warm-muted text-sm mt-1">
            {mode === "connect" ? `正在连接 — 点击两个角色` : "拖拽节点 · 点击查看 · 点击连线删除"}
          </p>
        </div>
      </div>

      {/* Relation type chips */}
      <div className="watercolor-section">
        <p className="text-xs text-warm-muted mb-3">
          {mode === "connect" ? "选择目标角色完成连接" : "点击下方关系类型，再依次点击两个角色即可连线"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {(Object.keys(RELATION_TYPES) as RelationType[]).map((key) => (
            <button
              key={key}
              onClick={() => startConnect(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                activeType === key
                  ? "scale-110 shadow-lg text-white"
                  : "text-white hover:scale-105 hover:shadow-md"
              }`}
              style={{
                backgroundColor: RELATION_TYPES[key].color,
                borderRadius: "16px 5px 16px 5px / 14px 4px 14px 4px",
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
              {RELATION_TYPES[key].label}
            </button>
          ))}
          {mode === "connect" && (
            <button onClick={cancelConnect}
              className="px-4 py-2 text-sm text-warm-muted border border-warm-border hover:bg-warm-cream transition-colors"
              style={{ borderRadius: "16px 5px 16px 5px / 14px 4px 14px 4px" }}>
              取消
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 text-xs text-warm-muted">
        {(data as any)?.ocs?.length > 0 && (
          <>
            <span>◆ {(data as any).ocs.length} 个角色</span>
            <span>🔗 {(data as any).relations.length} 条关系</span>
          </>
        )}
      </div>

      {isLoading && <p className="text-center py-12 text-warm-muted">加载中...</p>}

      {!isLoading && ((data as any)?.ocs?.length || 0) === 0 && (
        <div className="illustrated-empty">
          <svg width="90" height="60" viewBox="0 0 90 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="28" cy="30" r="12" stroke="#8A7E6E" strokeWidth="1.2" fill="none" opacity="0.4"/>
            <circle cx="62" cy="30" r="12" stroke="#8A7E6E" strokeWidth="1.2" fill="none" opacity="0.4"/>
            <line x1="40" y1="30" x2="50" y2="30" stroke="#8A7E6E" strokeWidth="0.8" strokeDasharray="4 3" opacity="0.3"/>
            <circle cx="28" cy="30" r="4" fill="#C8926B" opacity="0.10"/>
            <circle cx="62" cy="30" r="4" fill="#D4A0A0" opacity="0.10"/>
            <text x="28" y="34" textAnchor="middle" fontSize="8" fill="#8A7E6E" opacity="0.4">A</text>
            <text x="62" y="34" textAnchor="middle" fontSize="8" fill="#8A7E6E" opacity="0.4">B</text>
          </svg>
          <p className="text-warm-muted mb-4">还没有创建任何 OC</p>
        </div>
      )}

      {/* Graph */}
      <div ref={containerRef}
        className={`rounded-xl overflow-hidden transition-colors border-2 ${
          mode === "connect" ? "border-amber-300 shadow-lg" : "border-warm-border"
        }`}
        style={{
          background: "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(200,146,107,0.04) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 30% 60%, rgba(160,184,160,0.03) 0%, transparent 50%), #FFFBF2",
          borderRadius: "22px 6px 22px 6px / 18px 5px 18px 5px",
        }}>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full" />
      </div>
    </div>
  );
}
