import { NextResponse } from "next/server";
import { ensureUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const user = await ensureUser();
    const body = await req.json();
    const { accountType } = body;

    if (accountType === "COMPANY") {
      const { companyName, crNumber } = body;
      if (!companyName?.trim()) {
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 }
        );
      }

      // Create company without a plan — company must subscribe before using the platform
      const company = await db.company.create({
        data: {
          nameEn: companyName.trim(),
          crNumber: crNumber?.trim() || null,
        },
      });

      await db.user.update({
        where: { id: user.id },
        data: {
          accountType: "COMPANY",
          role: "OWNER",
          companyId: company.id,
          onboarded: true,
        },
      });
    } else if (accountType === "INDIVIDUAL") {
      const { displayName } = body;
      if (!displayName?.trim()) {
        return NextResponse.json(
          { error: "Display name is required" },
          { status: 400 }
        );
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          name: displayName.trim(),
          accountType: "INDIVIDUAL",
          onboarded: true,
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid account type" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
