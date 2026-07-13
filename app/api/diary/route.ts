import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDailyQuestion, getTodayDate } from "@/lib/questions";

export const dynamic = "force-dynamic";

// GET: get today's question for an OC (or all today's questions for dashboard)
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const ocId = searchParams.get("ocId");
  const all = searchParams.get("all") === "true";

  if (all) {
    // Dashboard: get today's questions for all OCs
    const today = getTodayDate();
    const ocs = await prisma.oC.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
    });

    const diaries = await prisma.qADiary.findMany({
      where: { date: today, ocId: { in: ocs.map((oc) => oc.id) } },
    });

    // For OCs without today's diary, generate questions
    const questions = ocs.map((oc) => {
      const existing = diaries.find((d) => d.ocId === oc.id);
      if (existing) {
        return { ocId: oc.id, ocName: oc.name, question: existing.question, answered: existing.answered, diaryId: existing.id, answer: existing.answer };
      }
      return { ocId: oc.id, ocName: oc.name, question: getDailyQuestion(oc.id), answered: false, diaryId: null, answer: null };
    });

    return NextResponse.json({ questions });
  }

  if (ocId) {
    const today = getTodayDate();
    let diary = await prisma.qADiary.findUnique({
      where: { ocId_date: { ocId, date: today } },
    });

    if (!diary) {
      const question = getDailyQuestion(ocId);
      diary = await prisma.qADiary.create({
        data: { ocId, question, date: today, answered: false },
      });
    }

    return NextResponse.json({ diary });
  }

  return NextResponse.json({ error: "缺少 ocId" }, { status: 400 });
}

// POST: answer today's question
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { ocId, answer } = await req.json();
  const today = getTodayDate();

  let diary = await prisma.qADiary.findUnique({
    where: { ocId_date: { ocId, date: today } },
  });

  if (!diary) {
    const question = getDailyQuestion(ocId);
    diary = await prisma.qADiary.create({
      data: { ocId, question, date: today, answer, answered: true },
    });
  } else {
    diary = await prisma.qADiary.update({
      where: { id: diary.id },
      data: { answer, answered: true },
    });
  }

  return NextResponse.json({ diary });
}
