import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { InviteAcceptCard } from "@/components/shared/invite-accept-card";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await db.invite.findUnique({
    where: { token },
    include: {
      company: { select: { nameEn: true, logo: true } },
      createdBy: { select: { name: true } },
    },
  });

  if (!invite) notFound();

  const expired = new Date() > invite.expiresAt;
  const used = !!invite.usedAt;

  const { authenticated } = await getSession();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <InviteAcceptCard
        token={token}
        companyName={invite.company.nameEn}
        companyLogo={invite.company.logo}
        invitedBy={invite.createdBy.name}
        expired={expired}
        used={used}
        authenticated={!!authenticated}
      />
    </div>
  );
}
