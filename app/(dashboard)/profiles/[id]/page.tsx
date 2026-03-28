import { notFound } from "next/navigation";
import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileEditor } from "@/components/profile/profile-editor";

export default async function ProfileEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOnboarded();

  // Own profile or OWNER accessing a company profile
  let profile = await db.profile.findFirst({
    where: { id, userId: user.id },
  });

  if (!profile && user.role === "OWNER" && user.companyId) {
    profile = await db.profile.findFirst({
      where: { id, user: { companyId: user.companyId } },
    });
  }

  if (!profile) notFound();

  const [cardCount, cardRequest, latestCard] = await Promise.all([
    db.card.count({ where: { profileId: profile.id } }),
    db.cardRequest.findUnique({
      where: { profileId: profile.id },
      select: {
        status: true,
        variant: { select: { frontSvg: true, backSvg: true } },
      },
    }),
    db.card.findFirst({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
      select: {
        material: {
          select: {
            variants: {
              take: 1,
              select: { frontSvg: true, backSvg: true },
            },
          },
        },
      },
    }),
  ]);

  // Use CardRequest variant SVGs (employee), or fall back to Card's material variant SVGs (owner/individual)
  const cardFrontSvg =
    cardRequest?.variant.frontSvg ??
    latestCard?.material?.variants[0]?.frontSvg ??
    undefined;
  const cardBackSvg =
    cardRequest?.variant.backSvg ??
    latestCard?.material?.variants[0]?.backSvg ??
    undefined;

  return (
    <ProfileEditor
      profile={{
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        title: profile.title,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl,
        isPublished: profile.isPublished,
        views: profile.views,
        taps: profile.taps,
        contactInfo: profile.contactInfo as Record<string, string> | null,
        socialLinks: profile.socialLinks as Array<{
          platform: string;
          url: string;
          label?: string;
        }> | null,
        hasCard: cardCount > 0,
        cardRequestStatus: cardRequest?.status ?? null,
        cardFrontSvg: cardFrontSvg,
        cardBackSvg: cardBackSvg,
        isSlugLocked: cardCount > 0 || (cardRequest?.status === "PENDING" || cardRequest?.status === "APPROVED" || cardRequest?.status === "ORDERED"),
      }}
      userName={user.name}
    />
  );
}
