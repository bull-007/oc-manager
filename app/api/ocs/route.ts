import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const species = searchParams.get("species") || "";
  const occupation = searchParams.get("occupation") || "";
  const tag = searchParams.get("tag") || "";
  const worldId = searchParams.get("worldId") || "";

  const where: any = {
    userId: session.user.id,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { species: { contains: search } },
      { occupation: { contains: search } },
      { nationality: { contains: search } },
    ];
  }

  if (species) where.species = species;
  if (occupation) where.occupation = occupation;
  if (worldId) where.worldId = worldId;

  if (tag) {
    where.ocTags = {
      some: {
        tag: {
          name: tag,
        },
      },
    };
  }

  const ocs = await prisma.oC.findMany({
    where,
    include: {
      media: { take: 1, where: { category: "avatar" } },
      ocTags: { include: { tag: true } },
      world: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ ocs });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const data = await req.json();
  const { tags, ...ocData } = data;

  const oc = await prisma.oC.create({
    data: {
      ...ocData,
      userId: session.user.id,
      ocTags: tags?.length
        ? {
            create: tags.map((tagId: string) => ({
              tagId,
            })),
          }
        : undefined,
    },
    include: {
      ocTags: { include: { tag: true } },
    },
  });

  return NextResponse.json({ oc }, { status: 201 });
}
