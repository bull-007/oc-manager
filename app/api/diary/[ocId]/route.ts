import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: get all answered diary entries for an OC
export async function GET(
  req: Request,
  { params }: { params: Promise<{ ocId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { ocId } = await params;

  const diaries = await prisma.qADiary.findMany({
    where: { ocId, answered: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ diaries });
}
