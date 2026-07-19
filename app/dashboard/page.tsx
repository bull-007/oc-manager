import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getOCProgress } from "@/lib/utils";
import ProgressRing from "@/components/ui/ProgressRing";
import DailyQuestion from "@/components/oc/DailyQuestion";
import BirthdayBanner from "@/components/oc/BirthdayBanner";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [ocCount, worldCount, relationCount, inspirationCount, recentOCs] = await Promise.all([
    prisma.oC.count({ where: { userId: session.user.id } }),
    prisma.world.count({ where: { userId: session.user.id } }),
    prisma.relation.count({ where: { OR: [{ fromOc: { userId: session.user.id } }, { toOc: { userId: session.user.id } }] } }),
    prisma.inspiration.count({ where: { userId: session.user.id } }),
    prisma.oC.findMany({
      where: { userId: session.user.id }, orderBy: { updatedAt: "desc" }, take: 5,
      include: { media: { take: 1, orderBy: { createdAt: "asc" } }, world: { select: { id: true, name: true } } },
    }),
  ]);

  const stats = [
    { label: "OC 角色", value: ocCount, href: "/ocs", mark: "◆" },
    { label: "世界观", value: worldCount, href: "/worlds", mark: "◎" },
    { label: "关系", value: relationCount, href: "/relations", mark: "⬡" },
    { label: "灵感", value: inspirationCount, href: "/inspirations", mark: "△" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-slide-up">
      <BirthdayBanner />
      <div>
        <h1 className="text-2xl font-serif font-medium text-stone-text">欢迎回来，{session.user.name}</h1>
        <p className="text-stone-muted mt-1 text-sm">你的创作宇宙概览</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}
            className="bg-stone-card border border-stone-border p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-sage transition-all duration-200 group"
            style={{ borderRadius: "10px" }}>
            <div className="text-stone-muted/40 text-xs mb-2 group-hover:text-sage-500 transition-colors">{s.mark}</div>
            <div className="text-2xl font-serif font-medium text-stone-text mb-0.5">{s.value}</div>
            <div className="text-xs text-stone-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/ocs/new"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors"
          style={{ background: "#869087", color: "#fff", borderRadius: "8px" }}>
          <span className="text-base">+</span> 新建 OC
        </Link>
        <Link href="/worlds/new"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-stone-text border border-stone-border hover:bg-stone-hover transition-colors"
          style={{ borderRadius: "8px" }}>
          <span className="text-stone-muted/50 text-xs">◎</span> 新建世界观
        </Link>
        <Link href="/inspirations"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-stone-text border border-stone-border hover:bg-stone-hover transition-colors"
          style={{ borderRadius: "8px" }}>
          <span className="text-stone-muted/50 text-xs">△</span> 记录灵感
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-medium text-stone-text flex items-center gap-2">
            <span className="text-stone-muted/30 text-sm">◆</span>最近编辑的 OC
          </h2>
          <Link href="/ocs" className="text-sm text-sage-600 hover:text-sage-700">查看全部 →</Link>
        </div>

        {recentOCs.length === 0 ? (
          <div className="bg-stone-card border border-stone-border p-12 text-center" style={{ borderRadius: "10px" }}>
            <div className="text-stone-muted/30 text-3xl mb-3">◇</div>
            <p className="text-stone-muted mb-3 text-sm">还没有创建任何 OC</p>
            <Link href="/ocs/new" className="text-sage-600 hover:text-sage-700 font-medium text-sm">创建第一个 OC →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOCs.map((oc) => (
              <Link key={oc.id} href={`/ocs/${oc.id}/panel`}
                className="bg-stone-card border border-stone-border flex items-center gap-4 p-4 hover:shadow-md hover:-translate-y-0.5 hover:border-sage transition-all duration-200 overflow-hidden"
                style={{ borderRadius: "10px" }}>
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-sage-100 flex items-center justify-center overflow-hidden border border-stone-border" style={{ borderRadius: "8px" }}>
                    {oc.media[0]?.url ? (
                      <img src={oc.media[0].url} alt={oc.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-serif text-sage-600">{oc.name.charAt(0)}</span>
                    )}
                  </div>
                  <ProgressRing percent={getOCProgress(oc).percent} size="sm" className="absolute -bottom-1 -right-1" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h3 className="font-serif font-medium text-stone-text truncate">{oc.name}</h3>
                  <p className="text-xs text-stone-muted truncate">{[oc.species, oc.occupation, oc.world?.name].filter(Boolean).join(" · ") || " "}</p>
                  {oc.status === "draft" && <span className="inline-block text-xs mt-1 px-1.5 py-0.5 bg-stone-hover text-stone-muted" style={{borderRadius:"4px"}}>草稿</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <DailyQuestion />
    </div>
  );
}
