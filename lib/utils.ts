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
