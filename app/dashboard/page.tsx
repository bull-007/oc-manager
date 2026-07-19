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

  const [ocCount, worldCount, relationCount, inspirationCount, recentOCs] =
    await Promise.all([
      prisma.oC.count({ where: { userId: session.user.id } }),
      prisma.world.count({ where: { userId: session.user.id } }),
      prisma.relation.count({
        where: {
          OR: [
            { fromOc: { userId: session.user.id } },
            { toOc: { userId: session.user.id } },
          ],
        },
      }),
      prisma.inspiration.count({ where: { userId: session.user.id } }),
      prisma.oC.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          media: { take: 1, orderBy: { createdAt: "asc" } },
          world: { select: { id: true, name: true } },
        },
      }),
    ]);

  const stats = [
    { label: "OC 角色", value: ocCount, icon: "◆", href: "/ocs" },
    { label: "世界观", value: worldCount, icon: "◎", href: "/worlds" },
    { label: "关系", value: relationCount, icon: "⬡", href: "/relations" },
    { label: "灵感", value: inspirationCount, icon: "✧", href: "/inspirations" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-slide-up">
      <BirthdayBanner />

      <div>
        <h1 className="text-2xl font-hand text-warm-brown">
          欢迎回来，{session.user.name}
        </h1>
        <p className="text-warm-muted mt-1 text-sm">你的创作宇宙概览</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-warm-paper border border-warm-border rounded-xl p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
          >
            <div className="text-xl mb-2">{s.icon}</div>
            <div className="text-3xl font-hand text-warm-brown">{s.value}</div>
            <div className="text-sm text-warm-muted mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/ocs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-warm-cream font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          style={{
            background: "#B8977E",
            borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px",
          }}
        >
          + 新建 OC
        </Link>
        <Link
          href="/worlds/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-warm-border text-warm-brown font-medium transition-all hover:bg-warm-paper hover:-translate-y-0.5"
          style={{ borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px", background: "#F7F3EC" }}
        >
          + 新建世界观
        </Link>
        <Link
          href="/inspirations"
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-warm-border text-warm-brown font-medium transition-all hover:bg-warm-paper hover:-translate-y-0.5"
          style={{ borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px", background: "#F7F3EC" }}
        >
          ✧ 记录灵感
        </Link>
      </div>

      {/* Recent OCs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-hand text-warm-brown">最近编辑的 OC</h2>
          <Link href="/ocs" className="text-sm text-amber-700 hover:text-amber-800">
            查看全部 →
          </Link>
        </div>

        {recentOCs.length === 0 ? (
          <div className="bg-warm-paper border border-dashed border-warm-border rounded-xl p-12 text-center">
            <p className="text-warm-muted mb-3">还没有创建任何 OC</p>
            <Link href="/ocs/new" className="text-amber-700 hover:text-amber-800 font-medium text-sm">
              创建第一个 OC →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentOCs.map((oc) => (
              <Link
                key={oc.id}
                href={`/ocs/${oc.id}/panel`}
                className="bg-warm-paper border border-warm-border shadow-sm transition-all duration-200 flex items-center gap-4 p-4 hover:shadow-md hover:-translate-y-1 hover:border-amber-400"
                style={{ borderRadius: "20px 6px 20px 6px / 18px 5px 18px 5px" }}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center overflow-hidden border border-warm-border">
                    {oc.media[0]?.url ? (
                      <img src={oc.media[0].url} alt={oc.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl text-amber-600 font-hand">{oc.name.charAt(0)}</span>
                    )}
                  </div>
                  <ProgressRing percent={getOCProgress(oc).percent} size="sm" className="absolute -bottom-1 -right-1" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-hand text-warm-brown truncate">{oc.name}</h3>
                  <p className="text-xs text-warm-muted truncate">
                    {[oc.species, oc.occupation, oc.world?.name].filter(Boolean).join(" · ")}
                  </p>
                  {oc.status === "draft" && (
                    <span className="inline-block text-xs mt-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">草稿</span>
                  )}
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
