export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const RELATION_TYPES = {
  family: { label: "亲属", color: "#E8A0A0", strokeColor: "#d48080" },
  lover: { label: "恋人", color: "#E8B4B8", strokeColor: "#d49498" },
  friend: { label: "好友", color: "#A8C4A6", strokeColor: "#88a486" },
  enemy: { label: "仇敌", color: "#C45050", strokeColor: "#a43030" },
  other: { label: "其他", color: "#C4B8A8", strokeColor: "#a49888" },
} as const;

export type RelationType = keyof typeof RELATION_TYPES;

export const STATUS_OPTIONS = [
  { value: "draft", label: "草稿", color: "bg-gray-300" },
  { value: "public", label: "公开", color: "bg-green-400" },
  { value: "private", label: "私密", color: "bg-red-400" },
] as const;

// Fields that count toward OC completion
const PROGRESS_FIELDS = [
  "age", "gender", "species", "occupation", "nationality", "residence",
  "height", "bodyType", "hairColor", "eyeColor", "clothingStyle", "specialFeatures",
  "personality", "mbti", "strengths", "weaknesses", "quirks", "taboos", "fears", "motto",
  "background", "secrets",
  "abilities", "fightingStyle", "weapons", "skills", "abilityWeaknesses",
  "likes", "dislikes", "habits", "belongings", "quotes", "themeSong",
] as const;

export function getOCProgress(oc: Record<string, any>): { percent: number; filled: number; total: number } {
  let filled = 0;
  const total = PROGRESS_FIELDS.length;

  for (const field of PROGRESS_FIELDS) {
    const val = oc[field];
    if (field === "personality" || field === "quotes") {
      // JSON arrays
      try {
        const arr = typeof val === "string" ? JSON.parse(val) : val;
        if (Array.isArray(arr) && arr.length > 0) filled++;
      } catch { /* not filled */ }
    } else if (val !== null && val !== undefined && val !== "") {
      filled++;
    }
  }

  // Bonus: has avatar image
  if (oc.media?.length > 0) filled++;
  // Bonus: has relations
  if ((oc.relationsFrom?.length || 0) + (oc.relationsTo?.length || 0) > 0) filled++;
  // Bonus: linked to a world
  if (oc.worldId || oc.world?.id) filled++;

  const bonusCount = 3;
  const percent = Math.round((filled / (total + bonusCount)) * 100);
  return { percent, filled: filled, total: total + bonusCount };
}
