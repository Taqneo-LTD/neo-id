import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { ProfilePublic } from "@/components/profile/profile-public";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await db.profile.findUnique({
    where: { slug },
    include: { user: true },
  });

  if (!profile || !profile.isPublished) {
    return { title: "Profile Not Found | NEO ID" };
  }

  const fullName = profile.name || profile.user.name;
  const occupation = profile.title;
  const displayTitle = occupation
    ? `${fullName} | ${occupation}`
    : fullName;

  return {
    title: `${displayTitle} | NEO ID`,
    description: profile.bio || `${fullName}'s digital business card on NEO ID`,
    openGraph: {
      title: `${displayTitle} | NEO ID`,
      description: profile.bio || `${fullName}'s digital business card`,
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;

  const profile = await db.profile.findUnique({
    where: { slug },
    include: { user: { include: { company: true } } },
  });

  if (!profile || !profile.isPublished) notFound();

  // Increment view counter (non-blocking)
  db.profile
    .update({
      where: { id: profile.id },
      data: { views: { increment: 1 } },
    })
    .catch(() => {});

  return (
    <ProfilePublic
      profile={{
        slug: profile.slug,
        title: profile.title,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl || profile.user.avatarUrl,
        name: profile.name || profile.user.name,
        companyName: profile.user.company?.nameEn,
        companyLogo: profile.user.company?.logo,
        contactInfo: profile.contactInfo as Record<string, string> | null,
        socialLinks: profile.socialLinks as Array<{
          platform: string;
          url: string;
          label?: string;
        }> | null,
      }}
    />
  );
}
