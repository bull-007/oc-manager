import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ocId = searchParams.get("ocId");

  const inspirations = await prisma.inspiration.findMany({
    where: {
      userId: session.user.id,
      ...(ocId ? { relatedOcId: ocId } : {}),
    },
    include: {
      relatedOc: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ inspirations });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const data = await req.json();

  const inspiration = await prisma.inspiration.create({
    data: {
      content: data.content,
      tags: JSON.stringify(data.tags || []),
      relatedOcId: data.relatedOcId || null,
      userId: session.user.id,
    },
    include: {
      relatedOc: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ inspiration }, { status: 201 });
}
