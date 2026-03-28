import { requireOnboarded } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkProfileLimit } from "@/lib/plan-limits";
import Link from "next/link";
import { Eye, Globe, GlobeLock, ExternalLink } from "lucide-react";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlanBadge } from "@/components/shared/plan-badge";
import { CreateNeoIdCard, NeoIdLimitCard, ClaimReservedCard } from "@/components/shared/neo-id-cards";
import { PageHeader } from "@/components/shared/page-header";

export default async function ProfilesPage() {
  const user = await requireOnboarded();
  const limit = await checkProfileLimit(user.id);

  const isCompany = user.accountType === "COMPANY" && !!user.companyId;
  const isOwner = user.role === "OWNER";
  const isAdmin = user.role === "ADMIN";
  const isMember = user.role === "MEMBER";

  // Fetch current user's non-placeholder profiles
  const myProfiles = await db.profile.findMany({
    where: { userId: user.id, isPlaceholder: false },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  });

  // OWNER/ADMIN: fetch team profiles + reserved (placeholder) profiles
  let teamProfiles: typeof myProfiles = [];
  let reservedProfiles: typeof myProfiles = [];

  if (isCompany && (isOwner || isAdmin)) {
    const [team, reserved] = await Promise.all([
      db.profile.findMany({
        where: {
          user: { companyId: user.companyId },
          userId: { not: user.id },
          isPlaceholder: false,
        },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      db.profile.findMany({
        where: {
          isPlaceholder: true,
          user: { companyId: user.companyId },
          OR: [
            // Empty seat placeholders held by the current owner/admin
            { userId: user.id },
            // Member-specific placeholders: only if the member has NOT
            // yet received a non-placeholder profile (claimed or created)
            {
              userId: { not: user.id },
              user: {
                profiles: {
                  none: { isPlaceholder: false },
                },
              },
            },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
    ]);

    teamProfiles = team;
    reservedProfiles = reserved;
  }

  // MEMBER with no profiles: fetch available reserved cards they can claim
  let claimableProfiles: { id: string; slug: string; name: string | null }[] = [];
  if (isCompany && isMember && myProfiles.length === 0 && user.companyId) {
    claimableProfiles = await db.profile.findMany({
      where: {
        isPlaceholder: true,
        user: { companyId: user.companyId },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, slug: true, name: true },
    });
  }

  const canCreate = limit.allowed;
  const limitLabel =
    limit.limit === 0
      ? `${limit.current} NEO IDs`
      : `${limit.current}/${limit.limit} NEO IDs`;

  return (
    <div className="space-y-8">
      <PageHeader title="Profiles" description="Manage your digital business cards">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {limitLabel}
          </Badge>
          <PlanBadge planName={limit.planName} />
        </div>
      </PageHeader>

      {/* Your NEO IDs */}
      <section className="space-y-4">
        {isCompany && (isOwner || isAdmin) && (
          <h2 className="text-lg font-semibold">Your NEO IDs</h2>
        )}

        {myProfiles.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Employee: show "Create" only if company has open NEO ID slots AND no reserved cards to claim */}
            {isCompany && isMember ? (
              claimableProfiles.length === 0 && canCreate && (
                <CreateNeoIdCard
                  label="Create your first NEO ID"
                  sublabel="Get started with your digital business card"
                />
              )
            ) : (
              <CreateNeoIdCard
                label="Create your first NEO ID"
                sublabel="Get started with your digital business card"
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} canEdit />
            ))}

            {/* Individual users only: show create/limit card */}
            {!isCompany && (
              canCreate ? (
                <CreateNeoIdCard label="Create a NEO ID" sublabel="Add a new digital business card" />
              ) : (
                <NeoIdLimitCard />
              )
            )}
          </div>
        )}
      </section>

      {/* Employee: Available reserved cards to claim */}
      {isCompany && isMember && myProfiles.length === 0 && claimableProfiles.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Available Reserved Cards</h2>
            <p className="text-sm text-muted-foreground">
              Your admin has pre-ordered these cards. Choose one to claim as your NEO ID.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {claimableProfiles.map((profile) => (
              <ClaimReservedCard
                key={profile.id}
                profileId={profile.id}
                slug={profile.slug}
              />
            ))}
          </div>
        </section>
      )}

      {/* Team NEO IDs */}
      {isCompany && (isOwner || isAdmin) && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Team NEO IDs</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teamProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                canEdit={isOwner}
                showOwnerName
              />
            ))}

            {isOwner && myProfiles.length > 0 && (
              canCreate ? (
                <CreateNeoIdCard label="Create an Employee NEO ID" sublabel="Add a NEO ID for a team member" />
              ) : (
                <NeoIdLimitCard />
              )
            )}
          </div>
        </section>
      )}

      {/* Reserved Cards */}
      {isCompany && (isOwner || isAdmin) && reservedProfiles.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Reserved Cards</h2>
            <p className="text-sm text-muted-foreground">
              Pre-ordered cards not yet assigned to a team member
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reservedProfiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                canEdit={isOwner}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProfileCard({
  profile,
  canEdit,
  showOwnerName,
}: {
  profile: {
    id: string;
    slug: string;
    name: string | null;
    title: string | null;
    bio: string | null;
    isPublished: boolean;
    views: number;
    user: { name: string };
  };
  canEdit?: boolean;
  showOwnerName?: boolean;
}) {
  const href = canEdit ? `/profiles/${profile.id}` : `/p/${profile.slug}`;

  return (
    <Link key={profile.id} href={href} className="flex">
      <Card className="flex w-full flex-col transition-colors hover:border-neo-teal/50">
        <CardHeader>
          <div>
            <CardTitle className="truncate text-base">
              {profile.name || profile.title || profile.slug}
            </CardTitle>
            {showOwnerName && (
              <p className="truncate text-xs text-muted-foreground">
                {profile.user.name}
              </p>
            )}
          </div>
          <CardDescription className="truncate">
            neo-id.com/p/{profile.slug}
          </CardDescription>
          <CardAction>
            <div className="flex items-center gap-1.5">
              {!canEdit && (
                <ExternalLink className="size-3 text-muted-foreground" />
              )}
              <Badge
                variant={profile.isPublished ? "default" : "secondary"}
                className="text-[11px]"
              >
                {profile.isPublished ? (
                  <Globe className="mr-1 size-3" />
                ) : (
                  <GlobeLock className="mr-1 size-3" />
                )}
                {profile.isPublished ? "Live" : "Draft"}
              </Badge>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {profile.bio || "No bio added yet"}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3" />
            {profile.views} views
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

