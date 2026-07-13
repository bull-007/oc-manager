import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InteractiveStage from "./InteractiveStage";
import InfoSidebar from "./InfoSidebar";

export default async function PanelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { id } = await params;

  const oc = await prisma.oC.findUnique({
    where: { id },
    include: {
      media: { orderBy: { createdAt: "asc" } },
      ocTags: { include: { tag: true } },
      world: { select: { id: true, name: true } },
      relationsFrom: {
        include: { toOc: { select: { id: true, name: true } } },
      },
      relationsTo: {
        include: { fromOc: { select: { id: true, name: true } } },
      },
    },
  });

  if (!oc || oc.userId !== session.user.id) notFound();

  const quotes: string[] = JSON.parse(oc.quotes || "[]");
  const personality: string[] = JSON.parse(oc.personality || "[]");
  const avatarUrl = oc.media[0]?.url;

  const relations = [
    ...oc.relationsFrom.map((r) => ({
      name: r.toOc.name,
      id: r.toOc.id,
      type: r.type,
      intimacy: r.intimacy,
    })),
    ...oc.relationsTo.map((r) => ({
      name: r.fromOc.name,
      id: r.fromOc.id,
      type: r.type,
      intimacy: r.intimacy,
    })),
  ];

  return (
    <div className="h-[calc(100vh-5rem)] flex animate-slide-up">
      {/* Left: Info Sidebar */}
      <InfoSidebar oc={oc} personality={personality} relations={relations} />

      {/* Center: Interactive Character Stage */}
      <InteractiveStage
        ocName={oc.name}
        avatarUrl={avatarUrl}
        quotes={quotes}
        species={oc.species}
        occupation={oc.occupation}
        mbti={oc.mbti}
        worldName={oc.world?.name}
        ocId={oc.id}
        relations={relations}
      />
    </div>
  );
}
