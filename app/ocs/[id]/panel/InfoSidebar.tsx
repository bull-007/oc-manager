import Link from "next/link";
import { RELATION_TYPES, type RelationType } from "@/lib/utils";

interface Relation {
  name: string;
  id: string;
  type: string;
  intimacy: number;
}

interface Props {
  oc: any;
  personality: string[];
  relations: Relation[];
}

export default function InfoSidebar({ oc, personality, relations }: Props) {
  return (
    <aside className="w-48 flex-shrink-0 border-r border-warm-border/50 bg-warm-paper/50 backdrop-blur-sm overflow-y-auto p-4 space-y-4 text-xs">
      {/* Name & Core Identity */}
      <section>
        <h1 className="text-lg font-serif font-bold text-warm-brown leading-tight">
          {oc.name}
        </h1>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {oc.species && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
              {oc.species}
            </span>
          )}
          {oc.gender && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100">
              {oc.gender}
            </span>
          )}
          {oc.age && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 border border-sky-100">
              {oc.age}岁
            </span>
          )}
          {oc.mbti && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100">
              {oc.mbti}
            </span>
          )}
        </div>
      </section>

      {/* Personality */}
      {personality.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
            性格
          </h3>
          <div className="flex flex-wrap gap-1">
            {personality.map((p, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded-full bg-amber-50/80 text-amber-700/80 border border-amber-100/50 text-[10px]"
              >
                {p}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Key traits */}
      <section>
        <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
          特质
        </h3>
        <dl className="space-y-1">
          {oc.strengths && <Row label="优点" value={oc.strengths} color="text-emerald-600" />}
          {oc.weaknesses && <Row label="缺点" value={oc.weaknesses} color="text-red-500" />}
          {oc.quirks && <Row label="癖好" value={oc.quirks} />}
          {oc.taboos && <Row label="禁忌" value={oc.taboos} />}
          {oc.fears && <Row label="恐惧" value={oc.fears} color="text-purple-600" />}
        </dl>
      </section>

      {/* Abilities & Equipment */}
      {(oc.abilities || oc.weapons || oc.fightingStyle || oc.skills) && (
        <section>
          <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
            能力·装备
          </h3>
          <dl className="space-y-1">
            {oc.abilities && <Row label="能力" value={oc.abilities} />}
            {oc.fightingStyle && <Row label="战斗" value={oc.fightingStyle} />}
            {oc.skills && <Row label="技能" value={oc.skills} />}
            {oc.weapons && <Row label="武器" value={oc.weapons} />}
            {oc.abilityWeaknesses && <Row label="弱点" value={oc.abilityWeaknesses} color="text-red-400" />}
          </dl>
        </section>
      )}

      {/* Appearance highlights */}
      <section>
        <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
          外貌
        </h3>
        <dl className="space-y-1">
          {oc.height && <Row label="身高" value={oc.height} />}
          {oc.bodyType && <Row label="体型" value={oc.bodyType} />}
          {oc.hairColor && <Row label="发色" value={oc.hairColor} />}
          {oc.eyeColor && <Row label="瞳色" value={oc.eyeColor} />}
          {oc.clothingStyle && <Row label="服装" value={oc.clothingStyle} />}
          {oc.specialFeatures && <Row label="特征" value={oc.specialFeatures} />}
        </dl>
      </section>

      {/* Relations */}
      {relations.length > 0 && (
        <section>
          <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
            关系 ({relations.length})
          </h3>
          <div className="space-y-1">
            {relations.map((r) => {
              const type = RELATION_TYPES[r.type as RelationType] || RELATION_TYPES.other;
              return (
                <Link
                  key={r.id}
                  href={`/ocs/${r.id}/panel`}
                  className="flex items-center gap-1.5 hover:bg-warm-cream rounded px-1.5 py-0.5 -mx-1.5 transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: type.color }} />
                  <span className="text-warm-brown truncate group-hover:text-amber-700 transition-colors">
                    {r.name}
                  </span>
                  <span className="text-[9px] px-1 rounded ml-auto flex-shrink-0" style={{ backgroundColor: type.color + "25", color: type.color }}>
                    {type.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Likes & dislikes */}
      {(oc.likes || oc.dislikes) && (
        <section>
          <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
            喜好
          </h3>
          <dl className="space-y-1">
            {oc.likes && <Row label="𐂂" value={oc.likes} />}
            {oc.dislikes && <Row label="✕" value={oc.dislikes} />}
            {oc.habits && <Row label="习惯" value={oc.habits} />}
            {oc.belongings && <Row label="随身" value={oc.belongings} />}
          </dl>
        </section>
      )}

      {/* Motto */}
      {oc.motto && (
        <section>
          <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
            座右铭
          </h3>
          <p className="text-warm-brown/70 italic text-[10px] leading-relaxed">
            &ldquo;{oc.motto}&rdquo;
          </p>
        </section>
      )}

      {/* Theme Song */}
      {oc.themeSong && (
        <section>
          <h3 className="text-[10px] font-bold text-warm-brown/40 uppercase tracking-wider mb-1.5">
            主题曲
          </h3>
          <p className="text-warm-brown/70 text-[10px]">🎵 {oc.themeSong}</p>
        </section>
      )}

      {/* Status */}
      <section className="pt-2 border-t border-warm-border/30">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            oc.status === "public" ? "bg-green-100 text-green-600" :
            oc.status === "private" ? "bg-red-100 text-red-500" : "bg-gray-100 text-gray-500"
          }`}>
            {oc.status === "public" ? "公开" : oc.status === "private" ? "私密" : "草稿"}
          </span>
        </div>
      </section>
    </aside>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-warm-muted/50 w-7 flex-shrink-0 text-[10px]">{label}</dt>
      <dd className={`text-warm-brown/80 truncate text-[10px] ${color || ""}`}>{value}</dd>
    </div>
  );
}
