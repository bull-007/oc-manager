import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function WorldDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return null;
  const { id } = await params;

  const world = await prisma.world.findUnique({
    where: { id },
    include: { ocs: { select: { id: true, name: true, species: true, occupation: true } }, locations: true },
  });
  if (!world || world.userId !== session.user.id) notFound();

  const sections = [
    { label: "概述", value: world.overview }, { label: "地理", value: world.geography },
    { label: "历史", value: world.history }, { label: "社会结构", value: world.society },
    { label: "势力/组织", value: world.factions }, { label: "特殊体系", value: world.magicSystem },
  ].filter(s => s.value);

  const infoFields = [
    { label: "类型", value: world.type }, { label: "核心设定", value: world.coreConcept },
    { label: "时代背景", value: world.era }, { label: "科技水平", value: world.techLevel },
    { label: "宗教信仰", value: world.religions }, { label: "节日庆典", value: world.festivals },
    { label: "法律制度", value: world.laws }, { label: "货币", value: world.currency },
    { label: "艺术风格", value: world.artStyle },
  ].filter(f => f.value);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-slide-up">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 bg-sage-100 flex items-center justify-center text-2xl border border-sage-200 flex-shrink-0" style={{borderRadius:"12px"}}>◎</div>
          <div className="min-w-0">
            <h1 className="text-2xl font-serif font-medium text-stone-text truncate">{world.name}</h1>
            <p className="text-stone-muted text-sm">{[world.type, world.era].filter(Boolean).join(" · ")}</p>
            <span className={`inline-block text-xs px-2 py-0.5 mt-1 ${world.status==="public"?"bg-green-100 text-green-700":"bg-stone-hover text-stone-muted"}`} style={{borderRadius:"4px"}}>
              {world.status==="public"?"公开":"草稿"}</span>
          </div>
        </div>
        <Link href={`/worlds/${world.id}/edit`}
          className="px-4 py-2 text-sm border border-stone-border text-stone-text hover:bg-stone-hover transition-colors flex-shrink-0" style={{borderRadius:"8px"}}>编辑</Link>
      </div>

      {infoFields.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {infoFields.map((f) => (
            <div key={f.label} className="bg-stone-card border border-stone-border p-3 overflow-hidden" style={{borderRadius:"8px"}}>
              <p className="text-xs text-stone-muted truncate">{f.label}</p>
              <p className="text-sm font-medium text-stone-text truncate">{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {sections.map((s) => (
        <section key={s.label} className="bg-stone-card border border-stone-border p-5" style={{borderRadius:"10px"}}>
          <h2 className="font-serif font-medium text-stone-text mb-3 flex items-center gap-2">
            <span className="text-stone-muted/40 text-xs">◇</span>{s.label}
          </h2>
          <div className="text-sm text-stone-text/80 whitespace-pre-wrap leading-relaxed break-words">{s.value}</div>
        </section>
      ))}

      <section className="bg-stone-card border border-stone-border p-5" style={{borderRadius:"10px"}}>
        <h2 className="font-serif font-medium text-stone-text mb-3 flex items-center gap-2">
          <span className="text-stone-muted/40 text-xs">◆</span>关联 OC ({world.ocs.length})
        </h2>
        {world.ocs.length===0 ? (
          <p className="text-sm text-stone-muted">暂无关联角色</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {world.ocs.map((oc) => (
              <Link key={oc.id} href={`/ocs/${oc.id}/panel`}
                className="inline-flex items-center gap-2 px-3 py-2 bg-stone-page border border-stone-border hover:border-sage hover:bg-sage-50 transition-colors text-sm"
                style={{borderRadius:"6px"}}>
                <span className="text-stone-muted/60 text-xs">◆</span> {oc.name}
                {oc.species && <span className="text-xs text-stone-muted">{oc.species}</span>}
              </Link>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-stone-muted/60 text-center">创建于 {formatDate(world.createdAt)} · 更新于 {formatDate(world.updatedAt)}</p>
    </div>
  );
}
