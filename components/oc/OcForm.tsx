"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TagInput from "@/components/ui/TagInput";
import ImageUpload from "@/components/ui/ImageUpload";
import Button from "@/components/ui/Button";

const PERSONALITY_SUGGESTIONS = [
  "开朗", "内向", "温柔", "冷酷", "热血", "腹黑", "天然呆",
  "傲娇", "病娇", "元气", "慵懒", "认真", "中二", "成熟",
  "善良", "邪恶", "正直", "狡猾", "勇敢", "胆小",
];

interface OcFormData {
  name: string;
  age: string;
  gender: string;
  species: string;
  occupation: string;
  nationality: string;
  residence: string;
  height: string;
  bodyType: string;
  hairColor: string;
  eyeColor: string;
  clothingStyle: string;
  specialFeatures: string;
  personality: string[];
  mbti: string;
  strengths: string;
  weaknesses: string;
  quirks: string;
  taboos: string;
  fears: string;
  motto: string;
  background: string;
  secrets: string;
  abilities: string;
  fightingStyle: string;
  weapons: string;
  skills: string;
  abilityWeaknesses: string;
  likes: string;
  dislikes: string;
  habits: string;
  belongings: string;
  quotes: string;
  themeSong: string;
  status: string;
  worldId: string;
  tags: string[];
  images: string[];
}

const emptyForm: OcFormData = {
  name: "", age: "", gender: "", species: "", occupation: "",
  nationality: "", residence: "", height: "", bodyType: "",
  hairColor: "", eyeColor: "", clothingStyle: "", specialFeatures: "",
  personality: [], mbti: "", strengths: "", weaknesses: "",
  quirks: "", taboos: "", fears: "", motto: "",
  background: "", secrets: "", abilities: "", fightingStyle: "",
  weapons: "", skills: "", abilityWeaknesses: "",
  likes: "", dislikes: "", habits: "", belongings: "",
  quotes: "", themeSong: "", status: "draft", worldId: "",
  tags: [], images: [],
};

interface Props {
  initialData?: any;
  isEditing?: boolean;
}

export default function OcForm({ initialData, isEditing }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OcFormData>(emptyForm);
  const [activeTab, setActiveTab] = useState("basic");
  const [worlds, setWorlds] = useState<any[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);

  useEffect(() => {
    // Load worlds and tags for the form
    fetch("/api/worlds").then(r => r.json()).then(d => setWorlds(d.worlds || []));
    fetch("/api/tags").then(r => r.json()).then(d => setAvailableTags(d.tags || []));

    if (initialData) {
      setForm({
        name: initialData.name || "",
        age: initialData.age?.toString() || "",
        gender: initialData.gender || "",
        species: initialData.species || "",
        occupation: initialData.occupation || "",
        nationality: initialData.nationality || "",
        residence: initialData.residence || "",
        height: initialData.height || "",
        bodyType: initialData.bodyType || "",
        hairColor: initialData.hairColor || "",
        eyeColor: initialData.eyeColor || "",
        clothingStyle: initialData.clothingStyle || "",
        specialFeatures: initialData.specialFeatures || "",
        personality: JSON.parse(initialData.personality || "[]"),
        mbti: initialData.mbti || "",
        strengths: initialData.strengths || "",
        weaknesses: initialData.weaknesses || "",
        quirks: initialData.quirks || "",
        taboos: initialData.taboos || "",
        fears: initialData.fears || "",
        motto: initialData.motto || "",
        background: initialData.background || "",
        secrets: initialData.secrets || "",
        abilities: initialData.abilities || "",
        fightingStyle: initialData.fightingStyle || "",
        weapons: initialData.weapons || "",
        skills: initialData.skills || "",
        abilityWeaknesses: initialData.abilityWeaknesses || "",
        likes: initialData.likes || "",
        dislikes: initialData.dislikes || "",
        habits: initialData.habits || "",
        belongings: initialData.belongings || "",
        quotes: initialData.quotes || "",
        themeSong: initialData.themeSong || "",
        status: initialData.status || "draft",
        worldId: initialData.worldId || "",
        tags: initialData.ocTags?.map((t: any) => t.tag.id) || [],
        images: initialData.media?.map((m: any) => m.url) || [],
      });
    }
  }, [initialData]);

  const update = (key: keyof OcFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("请输入角色名称");
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender || null,
      species: form.species || null,
      occupation: form.occupation || null,
      nationality: form.nationality || null,
      residence: form.residence || null,
      height: form.height || null,
      bodyType: form.bodyType || null,
      hairColor: form.hairColor || null,
      eyeColor: form.eyeColor || null,
      clothingStyle: form.clothingStyle || null,
      specialFeatures: form.specialFeatures || null,
      personality: JSON.stringify(form.personality),
      mbti: form.mbti || null,
      strengths: form.strengths || null,
      weaknesses: form.weaknesses || null,
      quirks: form.quirks || null,
      taboos: form.taboos || null,
      fears: form.fears || null,
      motto: form.motto || null,
      background: form.background || null,
      secrets: form.secrets || null,
      abilities: form.abilities || null,
      fightingStyle: form.fightingStyle || null,
      weapons: form.weapons || null,
      skills: form.skills || null,
      abilityWeaknesses: form.abilityWeaknesses || null,
      likes: form.likes || null,
      dislikes: form.dislikes || null,
      habits: form.habits || null,
      belongings: form.belongings || null,
      quotes: JSON.stringify(
        form.quotes ? form.quotes.split("\n").filter(Boolean) : []
      ),
      themeSong: form.themeSong || null,
      status: form.status,
      worldId: form.worldId || null,
      tags: form.tags,
      imageUrls: form.images,
    };

    try {
      const url = isEditing
        ? `/api/ocs/${initialData.id}`
        : "/api/ocs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isEditing ? "已更新" : "已创建");
        const data = await res.json();
        router.push(`/ocs/${data.oc.id}`);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "操作失败");
      }
    } catch {
      toast.error("操作失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: "basic", label: "基础信息" },
    { key: "appearance", label: "外貌" },
    { key: "personality", label: "性格" },
    { key: "background", label: "背景" },
    { key: "ability", label: "能力" },
    { key: "other", label: "其他" },
  ];

  const inputClass =
    "w-full px-3 py-2 border border-warm-border rounded-lg bg-warm-cream text-sm text-warm-brown placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-warm-brown mb-1";
  const textareaClass = `${inputClass} resize-none`;

  return (
    <form onSubmit={handleSubmit}>
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6 bg-warm-paper border border-warm-border rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm transition-colors ${
              activeTab === tab.key
                ? "bg-amber-100 text-amber-900 font-medium"
                : "text-warm-muted hover:text-warm-brown hover:bg-warm-cream"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-warm-paper border border-warm-border rounded-xl p-6 space-y-4">
        {/* === BASIC INFO === */}
        {activeTab === "basic" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif font-bold text-warm-brown text-lg mb-4">基础信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>姓名 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>年龄</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>性别</label>
                <select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  className={inputClass}
                >
                  <option value="">不指定</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="无性别">无性别</option>
                  <option value="双性">双性</option>
                  <option value="流体">流体</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>种族</label>
                <input
                  type="text"
                  value={form.species}
                  onChange={(e) => update("species", e.target.value)}
                  className={inputClass}
                  placeholder="人类/精灵/兽人..."
                />
              </div>
              <div>
                <label className={labelClass}>职业</label>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={(e) => update("occupation", e.target.value)}
                  className={inputClass}
                  placeholder="战士/法师/学生..."
                />
              </div>
              <div>
                <label className={labelClass}>国籍</label>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={(e) => update("nationality", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>现居地</label>
                <input
                  type="text"
                  value={form.residence}
                  onChange={(e) => update("residence", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>关联世界观</label>
                <select
                  value={form.worldId}
                  onChange={(e) => update("worldId", e.target.value)}
                  className={inputClass}
                >
                  <option value="">不关联</option>
                  {worlds.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>状态</label>
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                  className={inputClass}
                >
                  <option value="draft">草稿</option>
                  <option value="public">公开</option>
                  <option value="private">私密</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* === APPEARANCE === */}
        {activeTab === "appearance" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif font-bold text-warm-brown text-lg mb-4">外貌形象</h3>

            <div>
              <label className={labelClass}>形象图片</label>
              <ImageUpload
                images={form.images}
                onChange={(imgs) => update("images", imgs)}
                max={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>身高</label>
                <input type="text" value={form.height} onChange={(e) => update("height", e.target.value)} className={inputClass} placeholder="例如: 175cm" />
              </div>
              <div>
                <label className={labelClass}>体型</label>
                <input type="text" value={form.bodyType} onChange={(e) => update("bodyType", e.target.value)} className={inputClass} placeholder="纤瘦/匀称/魁梧..." />
              </div>
              <div>
                <label className={labelClass}>发色</label>
                <input type="text" value={form.hairColor} onChange={(e) => update("hairColor", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>瞳色</label>
                <input type="text" value={form.eyeColor} onChange={(e) => update("eyeColor", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>服装风格</label>
                <input type="text" value={form.clothingStyle} onChange={(e) => update("clothingStyle", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>特殊特征</label>
                <input type="text" value={form.specialFeatures} onChange={(e) => update("specialFeatures", e.target.value)} className={inputClass} placeholder="兽耳/翅膀/疤痕..." />
              </div>
            </div>
          </div>
        )}

        {/* === PERSONALITY === */}
        {activeTab === "personality" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif font-bold text-warm-brown text-lg mb-4">性格设定</h3>

            <div>
              <label className={labelClass}>性格标签</label>
              <TagInput
                tags={form.personality}
                onChange={(tags) => update("personality", tags)}
                placeholder="输入性格标签后按回车..."
                suggestions={PERSONALITY_SUGGESTIONS}
              />
            </div>

            <div>
              <label className={labelClass}>MBTI</label>
              <select value={form.mbti} onChange={(e) => update("mbti", e.target.value)} className={inputClass}>
                <option value="">不指定</option>
                {["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>优点</label>
              <textarea value={form.strengths} onChange={(e) => update("strengths", e.target.value)} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className={labelClass}>缺点</label>
              <textarea value={form.weaknesses} onChange={(e) => update("weaknesses", e.target.value)} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className={labelClass}>癖好</label>
              <input type="text" value={form.quirks} onChange={(e) => update("quirks", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>禁忌</label>
              <input type="text" value={form.taboos} onChange={(e) => update("taboos", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>内心恐惧</label>
              <input type="text" value={form.fears} onChange={(e) => update("fears", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>座右铭</label>
              <input type="text" value={form.motto} onChange={(e) => update("motto", e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        {/* === BACKGROUND === */}
        {activeTab === "background" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif font-bold text-warm-brown text-lg mb-4">背景故事</h3>
            <div>
              <label className={labelClass}>背景故事</label>
              <textarea value={form.background} onChange={(e) => update("background", e.target.value)} className={textareaClass} rows={6} placeholder="童年经历、人生转折、家庭背景、关键事件..." />
            </div>
            <div>
              <label className={labelClass}>秘密/黑历史</label>
              <textarea value={form.secrets} onChange={(e) => update("secrets", e.target.value)} className={textareaClass} rows={3} />
            </div>
          </div>
        )}

        {/* === ABILITY === */}
        {activeTab === "ability" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif font-bold text-warm-brown text-lg mb-4">能力设定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>特殊能力</label>
                <textarea value={form.abilities} onChange={(e) => update("abilities", e.target.value)} className={textareaClass} rows={3} />
              </div>
              <div>
                <label className={labelClass}>战斗风格</label>
                <input type="text" value={form.fightingStyle} onChange={(e) => update("fightingStyle", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>武器装备</label>
                <input type="text" value={form.weapons} onChange={(e) => update("weapons", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>专业技能</label>
                <textarea value={form.skills} onChange={(e) => update("skills", e.target.value)} className={textareaClass} rows={3} />
              </div>
              <div>
                <label className={labelClass}>能力弱点</label>
                <textarea value={form.abilityWeaknesses} onChange={(e) => update("abilityWeaknesses", e.target.value)} className={textareaClass} rows={3} />
              </div>
            </div>
          </div>
        )}

        {/* === OTHER === */}
        {activeTab === "other" && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="font-serif font-bold text-warm-brown text-lg mb-4">其他信息</h3>

            <div>
              <label className={labelClass}>喜好</label>
              <textarea value={form.likes} onChange={(e) => update("likes", e.target.value)} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className={labelClass}>厌恶</label>
              <textarea value={form.dislikes} onChange={(e) => update("dislikes", e.target.value)} className={textareaClass} rows={2} />
            </div>
            <div>
              <label className={labelClass}>生活习惯</label>
              <input type="text" value={form.habits} onChange={(e) => update("habits", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>随身物品</label>
              <input type="text" value={form.belongings} onChange={(e) => update("belongings", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>经典语录（每行一句）</label>
              <textarea value={form.quotes} onChange={(e) => update("quotes", e.target.value)} className={textareaClass} rows={4} placeholder="每行一句经典语录..." />
            </div>
            <div>
              <label className={labelClass}>主题曲</label>
              <input type="text" value={form.themeSong} onChange={(e) => update("themeSong", e.target.value)} className={inputClass} placeholder="歌曲名或链接..." />
            </div>
            <div>
              <label className={labelClass}>标签</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      const newTags = form.tags.includes(tag.id)
                        ? form.tags.filter((t) => t !== tag.id)
                        : [...form.tags, tag.id];
                      update("tags", newTags);
                    }}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      form.tags.includes(tag.id)
                        ? "bg-amber-100 border-amber-300 text-amber-800"
                        : "border-warm-border text-warm-muted hover:bg-warm-cream"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
              {availableTags.length === 0 && (
                <p className="text-xs text-warm-muted">还没有创建标签，可以在灵感页面创建</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "保存中..." : isEditing ? "保存修改" : "创建 OC"}
        </Button>
      </div>
    </form>
  );
}
