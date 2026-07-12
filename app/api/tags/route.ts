import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const tags = await prisma.tag.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { ocTags: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ tags });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const data = await req.json();

  const existing = await prisma.tag.findFirst({
    where: { name: data.name, userId: session.user.id },
  });

  if (existing) {
    return NextResponse.json({ tag: existing });
  }

  const tag = await prisma.tag.create({
    data: {
      name: data.name,
      color: data.color || "#D4844A",
      userId: session.user.id,
    },
  });

  return NextResponse.json({ tag }, { status: 201 });
}
