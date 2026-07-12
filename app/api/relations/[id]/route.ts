import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const data = await req.json();

  const existing = await prisma.relation.findUnique({
    where: { id },
    include: { fromOc: true },
  });

  if (!existing || existing.fromOc.userId !== session.user.id) {
    return NextResponse.json({ error: "未找到或无权修改" }, { status: 404 });
  }

  const relation = await prisma.relation.update({
    where: { id },
    data: {
      type: data.type,
      intimacy: data.intimacy,
      description: data.description,
    },
    include: {
      fromOc: { select: { id: true, name: true, species: true } },
      toOc: { select: { id: true, name: true, species: true } },
    },
  });

  return NextResponse.json({ relation });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.relation.findUnique({
    where: { id },
    include: { fromOc: true },
  });

  if (!existing || existing.fromOc.userId !== session.user.id) {
    return NextResponse.json({ error: "未找到或无权删除" }, { status: 404 });
  }

  await prisma.relation.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
