"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ensureUser } from "@/lib/auth";
import { createProfileSchema, updateProfileSchema } from "@/lib/validators/profile";
import { checkProfileLimit } from "@/lib/plan-limits";

/**
 * Find a profile that the user has access to.
 * - Own profile: always accessible
 * - OWNER: can access any profile within their company
 */
async function findAccessibleProfile(
  user: { id: string; role: string; companyId: string | null },
  profileId: string,
) {
  // First check own profile
  const ownProfile = await db.profile.findFirst({
    where: { id: profileId, userId: user.id },
  });
  if (ownProfile) return ownProfile;

  // OWNER can access any company profile
  if (user.role === "OWNER" && user.companyId) {
    return db.profile.findFirst({
      where: {
        id: profileId,
        user: { companyId: user.companyId },
      },
    });
  }

  return null;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (await db.profile.findUnique({ where: { slug } })) {
    i++;
    slug = `${base}-${i}`;
  }
  return slug;
}

export async function createProfile(formData: FormData) {
  const user = await ensureUser();

  // OWNER can create profiles for employees
  const forUserId = (formData.get("forUserId") as string) || null;
  let targetUserId = user.id;
  let targetUserName = user.name;

  if (forUserId) {
    // Verify caller is OWNER of the same company
    if (user.role !== "OWNER" || !user.companyId) {
      throw new Error("Only company owners can create profiles for employees");
    }
    const targetUser = await db.user.findFirst({
      where: { id: forUserId, companyId: user.companyId },
    });
    if (!targetUser) {
      throw new Error("Employee not found in your company");
    }
    targetUserId = targetUser.id;
    targetUserName = targetUser.name;
  }

  // Enforce NEO ID creation limit based on plan
  const limit = await checkProfileLimit(user.id);
  if (!limit.allowed) {
    const msg =
      limit.limit === 1
        ? "You've reached your NEO ID limit (1). Upgrade your plan to create more."
        : `You've reached your NEO ID limit (${limit.limit}). Upgrade your plan to create more.`;
    throw new Error(msg);
  }

  const raw = {
    slug: formData.get("slug") as string,
    name: (formData.get("name") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    bio: (formData.get("bio") as string) || undefined,
  };

  // Auto-generate slug from name, title, or user name if empty
  if (!raw.slug || raw.slug.trim() === "") {
    const base = generateSlug(raw.name || raw.title || targetUserName);
    raw.slug = await uniqueSlug(base);
  }

  const parsed = createProfileSchema.parse(raw);

  const profile = await db.profile.create({
    data: {
      slug: parsed.slug,
      name: parsed.name || targetUserName,
      title: parsed.title,
      bio: parsed.bio,
      userId: targetUserId,
    },
  });

  redirect(`/profiles/${profile.id}`);
}

export async function updateProfile(profileId: string, formData: FormData) {
  const user = await ensureUser();

  const profile = await findAccessibleProfile(user, profileId);
  if (!profile) throw new Error("Profile not found");

  const raw: Record<string, unknown> = {};
  const name = formData.get("name") as string | null;
  const title = formData.get("title") as string | null;
  const bio = formData.get("bio") as string | null;
  const slug = formData.get("slug") as string | null;
  const contactInfoRaw = formData.get("contactInfo") as string | null;
  const socialLinksRaw = formData.get("socialLinks") as string | null;

  if (name !== null) raw.name = name || undefined;
  if (title !== null) raw.title = title || undefined;
  if (bio !== null) raw.bio = bio || undefined;
  if (slug !== null && slug !== profile.slug) {
    // Block slug changes if a card or active request exists
    const [cardCount, cardRequest] = await Promise.all([
      db.card.count({ where: { profileId } }),
      db.cardRequest.findUnique({
        where: { profileId },
        select: { status: true },
      }),
    ]);
    const isLocked =
      cardCount > 0 ||
      cardRequest?.status === "PENDING" ||
      cardRequest?.status === "APPROVED" ||
      cardRequest?.status === "ORDERED";
    if (isLocked) {
      throw new Error("Profile URL cannot be changed after a card order or request");
    }
    raw.slug = slug;
  }
  if (contactInfoRaw) raw.contactInfo = JSON.parse(contactInfoRaw);
  if (socialLinksRaw) raw.socialLinks = JSON.parse(socialLinksRaw);

  const parsed = updateProfileSchema.parse(raw);

  await db.profile.update({
    where: { id: profileId },
    data: parsed,
  });

  revalidatePath(`/profiles/${profileId}`);
  revalidatePath("/profiles");
}

export async function updateAvatar(profileId: string, avatarUrl: string) {
  const user = await ensureUser();

  const profile = await findAccessibleProfile(user, profileId);
  if (!profile) throw new Error("Profile not found");

  await db.profile.update({
    where: { id: profileId },
    data: { avatarUrl },
  });

  revalidatePath(`/profiles/${profileId}`);
}

export async function togglePublish(profileId: string) {
  const user = await ensureUser();

  const profile = await findAccessibleProfile(user, profileId);
  if (!profile) throw new Error("Profile not found");

  await db.profile.update({
    where: { id: profileId },
    data: { isPublished: !profile.isPublished },
  });

  revalidatePath(`/profiles/${profileId}`);
  revalidatePath("/profiles");
}

export async function checkSlugAvailability(
  slug: string,
  currentProfileId?: string,
): Promise<{
  available: boolean;
  suggestions: string[];
}> {
  const existing = await db.profile.findUnique({
    where: { slug },
    select: { id: true },
  });

  const available = !existing || existing.id === currentProfileId;

  if (available) return { available: true, suggestions: [] };

  // Generate 2 suggestions
  const suggestions: string[] = [];
  for (let i = 1; suggestions.length < 2; i++) {
    const candidate = `${slug}-${i}`;
    const taken = await db.profile.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) suggestions.push(candidate);
  }

  return { available: false, suggestions };
}

export async function deleteProfile(profileId: string) {
  const user = await ensureUser();

  const profile = await findAccessibleProfile(user, profileId);
  if (!profile) throw new Error("Profile not found");

  await db.profile.delete({ where: { id: profileId } });

  revalidatePath("/profiles");
  redirect("/profiles");
}

/**
 * Employee claims a reserved (placeholder) profile as their own.
 * Transfers ownership and clears the placeholder flag.
 */
export async function claimReservedProfile(profileId: string) {
  const user = await ensureUser();

  if (user.accountType !== "COMPANY" || !user.companyId) {
    throw new Error("Not a company member");
  }

  // Employee must not already have a non-placeholder profile
  const existing = await db.profile.findFirst({
    where: { userId: user.id, isPlaceholder: false },
  });
  if (existing) {
    throw new Error("You already have a NEO ID");
  }

  // Profile must be a placeholder within the same company
  const profile = await db.profile.findFirst({
    where: {
      id: profileId,
      isPlaceholder: true,
      user: { companyId: user.companyId },
    },
  });
  if (!profile) {
    throw new Error("Reserved NEO ID not found");
  }

  await db.profile.update({
    where: { id: profileId },
    data: { userId: user.id, isPlaceholder: false },
  });

  revalidatePath("/profiles");
  redirect(`/profiles/${profileId}`);
}
