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
    { label: "OC 角色", value: ocCount, icon: "◆", href: "/ocs", color: "rgba(200,146,107,0.10)" },
    { label: "世界观", value: worldCount, icon: "◎", href: "/worlds", color: "rgba(160,184,160,0.09)" },
    { label: "关系", value: relationCount, icon: "⬡", href: "/relations", color: "rgba(212,160,160,0.09)" },
    { label: "灵感", value: inspirationCount, icon: "✧", href: "/inspirations", color: "rgba(200,150,100,0.08)" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl font-serif font-bold text-warm-brown">
          欢迎回来，{session.user.name}
        </h1>
        <p className="text-warm-muted mt-1">你的创作宇宙概览</p>
      </div>

      {/* Birthday Banner */}
      <BirthdayBanner />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="stat-card group"
            style={{
              background: `radial-gradient(ellipse 60% 55% at 80% 15%, ${s.color} 0%, transparent 50%), #FFFBF2`,
            }}
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
          className="inline-flex items-center gap-2 px-5 py-2.5 text-warm-cream font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #8A5D3E 0%, #6B4830 100%)",
            borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px",
          }}
        >
          + 新建 OC
        </Link>
        <Link
          href="/worlds/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-warm-border text-warm-brown font-medium transition-all hover:bg-warm-paper hover:-translate-y-0.5"
          style={{ borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px", background: "#FFFBF2" }}
        >
          + 新建世界观
        </Link>
        <Link
          href="/inspirations"
          className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-warm-border text-warm-brown font-medium transition-all hover:bg-warm-paper hover:-translate-y-0.5"
          style={{ borderRadius: "18px 5px 18px 5px / 15px 4px 15px 4px", background: "#FFFBF2" }}
        >
          ✧ 记录灵感
        </Link>
      </div>

      {/* Decorative divider */}
      <div className="divider-floral">✿ ❀ ✾</div>

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
          <div className="illustrated-empty">
            <svg width="80" height="60" viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5 Q17 3 32 5 Q34 30 30 52 Q28 54 15 50 Q13 28 15 5Z" stroke="#8A7E6E" strokeWidth="1.2" fill="none" opacity="0.5"/>
              <path d="M32 5 Q38 4 65 8 Q63 28 60 52 Q62 54 32 52" stroke="#8A7E6E" strokeWidth="1.2" fill="none" opacity="0.5"/>
              <line x1="32" y1="5" x2="32" y2="52" stroke="#8A7E6E" strokeWidth="0.8" opacity="0.4"/>
              <circle cx="48" cy="22" r="6" fill="none" stroke="#C8926B" strokeWidth="0.8" opacity="0.3"/>
              <line x1="54" y1="22" x2="62" y2="22" stroke="#C8926B" strokeWidth="0.6" opacity="0.25"/>
              <line x1="48" y1="22" x2="42" y2="22" stroke="#C8926B" strokeWidth="0.6" opacity="0.25"/>
            </svg>
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
                href={`/ocs/${oc.id}/panel`}
                className="bg-warm-paper border border-warm-border shadow-sm transition-all duration-200 flex items-center gap-4 p-5 hover:shadow-md hover:-translate-y-1 hover:border-amber-300"
                style={{ borderRadius: "20px 6px 20px 6px / 18px 5px 18px 5px" }}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center overflow-hidden border border-warm-border"
                    style={{
                      background: "radial-gradient(circle at 40% 40%, rgba(200,146,107,0.15) 0%, rgba(243,235,216,0.5) 100%)",
                    }}>
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
                <ProgressRing
                  percent={getOCProgress(oc).percent}
                  size="sm"
                  className="absolute -bottom-1 -right-1"
                />
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

      {/* Daily Questions */}
      <DailyQuestion />

    </div>
  );
}
