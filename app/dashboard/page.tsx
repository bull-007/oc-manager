import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-serif font-bold text-warm-brown">
          欢迎回来，{session.user.name}
        </h1>
        <p className="text-warm-muted mt-1">你的创作宇宙概览</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-warm-paper border border-warm-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
          >
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-warm-brown">{s.value}</div>
            <div className="text-sm text-warm-muted mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/ocs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 text-warm-cream rounded-lg font-medium hover:bg-amber-800 transition-colors shadow-sm"
        >
          + 新建 OC
        </Link>
        <Link
          href="/worlds/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-warm-border text-warm-brown rounded-lg font-medium hover:bg-warm-paper transition-colors"
        >
          + 新建世界观
        </Link>
        <Link
          href="/inspirations"
          className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-warm-border text-warm-brown rounded-lg font-medium hover:bg-warm-paper transition-colors"
        >
          ✧ 记录灵感
        </Link>
      </div>

      {/* Recent OCs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-warm-brown">
            最近编辑的 OC
          </h2>
          <Link
            href="/ocs"
            className="text-sm text-amber-700 hover:text-amber-800"
          >
            查看全部 →
          </Link>
        </div>

        {recentOCs.length === 0 ? (
          <div className="bg-warm-paper border border-warm-border border-dashed rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">◆</div>
            <p className="text-warm-muted mb-4">还没有创建任何 OC</p>
            <Link
              href="/ocs/new"
              className="text-amber-700 hover:text-amber-800 font-medium"
            >
              创建第一个 OC →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOCs.map((oc) => (
              <Link
                key={oc.id}
                href={`/ocs/${oc.id}`}
                className="bg-warm-paper border border-warm-border rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-warm-border">
                  {oc.media[0]?.url ? (
                    <img
                      src={oc.media[0].url}
                      alt={oc.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-amber-600">
                      {oc.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-warm-brown truncate">
                    {oc.name}
                  </h3>
                  <p className="text-xs text-warm-muted truncate">
                    {[oc.species, oc.occupation, oc.world?.name]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {oc.status === "draft" && (
                    <span className="inline-block text-xs mt-1 px-1.5 py-0.5 rounded bg-gray-200 text-gray-600">
                      草稿
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
