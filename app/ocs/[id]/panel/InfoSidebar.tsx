import Link from "next/link";
import { RELATION_TYPES, type RelationType, getOCProgress } from "@/lib/utils";
import ProgressRing from "@/components/ui/ProgressRing";
import DiarySection from "@/components/oc/DiarySection";

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
  const progress = getOCProgress(oc);
  return (
    <aside className="w-48 h-full flex-shrink-0 border-r border-stone-border bg-stone-card/70 backdrop-blur-sm overflow-y-auto overflow-x-hidden p-4 space-y-4 text-xs">
      {/* Name & Core Identity */}
      <section>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-base font-serif font-medium text-stone-text leading-tight break-all">
            {oc.name}
          </h1>
          <ProgressRing percent={progress.percent} size="md" className="flex-shrink-0" />
        </div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {oc.species && (
            <span className="text-[10px] px-1.5 py-0.5 bg-sage-100 text-sage-700 border border-sage-200" style={{borderRadius:"4px"}}>
              {oc.species}
            </span>
          )}
          {oc.gender && (
            <span className="text-[10px] px-1.5 py-0.5 bg-stone-hover text-stone-text border border-stone-border" style={{borderRadius:"4px"}}>
              {oc.gender}
            </span>
          )}
          {oc.age && (
            <span className="text-[10px] px-1.5 py-0.5 bg-stone-hover text-stone-text border border-stone-border" style={{borderRadius:"4px"}}>
              {oc.age}岁
            </span>
          )}
          {oc.mbti && (
            <span className="text-[10px] px-1.5 py-0.5 bg-stone-hover text-stone-text border border-stone-border" style={{borderRadius:"4px"}}>
              {oc.mbti}
            </span>
          )}
        </div>
      </section>

      {/* Personality */}
      {personality.length > 0 && (
        <Section label="性格" mark="◇">
          <div className="flex flex-wrap gap-1">
            {personality.map((p, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-stone-hover text-stone-text border border-stone-border text-[10px]" style={{borderRadius:"4px"}}>{p}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Key traits */}
      <Section label="特质" mark="◆">
        <dl className="space-y-1">
          {oc.strengths && <Row label="优点" value={oc.strengths} />}
          {oc.weaknesses && <Row label="缺点" value={oc.weaknesses} />}
          {oc.quirks && <Row label="癖好" value={oc.quirks} />}
          {oc.taboos && <Row label="禁忌" value={oc.taboos} />}
          {oc.fears && <Row label="恐惧" value={oc.fears} />}
        </dl>
      </Section>

      {/* Abilities */}
      {(oc.abilities || oc.weapons || oc.fightingStyle || oc.skills) && (
        <Section label="能力·装备" mark="△">
          <dl className="space-y-1">
            {oc.abilities && <Row label="能力" value={oc.abilities} />}
            {oc.fightingStyle && <Row label="战斗" value={oc.fightingStyle} />}
            {oc.skills && <Row label="技能" value={oc.skills} />}
            {oc.weapons && <Row label="武器" value={oc.weapons} />}
            {oc.abilityWeaknesses && <Row label="弱点" value={oc.abilityWeaknesses} />}
          </dl>
        </Section>
      )}

      {/* Appearance */}
      <Section label="外貌" mark="□">
        <dl className="space-y-1">
          {oc.height && <Row label="身高" value={oc.height} />}
          {oc.bodyType && <Row label="体型" value={oc.bodyType} />}
          {oc.hairColor && <Row label="发色" value={oc.hairColor} />}
          {oc.eyeColor && <Row label="瞳色" value={oc.eyeColor} />}
          {oc.clothingStyle && <Row label="服装" value={oc.clothingStyle} />}
          {oc.specialFeatures && <Row label="特征" value={oc.specialFeatures} />}
        </dl>
      </Section>

      {/* Relations */}
      {relations.length > 0 && (
        <Section label={`关系 (${relations.length})`} mark="⬡">
          <div className="space-y-0.5">
            {relations.map((r) => {
              const type = RELATION_TYPES[r.type as RelationType] || RELATION_TYPES.other;
              return (
                <Link key={r.id} href={`/ocs/${r.id}/panel`}
                  className="flex items-center gap-1.5 hover:bg-stone-hover px-1.5 py-0.5 -mx-1.5 transition-colors group"
                  style={{borderRadius:"4px"}}>
                  <span className="w-1.5 h-1.5 flex-shrink-0" style={{backgroundColor:type.color,borderRadius:"50%"}}/>
                  <span className="text-stone-text truncate group-hover:text-sage-600 transition-colors">{r.name}</span>
                  <span className="text-[9px] px-1 ml-auto flex-shrink-0" style={{backgroundColor:type.color+"20",color:type.color,borderRadius:"3px"}}>{type.label}</span>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* Likes & dislikes */}
      {(oc.likes || oc.dislikes) && (
        <Section label="喜好" mark="◎">
          <dl className="space-y-1">
            {oc.likes && <Row label="喜欢" value={oc.likes} />}
            {oc.dislikes && <Row label="讨厌" value={oc.dislikes} />}
            {oc.habits && <Row label="习惯" value={oc.habits} />}
            {oc.belongings && <Row label="随身" value={oc.belongings} />}
          </dl>
        </Section>
      )}

      {/* Motto */}
      {oc.motto && (
        <Section label="座右铭" mark="◇">
          <p className="text-stone-text/70 italic text-[10px] leading-relaxed break-words">
            &ldquo;{oc.motto}&rdquo;
          </p>
        </Section>
      )}

      {/* Theme Song */}
      {oc.themeSong && (
        <Section label="主题曲" mark="△">
          <p className="text-stone-text/70 text-[10px] truncate">{oc.themeSong}</p>
        </Section>
      )}

      {/* Daily Question */}
      <DiarySection ocId={oc.id} />

      {/* Status */}
      <section className="pt-2 border-t border-stone-border/50">
        <span className={`text-[10px] px-1.5 py-0.5 ${
          oc.status === "public" ? "bg-green-100 text-green-600" :
          oc.status === "private" ? "bg-red-100 text-red-500" : "bg-stone-hover text-stone-muted"
        }`} style={{borderRadius:"4px"}}>
          {oc.status === "public" ? "公开" : oc.status === "private" ? "私密" : "草稿"}
        </span>
      </section>
    </aside>
  );
}

function Section({ label, mark, children }: { label: string; mark: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] font-medium text-stone-muted/60 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        <span className="text-[8px] opacity-50 flex-shrink-0">{mark}</span>
        {label}
      </h3>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex gap-1.5 min-w-0">
      <dt className="text-stone-muted/50 w-7 flex-shrink-0 text-[10px]">{label}</dt>
      <dd className="text-stone-text/80 truncate text-[10px]">{value}</dd>
    </div>
  );
}
