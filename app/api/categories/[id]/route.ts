import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;
  const { name } = await req.json();

  const category = await prisma.category.update({
    where: { id, userId: session.user.id },
    data: { name },
    include: { _count: { select: { ocs: true } } },
  });
  return NextResponse.json({ category });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { id } = await params;

  // Unlink OCs first
  await prisma.oC.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id, userId: session.user.id } });

  return NextResponse.json({ success: true });
}
