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
    <aside className="w-52 flex-shrink-0 border-r border-warm-border/50 bg-warm-paper/50 backdrop-blur-sm overflow-y-auto p-4 space-y-5 text-xs">
      {/* Basic info */}
      <section>
        <h3 className="text-xs font-bold text-warm-brown/60 uppercase tracking-wider mb-2">
          基础信息
        </h3>
        <dl className="space-y-1.5">
          {oc.age && <Row label="年龄" value={`${oc.age}岁`} />}
          {oc.gender && <Row label="性别" value={oc.gender} />}
          {oc.nationality && <Row label="国籍" value={oc.nationality} />}
          {oc.residence && <Row label="现居" value={oc.residence} />}
          {oc.height && <Row label="身高" value={oc.height} />}
          {oc.bodyType && <Row label="体型" value={oc.bodyType} />}
          {oc.hairColor && <Row label="发色" value={oc.hairColor} />}
          {oc.eyeColor && <Row label="瞳色" value={oc.eyeColor} />}
          {oc.clothingStyle && <Row label="服装" value={oc.clothingStyle} />}
          {oc.specialFeatures && (
            <Row label="特征" value={oc.specialFeatures} />
          )}
        </dl>
      </section>

      {/* Personality */}
      {personality.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-warm-brown/60 uppercase tracking-wider mb-2">
            性格
          </h3>
          <div className="flex flex-wrap gap-1">
            {personality.map((p, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px]"
              >
                {p}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Traits */}
      {(oc.strengths || oc.weaknesses || oc.fears) && (
        <section>
          <h3 className="text-xs font-bold text-warm-brown/60 uppercase tracking-wider mb-2">
            特质
          </h3>
          <dl className="space-y-1.5">
            {oc.strengths && (
              <Row label="优点" value={oc.strengths} color="text-green-700" />
            )}
            {oc.weaknesses && (
              <Row label="缺点" value={oc.weaknesses} color="text-red-600" />
            )}
            {oc.quirks && <Row label="癖好" value={oc.quirks} />}
            {oc.taboos && <Row label="禁忌" value={oc.taboos} />}
            {oc.fears && (
              <Row label="恐惧" value={oc.fears} color="text-purple-600" />
            )}
          </dl>
        </section>
      )}

      {/* Likes */}
      {(oc.likes || oc.dislikes || oc.habits || oc.belongings) && (
        <section>
          <h3 className="text-xs font-bold text-warm-brown/60 uppercase tracking-wider mb-2">
            喜好
          </h3>
          <dl className="space-y-1.5">
            {oc.likes && <Row label="喜欢" value={oc.likes} />}
            {oc.dislikes && <Row label="讨厌" value={oc.dislikes} />}
            {oc.habits && <Row label="习惯" value={oc.habits} />}
            {oc.belongings && <Row label="随身" value={oc.belongings} />}
          </dl>
        </section>
      )}

      {/* Abilities */}
      {(oc.abilities || oc.skills || oc.weapons) && (
        <section>
          <h3 className="text-xs font-bold text-warm-brown/60 uppercase tracking-wider mb-2">
            能力
          </h3>
          <dl className="space-y-1.5">
            {oc.abilities && <Row label="能力" value={oc.abilities} />}
            {oc.fightingStyle && (
              <Row label="战斗" value={oc.fightingStyle} />
            )}
            {oc.weapons && (
              <Row label="武器" value={oc.weapons} />
            )}
            {oc.skills && <Row label="技能" value={oc.skills} />}
          </dl>
        </section>
      )}

      {/* Relations */}
      {relations.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-warm-brown/60 uppercase tracking-wider mb-2">
            关系 ({relations.length})
          </h3>
          <div className="space-y-1.5">
            {relations.map((r) => {
              const type =
                RELATION_TYPES[r.type as RelationType] || RELATION_TYPES.other;
              return (
                <Link
                  key={r.id}
                  href={`/ocs/${r.id}/panel`}
                  className="flex items-center gap-1.5 hover:bg-warm-cream rounded-md px-1.5 py-1 -mx-1.5 transition-colors group"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-warm-brown truncate group-hover:text-amber-700 transition-colors">
                    {r.name}
                  </span>
                  <span
                    className="text-[10px] px-1 rounded ml-auto flex-shrink-0"
                    style={{
                      backgroundColor: type.color + "30",
                      color: type.color,
                    }}
                  >
                    {type.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Motto */}
      {oc.motto && (
        <section>
          <h3 className="text-xs font-bold text-warm-brown/60 uppercase tracking-wider mb-2">
            座右铭
          </h3>
          <p className="text-warm-brown/70 italic leading-relaxed text-[11px]">
            " {oc.motto} "
          </p>
        </section>
      )}

      {/* Theme Song */}
      {oc.themeSong && (
        <section>
          <h3 className="text-xs font-bold text-warm-brown/60 uppercase tracking-wider mb-2">
            主题曲
          </h3>
          <p className="text-warm-brown/70 text-[11px]">🎵 {oc.themeSong}</p>
        </section>
      )}

      {/* Status */}
      <section className="pt-2 border-t border-warm-border/50">
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${
              oc.status === "public"
                ? "bg-green-100 text-green-700"
                : oc.status === "private"
                ? "bg-red-100 text-red-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {oc.status === "public"
              ? "公开"
              : oc.status === "private"
              ? "私密"
              : "草稿"}
          </span>
          <Link
            href={`/ocs/${oc.id}/edit`}
            className="text-[10px] text-warm-muted hover:text-warm-brown"
          >
            编辑 ✎
          </Link>
        </div>
      </section>
    </aside>
  );
}

function Row({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex gap-2">
      <dt className="text-warm-muted w-8 flex-shrink-0">{label}</dt>
      <dd className={`text-warm-brown truncate ${color || ""}`}>{value}</dd>
    </div>
  );
}
