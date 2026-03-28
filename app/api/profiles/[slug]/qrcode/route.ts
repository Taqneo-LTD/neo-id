import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateQRCodeSvg, generateQRCodePng } from "@/lib/qrcode";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const profile = await db.profile.findUnique({
    where: { slug },
    select: { id: true, isPublished: true, slug: true },
  });

  if (!profile || !profile.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const format = req.nextUrl.searchParams.get("format") || "svg";
  const size = parseInt(req.nextUrl.searchParams.get("size") || "400", 10);

  if (format === "png") {
    const png = await generateQRCodePng(profile.slug, Math.min(size, 1000));
    return new NextResponse(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const svg = await generateQRCodeSvg(profile.slug);
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
