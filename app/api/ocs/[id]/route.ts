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

  const oc = await prisma.oC.findUnique({
    where: { id },
    include: {
      media: true,
      ocTags: { include: { tag: true } },
      world: {
        select: { id: true, name: true, type: true },
      },
      relationsFrom: {
        include: {
          toOc: {
            select: { id: true, name: true },
          },
        },
      },
      relationsTo: {
        include: {
          fromOc: {
            select: { id: true, name: true },
          },
        },
      },
      inspirations: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!oc || oc.userId !== session.user.id) {
    return NextResponse.json({ error: "未找到或无权访问" }, { status: 404 });
  }

  return NextResponse.json({ oc });
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

  const existing = await prisma.oC.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "未找到或无权修改" }, { status: 404 });
  }

  const data = await req.json();
  const { tags, ...ocData } = data;

  // Update tags
  if (tags !== undefined) {
    await prisma.ocTag.deleteMany({ where: { ocId: id } });
    if (tags.length > 0) {
      await prisma.ocTag.createMany({
        data: tags.map((tagId: string) => ({
          ocId: id,
          tagId,
        })),
      });
    }
  }

  const oc = await prisma.oC.update({
    where: { id },
    data: ocData,
    include: {
      ocTags: { include: { tag: true } },
      world: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ oc });
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

  const existing = await prisma.oC.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "未找到或无权删除" }, { status: 404 });
  }

  await prisma.oC.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
