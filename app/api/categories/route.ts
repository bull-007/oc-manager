import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { ocs: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "名称不能为空" }, { status: 400 });

  const existing = await prisma.category.findFirst({
    where: { name: name.trim(), userId: session.user.id },
  });
  if (existing) return NextResponse.json({ error: "分类已存在" }, { status: 400 });

  const category = await prisma.category.create({
    data: { name: name.trim(), userId: session.user.id },
    include: { _count: { select: { ocs: true } } },
  });

  return NextResponse.json({ category }, { status: 201 });
}
