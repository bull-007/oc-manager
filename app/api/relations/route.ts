import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  // Get all relations for the user's OCs
  const relations = await prisma.relation.findMany({
    where: {
      OR: [
        { fromOc: { userId: session.user.id } },
        { toOc: { userId: session.user.id } },
      ],
    },
    include: {
      fromOc: {
        select: {
          id: true,
          name: true,
          species: true,
        },
      },
      toOc: {
        select: {
          id: true,
          name: true,
          species: true,
        },
      },
    },
  });

  // Also get all OCs for nodes
  const ocs = await prisma.oC.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      species: true,
      occupation: true,
      media: {
        take: 1,
        where: { category: "avatar" },
        select: { url: true },
      },
    },
  });

  return NextResponse.json({ relations, ocs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const data = await req.json();

  // Verify both OCs belong to user
  const [fromOc, toOc] = await Promise.all([
    prisma.oC.findUnique({ where: { id: data.fromOcId } }),
    prisma.oC.findUnique({ where: { id: data.toOcId } }),
  ]);

  if (
    !fromOc ||
    !toOc ||
    fromOc.userId !== session.user.id ||
    toOc.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "OC 未找到或无权访问" }, { status: 400 });
  }

  // Check if relation already exists
  const existing = await prisma.relation.findFirst({
    where: {
      OR: [
        { fromOcId: data.fromOcId, toOcId: data.toOcId },
        { fromOcId: data.toOcId, toOcId: data.fromOcId },
      ],
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "这两个角色已经有关系了" },
      { status: 400 }
    );
  }

  const relation = await prisma.relation.create({
    data: {
      type: data.type,
      intimacy: data.intimacy ?? 50,
      description: data.description,
      fromOcId: data.fromOcId,
      toOcId: data.toOcId,
    },
    include: {
      fromOc: { select: { id: true, name: true, species: true } },
      toOc: { select: { id: true, name: true, species: true } },
    },
  });

  return NextResponse.json({ relation }, { status: 201 });
}
