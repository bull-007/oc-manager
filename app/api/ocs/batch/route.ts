import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { ids, action, categoryId } = await req.json();
  if (!ids?.length) return NextResponse.json({ error: "未选择OC" }, { status: 400 });

  // Verify all OCs belong to user
  const ocs = await prisma.oC.findMany({
    where: { id: { in: ids }, userId: session.user.id },
    select: { id: true },
  });
  if (ocs.length !== ids.length) return NextResponse.json({ error: "无权操作" }, { status: 403 });

  if (action === "move") {
    await prisma.oC.updateMany({
      where: { id: { in: ids } },
      data: { categoryId: categoryId || null },
    });
    return NextResponse.json({ success: true, message: "已移动" });
  }

  if (action === "delete") {
    await prisma.oC.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true, message: "已删除" });
  }

  return NextResponse.json({ error: "未知操作" }, { status: 400 });
}
