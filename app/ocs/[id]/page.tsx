import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate, RELATION_TYPES, getOCProgress } from "@/lib/utils";
import ProgressRing from "@/components/ui/ProgressRing";
import DeleteButton from "./DeleteButton";
import AddRelation from "./AddRelation";
import RelationList from "./RelationList";

export default async function OCDetailPage({
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
      media: true,
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

  const allRelations = [
    ...oc.relationsFrom.map((r) => ({ ...r, direction: "from" as const })),
    ...oc.relationsTo.map((r) => ({ ...r, direction: "to" as const })),
  ];

  const personality = JSON.parse(oc.personality || "[]") as string[];
  const quotes = JSON.parse(oc.quotes || "[]") as string[];

  // Get other OCs for relation creation
  const otherOcs = await prisma.oC.findMany({
    where: {
      userId: session.user.id,
      id: { not: oc.id },
    },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center overflow-hidden border-2 border-warm-border shadow-md">
            {oc.media[0]?.url ? (
              <img
                src={oc.media[0].url}
                alt={oc.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl text-amber-600 font-serif">
                {oc.name.charAt(0)}
              </span>
            )}
          </div>
          <ProgressRing
            percent={getOCProgress(oc).percent}
            size="md"
            className="absolute -bottom-2 -right-2"
          />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-warm-brown">
              {oc.name}
            </h1>
            <p className="text-warm-muted mt-1">
              {[oc.species, oc.gender, oc.age && `${oc.age}岁`, oc.occupation]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {oc.world && (
              <Link
                href={`/worlds/${oc.world.id}`}
                className="text-sm text-amber-700 hover:text-amber-800 mt-1 inline-block"
              >
                ◎ {oc.world.name}
              </Link>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  oc.status === "public"
                    ? "bg-green-100 text-green-700"
                    : oc.status === "private"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {oc.status === "public" ? "公开" : oc.status === "private" ? "私密" : "草稿"}
              </span>
              {oc.ocTags.map((t) => (
                <span
                  key={t.tag.id}
                  className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"
                >
                  {t.tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/ocs/${oc.id}/edit`}
            className="px-4 py-2 border-2 border-warm-border text-warm-brown rounded-lg hover:bg-warm-paper transition-colors text-sm"
          >
            编辑
          </Link>
          <DeleteButton ocId={oc.id} ocName={oc.name} />
        </div>
      </div>

      {/* Personality Tags */}
      {personality.length > 0 && (
        <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
          <h2 className="font-serif font-bold text-warm-brown mb-3">性格标签</h2>
          <div className="flex flex-wrap gap-2">
            {personality.map((p, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm border border-amber-200"
              >
                {p}
              </span>
            ))}
          </div>
          {oc.mbti && (
            <p className="text-sm text-warm-muted mt-3">MBTI: {oc.mbti}</p>
          )}
        </section>
      )}

      {/* Basic Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "国籍", value: oc.nationality },
          { label: "现居地", value: oc.residence },
          { label: "身高", value: oc.height },
          { label: "体型", value: oc.bodyType },
          { label: "发色", value: oc.hairColor },
          { label: "瞳色", value: oc.eyeColor },
          { label: "服装风格", value: oc.clothingStyle },
          { label: "特殊特征", value: oc.specialFeatures },
        ]
          .filter((f) => f.value)
          .map((f) => (
            <div
              key={f.label}
              className="bg-warm-paper border border-warm-border rounded-lg p-3"
            >
              <p className="text-xs text-warm-muted">{f.label}</p>
              <p className="text-sm font-medium text-warm-brown mt-0.5">
                {f.value}
              </p>
            </div>
          ))}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className={`bg-warm-paper border border-warm-border border-l-4 ${f.color} rounded-lg p-4`}
            >
              <h3 className="text-sm font-bold text-warm-brown mb-1">
                {f.label}
              </h3>
              <p className="text-sm text-warm-brown/80">{f.value}</p>
            </div>
          ))}
      </div>

      {/* Fears & Motto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {oc.fears && (
          <div className="bg-warm-paper border border-warm-border rounded-lg p-4">
            <h3 className="text-sm font-bold text-warm-brown mb-1">内心恐惧</h3>
            <p className="text-sm text-warm-brown/80">{oc.fears}</p>
          </div>
        )}
        {oc.motto && (
          <div className="bg-warm-paper border border-warm-border rounded-lg p-4 italic">
            <h3 className="text-sm font-bold text-warm-brown mb-1 not-italic">
              座右铭
            </h3>
            <p className="text-lg text-amber-800">"{oc.motto}"</p>
          </div>
        )}
      </div>

      {/* Background */}
      {oc.background && (
        <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
          <h2 className="font-serif font-bold text-warm-brown mb-3">背景故事</h2>
          <div className="prose prose-amber text-warm-brown/80 text-sm whitespace-pre-wrap leading-relaxed">
            {oc.background}
          </div>
        </section>
      )}

      {/* Secrets */}
      {oc.secrets && (
        <section className="bg-warm-paper border border-warm-border rounded-xl p-5 border-dashed">
          <h2 className="font-serif font-bold text-warm-brown mb-3">🔒 秘密/黑历史</h2>
          <p className="text-sm text-warm-brown/70 whitespace-pre-wrap">
            {oc.secrets}
          </p>
        </section>
      )}

      {/* Abilities */}
      <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
        <h2 className="font-serif font-bold text-warm-brown mb-3">能力</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "特殊能力", value: oc.abilities },
            { label: "战斗风格", value: oc.fightingStyle },
            { label: "武器装备", value: oc.weapons },
            { label: "专业技能", value: oc.skills },
            { label: "能力弱点", value: oc.abilityWeaknesses },
          ]
            .filter((f) => f.value)
            .map((f) => (
              <div key={f.label}>
                <p className="text-xs text-warm-muted mb-1">{f.label}</p>
                <p className="text-sm text-warm-brown">{f.value}</p>
              </div>
            ))}
        </div>
      </section>

      {/* Likes & Dislikes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="bg-warm-paper border border-warm-border rounded-lg p-4"
            >
              <h3 className="text-sm font-bold text-warm-brown mb-1">
                {f.icon} {f.label}
              </h3>
              <p className="text-sm text-warm-brown/80">{f.value}</p>
            </div>
          ))}
      </div>

      {/* Quotes */}
      {quotes.length > 0 && (
        <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
          <h2 className="font-serif font-bold text-warm-brown mb-3">经典语录</h2>
          <div className="space-y-2">
            {quotes.map((q, i) => (
              <p
                key={i}
                className="text-warm-brown/80 italic border-l-4 border-amber-300 pl-4 py-1"
              >
                "{q}"
              </p>
            ))}
          </div>
        </section>
      )}

      {/* Theme Song */}
      {oc.themeSong && (
        <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
          <h2 className="font-serif font-bold text-warm-brown mb-2">🎵 主题曲</h2>
          <p className="text-sm text-warm-brown/80">{oc.themeSong}</p>
        </section>
      )}

      {/* Relations */}
      <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold text-warm-brown">
            人际关系 ({allRelations.length})
          </h2>
          <AddRelation ocId={oc.id} otherOcs={otherOcs} />
        </div>
        {allRelations.length === 0 ? (
          <p className="text-sm text-warm-muted">还没有建立关系</p>
        ) : (
          <RelationList relations={allRelations} currentOcId={oc.id} />
        )}
      </section>

      {/* Gallery */}
      {oc.media.filter((m) => m.category !== "avatar").length > 0 && (
        <section className="bg-warm-paper border border-warm-border rounded-xl p-5">
          <h2 className="font-serif font-bold text-warm-brown mb-3">相册</h2>
          <div className="flex flex-wrap gap-3">
            {oc.media
              .filter((m) => m.category !== "avatar")
              .map((m) => (
                <img
                  key={m.id}
                  src={m.url}
                  alt=""
                  className="w-28 h-28 object-cover rounded-lg border-2 border-warm-border shadow-sm hover:scale-105 transition-transform"
                />
              ))}
          </div>
        </section>
      )}

      {/* Meta */}
      <p className="text-xs text-warm-muted text-center">
        创建于 {formatDate(oc.createdAt)} · 更新于 {formatDate(oc.updatedAt)}
      </p>
    </div>
  );
}
