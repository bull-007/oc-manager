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
      media: { take: 1, orderBy: { createdAt: "asc" } },
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
  const { tags, imageUrls, ...ocData } = data;

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

  // Associate uploaded images with this OC
  if (imageUrls?.length) {
    // Link existing unlinked media records
    await prisma.media.updateMany({
      where: { url: { in: imageUrls }, ocId: null },
      data: { ocId: oc.id },
    });
    // Create new media records for any URLs not already in the database
    const existingUrls = (
      await prisma.media.findMany({
        where: { ocId: oc.id },
        select: { url: true },
      })
    ).map((m) => m.url);
    const newUrls = imageUrls.filter((u: string) => !existingUrls.includes(u));
    if (newUrls.length) {
      await prisma.media.createMany({
        data: newUrls.map((url: string, i: number) => ({
          url,
          type: "image",
          category: "gallery",
          ocId: oc.id,
        })),
      });
    }
  }

  return NextResponse.json({ oc }, { status: 201 });
}
