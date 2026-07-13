import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { RELATION_TYPES, type RelationType } from "@/lib/utils";
import PanelInteractions from "./PanelInteractions";

export default async function PanelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;

  const oc = await prisma.oC.findUnique({
    where: { id },
    include: {
      media: { orderBy: { createdAt: "asc" } },
      ocTags: { include: { tag: true } },
      world: { select: { id: true, name: true } },
      relationsFrom: {
        include: {
          toOc: { select: { id: true, name: true } },
        },
      },
      relationsTo: {
        include: {
          fromOc: { select: { id: true, name: true } },
        },
      },
      inspirations: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!oc || oc.userId !== session.user.id) {
    notFound();
  }

  const personality = JSON.parse(oc.personality || "[]") as string[];
  const quotes = JSON.parse(oc.quotes || "[]") as string[];
  const allRelations = [
    ...oc.relationsFrom.map((r) => ({ ...r, direction: "from" as const })),
    ...oc.relationsTo.map((r) => ({ ...r, direction: "to" as const })),
  ];

  const avatarUrl = oc.media[0]?.url;
  const galleryImages = oc.media.slice(1, 7); // up to 6 extra images

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      {/* Hero Card */}
      <div className="relative bg-warm-paper border border-warm-border rounded-2xl overflow-hidden shadow-lg">
        {/* Edit button - subtle corner icon */}
        <Link
          href={`/ocs/${oc.id}/edit`}
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-warm-cream/80 backdrop-blur-sm border border-warm-border text-warm-muted hover:text-warm-brown hover:bg-warm-paper transition-all shadow-sm"
          title="编辑"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </Link>

        {/* Avatar */}
        <div className="h-64 bg-gradient-to-b from-amber-100 to-warm-paper flex items-center justify-center relative overflow-hidden">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={oc.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl font-serif text-amber-300 select-none">
              {oc.name.charAt(0)}
            </span>
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-warm-paper to-transparent" />
        </div>

        {/* Info section */}
        <div className="px-6 pb-6 -mt-12 relative z-10">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-warm-brown">
                {oc.name}
              </h1>
              <p className="text-warm-muted mt-1">
                {[oc.species, oc.gender, oc.age && `${oc.age}岁`]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${
                oc.status === "public"
                  ? "bg-green-100 text-green-700"
                  : oc.status === "private"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {oc.status === "public" ? "公开" : oc.status === "private" ? "私密" : "草稿"}
            </span>
          </div>

          {/* Occupation & World */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {oc.occupation && (
              <span className="text-sm px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {oc.occupation}
              </span>
            )}
            {oc.world && (
              <Link
                href={`/worlds/${oc.world.id}`}
                className="text-sm px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                ◎ {oc.world.name}
              </Link>
            )}
            {oc.mbti && (
              <span className="text-sm px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                {oc.mbti}
              </span>
            )}
          </div>

          {/* Personality tags */}
          {personality.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {personality.map((p, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured Quote */}
      {quotes.length > 0 && (
        <PanelInteractions quotes={quotes} />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "种族", value: oc.species },
          { label: "职业", value: oc.occupation },
          { label: "国籍", value: oc.nationality },
          { label: "现居", value: oc.residence },
          { label: "身高", value: oc.height },
          { label: "体型", value: oc.bodyType },
          { label: "发色", value: oc.hairColor },
          { label: "瞳色", value: oc.eyeColor },
        ]
          .filter((f) => f.value)
          .slice(0, 8)
          .map((f) => (
            <div
              key={f.label}
              className="bg-warm-paper border border-warm-border rounded-xl p-3 text-center"
            >
              <p className="text-xs text-warm-muted">{f.label}</p>
              <p className="text-sm font-medium text-warm-brown mt-0.5 truncate">
                {f.value}
              </p>
            </div>
          ))}
      </div>

      {/* Traits */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "优点", value: oc.strengths, color: "border-l-green-400" },
          { label: "缺点", value: oc.weaknesses, color: "border-l-red-400" },
          { label: "癖好", value: oc.quirks, color: "border-l-amber-400" },
          { label: "禁忌", value: oc.taboos, color: "border-l-orange-400" },
        ]
          .filter((f) => f.value)
          .map((f) => (
            <div
              key={f.label}
              className={`bg-warm-paper border border-warm-border border-l-4 ${f.color} rounded-xl p-3`}
            >
              <p className="text-xs font-bold text-warm-brown mb-0.5">
                {f.label}
              </p>
              <p className="text-xs text-warm-brown/70 line-clamp-2">{f.value}</p>
            </div>
          ))}
      </div>

      {/* Abilities */}
      {(oc.abilities || oc.skills || oc.weapons || oc.fightingStyle) && (
        <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
          <h2 className="font-serif font-bold text-warm-brown mb-3">能力</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "特殊能力", value: oc.abilities },
              { label: "战斗风格", value: oc.fightingStyle },
              { label: "武器装备", value: oc.weapons },
              { label: "专业技能", value: oc.skills },
            ]
              .filter((f) => f.value)
              .map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-warm-muted mb-0.5">{f.label}</p>
                  <p className="text-sm text-warm-brown">{f.value}</p>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Likes & Dislikes */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "喜好", value: oc.likes, icon: "❤️" },
          { label: "厌恶", value: oc.dislikes, icon: "💔" },
          { label: "习惯", value: oc.habits, icon: "🔄" },
          { label: "随身物品", value: oc.belongings, icon: "🎒" },
        ]
          .filter((f) => f.value)
          .map((f) => (
            <div
              key={f.label}
              className="bg-warm-paper border border-warm-border rounded-xl p-4"
            >
              <p className="text-sm font-bold text-warm-brown mb-1">
                {f.icon} {f.label}
              </p>
              <p className="text-xs text-warm-brown/70 line-clamp-3">{f.value}</p>
            </div>
          ))}
      </div>

      {/* Relations */}
      <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif font-bold text-warm-brown">
            人际关系
          </h2>
          <Link
            href={`/relations`}
            className="text-xs text-amber-700 hover:text-amber-800"
          >
            查看全部 →
          </Link>
        </div>
        {allRelations.length === 0 ? (
          <p className="text-sm text-warm-muted">暂无关系</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allRelations.slice(0, 6).map((r) => {
              const relatedOc = r.direction === "from" ? r.toOc : r.fromOc;
              const type =
                RELATION_TYPES[r.type as RelationType] || RELATION_TYPES.other;
              return (
                <Link
                  key={r.id}
                  href={`/ocs/${relatedOc?.id}/panel`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors hover:shadow-sm"
                  style={{
                    borderColor: type.color,
                    backgroundColor: type.color + "15",
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  {relatedOc?.name}
                  <span className="text-xs text-warm-muted">{r.intimacy}</span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
          <h2 className="font-serif font-bold text-warm-brown mb-3">
            相册
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.map((m, i) => (
              <div
                key={m.id}
                className="aspect-square rounded-lg overflow-hidden border border-warm-border hover:scale-105 transition-transform cursor-pointer"
              >
                <img
                  src={m.url}
                  alt={`${oc.name} ${i + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Motto */}
      {oc.motto && (
        <div className="text-center py-6 bg-warm-paper border border-warm-border rounded-xl italic">
          <p className="text-lg text-amber-800 font-serif">
            " {oc.motto} "
          </p>
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex justify-center gap-3 pb-8">
        <Link
          href={`/ocs/${oc.id}`}
          className="px-4 py-2 text-sm text-warm-muted hover:text-warm-brown border border-warm-border rounded-lg hover:bg-warm-paper transition-colors"
        >
          查看完整档案
        </Link>
        <Link
          href={`/ocs/${oc.id}/edit`}
          className="px-4 py-2 text-sm bg-amber-700 text-warm-cream rounded-lg hover:bg-amber-800 transition-colors shadow-sm"
        >
          编辑 OC
        </Link>
      </div>
    </div>
  );
}
