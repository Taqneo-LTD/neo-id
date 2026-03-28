import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function escapeVCard(str: string): string {
  return str.replace(/[\\;,\n]/g, (m) => {
    if (m === "\n") return "\\n";
    return `\\${m}`;
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const profile = await db.profile.findUnique({
    where: { slug },
    include: { user: { include: { company: true } } },
  });

  if (!profile || !profile.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contact = profile.contactInfo as Record<string, string> | null;
  const name = profile.name || profile.user.name;
  const parts = name.split(" ");
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(name)}`,
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
  ];

  if (profile.title) {
    lines.push(`TITLE:${escapeVCard(profile.title)}`);
  }

  if (profile.user.company?.nameEn) {
    lines.push(`ORG:${escapeVCard(profile.user.company.nameEn)}`);
  }

  if (contact?.email) {
    lines.push(`EMAIL;TYPE=WORK:${contact.email}`);
  }

  if (contact?.phone) {
    lines.push(`TEL;TYPE=CELL:${contact.phone}`);
  }

  if (contact?.website) {
    lines.push(`URL:${contact.website}`);
  }

  if (contact?.address) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(contact.address)};;;;`);
  }

  lines.push(`URL;TYPE=PROFILE:https://neo-id.com/p/${profile.slug}`);

  if (profile.bio) {
    lines.push(`NOTE:${escapeVCard(profile.bio)}`);
  }

  lines.push("END:VCARD");

  const vcard = lines.join("\r\n");
  const filename = `${slug}.vcf`;

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
