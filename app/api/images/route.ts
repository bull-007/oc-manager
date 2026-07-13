import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "OC-Manager/1.0" },
    });

    if (!response.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "image/png");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(blob, { headers });
  } catch {
    return new NextResponse("Failed to load image", { status: 500 });
  }
}
