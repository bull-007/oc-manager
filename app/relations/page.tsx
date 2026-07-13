"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import * as d3 from "d3";
import { RELATION_TYPES, type RelationType } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface GraphNode {
  id: string;
  name: string;
  species?: string;
  avatar?: string;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
  intimacy: number;
  label: string;
}

export default function RelationsPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const { data, error, isLoading } = useSWR("/api/relations", fetcher);

  useEffect(() => {
    if (!containerRef.current) return;
    const resize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(600, window.innerHeight - 250),
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const { relations, ocs } = data;
    if (ocs.length === 0) return;

    // Prepare graph data
    const nodes: GraphNode[] = ocs.map((oc: any) => ({
      id: oc.id,
      name: oc.name,
      species: oc.species,
      avatar: oc.media?.[0]?.url,
    }));

    const links: GraphLink[] = relations.map((r: any) => ({
      source: r.fromOcId,
      target: r.toOcId,
      type: r.type,
      intimacy: r.intimacy,
      label: RELATION_TYPES[r.type as RelationType]?.label || "其他",
    }));

    // Clear previous
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    const g = svg.append("g");

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2));

    // Simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(0, 0))
      .force("collision", d3.forceCollide().radius(50));

    // Draw links
    const link = g
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => RELATION_TYPES[d.type as RelationType]?.strokeColor || "#999")
      .attr("stroke-width", (d) => Math.max(1, d.intimacy / 25))
      .attr("stroke-opacity", 0.6)
      .attr("stroke-dasharray", (d) =>
        d.type === "enemy" ? "8,4" : "none"
      );

    // Link labels
    const linkLabels = g
      .append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .text((d) => d.label)
      .attr("font-size", "11px")
      .attr("fill", "#8B7E6E")
      .attr("text-anchor", "middle")
      .attr("dy", -5);

    // Draw nodes
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (_event, d) => {
        window.location.href = `/ocs/${d.id}/panel`;
      });

    // Node circles
    node
      .append("circle")
      .attr("r", 30)
      .attr("fill", "#FFFBF0")
      .attr("stroke", "#D4C8B8")
      .attr("stroke-width", 2)
      .attr("filter", "drop-shadow(0 2px 4px rgba(61,43,31,0.15))");

    // Node emoji or initial
    node
      .append("text")
      .text((d) => d.name.charAt(0))
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .attr("fill", "#B5443C")
      .attr("font-family", "serif");

    // Node labels
    node
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", 42)
      .attr("font-size", "12px")
      .attr("fill", "#3D2B1F")
      .attr("font-weight", "500");

    // Tooltips
    node.append("title").text(
      (d) => `${d.name}${d.species ? ` (${d.species})` : ""}`
    );

    // Simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag
    const drag = d3
      .drag<SVGGElement, any>()
      .on("start", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d: any) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d: any) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag as any);

    return () => {
      simulation.stop();
    };
  }, [data, dimensions]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-warm-brown">
            关系图谱
          </h1>
          <p className="text-warm-muted text-sm mt-1">
            可视化人物关系网 · 拖拽节点调整位置 · 点击查看详情
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 p-4 bg-warm-paper border border-warm-border rounded-xl">
        {(Object.keys(RELATION_TYPES) as RelationType[]).map((key) => (
          <div key={key} className="flex items-center gap-2 text-sm">
            <span
              className="w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: RELATION_TYPES[key].color,
                borderColor: RELATION_TYPES[key].strokeColor,
              }}
            />
            {RELATION_TYPES[key].label}
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm text-warm-muted">
          <span className="w-4 h-0 border border-dashed border-red-400" />
          仇敌（虚线）
        </div>
        <div className="flex items-center gap-2 text-sm text-warm-muted">
          <span className="w-4 h-0.5 bg-warm-border" />
          线条粗细 = 亲密度
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-warm-muted">加载中...</p>
        </div>
      )}

      {!isLoading && (!data || data.ocs?.length === 0) && (
        <div className="bg-warm-paper border border-warm-border border-dashed rounded-xl p-12 text-center">
          <div className="text-5xl mb-3">⬡</div>
          <p className="text-warm-muted mb-4">还没有创建任何 OC</p>
          <Link
            href="/ocs/new"
            className="text-amber-700 hover:text-amber-800 font-medium"
          >
            创建第一个 OC →
          </Link>
        </div>
      )}

      {!isLoading && data?.ocs?.length > 0 && data?.relations?.length === 0 && (
        <div className="bg-warm-paper border border-warm-border border-dashed rounded-xl p-12 text-center">
          <div className="text-5xl mb-3">⬡</div>
          <p className="text-warm-muted mb-4">还没有建立任何关系</p>
          <Link
            href="/ocs"
            className="text-amber-700 hover:text-amber-800 font-medium"
          >
            前往 OC 详情页添加关系 →
          </Link>
        </div>
      )}

      {/* Graph */}
      <div
        ref={containerRef}
        className="bg-warm-paper border border-warm-border rounded-xl overflow-hidden"
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full"
        />
      </div>
    </div>
  );
}
