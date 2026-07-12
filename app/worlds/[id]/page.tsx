import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function WorldDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;

  const world = await prisma.world.findUnique({
    where: { id },
    include: {
      ocs: {
        select: { id: true, name: true, species: true, occupation: true },
      },
      locations: true,
    },
  });

  if (!world || world.userId !== session.user.id) {
    notFound();
  }

  const sections = [
    { label: "概述", value: world.overview },
    { label: "地理", value: world.geography },
    { label: "历史", value: world.history },
    { label: "社会结构", value: world.society },
    { label: "势力/组织", value: world.factions },
    { label: "特殊体系（魔法/科技）", value: world.magicSystem },
  ].filter((s) => s.value);

  const infoFields = [
    { label: "类型", value: world.type },
    { label: "核心设定", value: world.coreConcept },
    { label: "时代背景", value: world.era },
    { label: "科技水平", value: world.techLevel },
    { label: "宗教信仰", value: world.religions },
    { label: "节日庆典", value: world.festivals },
    { label: "法律制度", value: world.laws },
    { label: "货币", value: world.currency },
    { label: "艺术风格", value: world.artStyle },
  ].filter((f) => f.value);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center text-4xl border-2 border-warm-border shadow-md">
            ◎
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-warm-brown">
              {world.name}
            </h1>
            <p className="text-warm-muted">
              {[world.type, world.era].filter(Boolean).join(" · ")}
            </p>
            <span
              className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                world.status === "public"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {world.status === "public" ? "公开" : "草稿"}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/worlds/${world.id}/edit`}
            className="px-4 py-2 border-2 border-warm-border text-warm-brown rounded-lg hover:bg-warm-paper transition-colors text-sm"
          >
            编辑
          </Link>
        </div>
      </div>

      {/* Core Info */}
      {infoFields.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {infoFields.map((f) => (
            <div
              key={f.label}
              className="bg-warm-paper border border-warm-border rounded-lg p-3"
            >
              <p className="text-xs text-warm-muted">{f.label}</p>
              <p className="text-sm font-medium text-warm-brown">{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content Sections */}
      {sections.map((s) => (
        <section
          key={s.label}
          className="bg-warm-paper border border-warm-border rounded-xl p-5"
        >
          <h2 className="font-serif font-bold text-warm-brown mb-3">
            {s.label}
          </h2>
          <div className="text-sm text-warm-brown/80 whitespace-pre-wrap leading-relaxed">
            {s.value}
          </div>
        </section>
      ))}

      {/* Related OCs */}
      <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
        <h2 className="font-serif font-bold text-warm-brown mb-3">
          关联 OC ({world.ocs.length})
        </h2>
        {world.ocs.length === 0 ? (
          <p className="text-sm text-warm-muted">暂无关联角色</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {world.ocs.map((oc) => (
              <Link
                key={oc.id}
                href={`/ocs/${oc.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-warm-cream border border-warm-border rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors text-sm"
              >
                ◆ {oc.name}
                {oc.species && (
                  <span className="text-xs text-warm-muted">{oc.species}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-warm-muted text-center">
        创建于 {formatDate(world.createdAt)} · 更新于 {formatDate(world.updatedAt)}
      </p>
    </div>
  );
}
