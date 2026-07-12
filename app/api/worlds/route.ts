import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const worlds = await prisma.world.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { ocs: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ worlds });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const data = await req.json();

  const world = await prisma.world.create({
    data: {
      ...data,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ world }, { status: 201 });
}
