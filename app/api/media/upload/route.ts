import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveFile } from "@/lib/upload";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "请选择文件" }, { status: 400 });
    }

    const url = await saveFile(file);

    // Create media record
    const media = await prisma.media.create({
      data: {
        url,
        type: "image",
        category: "gallery",
      },
    });

    return NextResponse.json({ url, media }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
