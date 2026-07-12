import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  const world = await prisma.world.findUnique({
    where: { id },
    include: {
      ocs: {
        select: {
          id: true,
          name: true,
          species: true,
          occupation: true,
        },
      },
      locations: true,
      stories: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!world || world.userId !== session.user.id) {
    return NextResponse.json({ error: "未找到或无权访问" }, { status: 404 });
  }

  return NextResponse.json({ world });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.world.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "未找到或无权修改" }, { status: 404 });
  }

  const data = await req.json();
  const world = await prisma.world.update({
    where: { id },
    data,
  });

  return NextResponse.json({ world });
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

  const existing = await prisma.world.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "未找到或无权删除" }, { status: 404 });
  }

  await prisma.world.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
