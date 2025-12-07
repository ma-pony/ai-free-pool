import type { CreatePlatformInput, Platform, PlatformListFilters, UpdatePlatformInput } from '@/types/Platform';
import { and, eq, ilike, or } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { platforms } from '@/models/Schema';

/**
 * Get all platforms with optional filters
 * Validates: Requirements 1.3, 19.2 (database optimization)
 *
 * Performance Optimizations:
 * - Leverages database indexes on status and slug
 * - Uses efficient WHERE clauses for filtering
 * - Orders results by name for consistent display
 */
export async function getPlatforms(filters?: PlatformListFilters): Promise<Platform[]> {
  const conditions = [];

  // Filter by status if specified
  if (filters?.status) {
    conditions.push(eq(platforms.status, filters.status));
  }
  // Note: If no status filter is provided, return all platforms regardless of status

  // Search by name or description
  if (filters?.search) {
    conditions.push(
      or(
        ilike(platforms.name, `%${filters.search}%`),
        ilike(platforms.description, `%${filters.search}%`),
      ),
    );
  }

  const result = await db
    .select()
    .from(platforms)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(platforms.name);

  return result as Platform[];
}

/**
 * Get a single platform by ID
 * Validates: Requirements 1.4
 */
export async function getPlatformById(id: string): Promise<Platform | null> {
  const result = await db
    .select()
    .from(platforms)
    .where(eq(platforms.id, id))
    .limit(1);

  return (result[0] as Platform) || null;
}

/**
 * Get a single platform by slug
 * Validates: Requirements 1.4
 */
export async function getPlatformBySlug(slug: string): Promise<Platform | null> {
  const result = await db
    .select()
    .from(platforms)
    .where(eq(platforms.slug, slug))
    .limit(1);

  return (result[0] as Platform) || null;
}

/**
 * Create a new platform
 * Validates: Requirements 1.1
 */
export async function createPlatform(input: CreatePlatformInput): Promise<Platform> {
  // Check if slug already exists
  const existing = await getPlatformBySlug(input.slug);
  if (existing) {
    throw new Error(`Platform with slug "${input.slug}" already exists`);
  }

  const result = await db
    .insert(platforms)
    .values({
      name: input.name,
      slug: input.slug,
      logo: input.logo || null,
      website: input.website || null,
      description: input.description || null,
      socialLinks: input.socialLinks || null,
      status: input.status || 'active',
    })
    .returning();

  return result[0]! as Platform;
}

/**
 * Update an existing platform
 * Validates: Requirements 1.5
 */
export async function updatePlatform(
  id: string,
  input: UpdatePlatformInput,
): Promise<Platform | null> {
  // Check if platform exists
  const existing = await getPlatformById(id);
  if (!existing) {
    return null;
  }

  // If slug is being updated, check for conflicts
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await getPlatformBySlug(input.slug);
    if (slugExists) {
      throw new Error(`Platform with slug "${input.slug}" already exists`);
    }
  }

  const result = await db
    .update(platforms)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(platforms.id, id))
    .returning();

  return (result[0] as Platform) || null;
}

/**
 * Delete a platform (soft delete by setting status to inactive)
 * Validates: Requirements 1.1
 */
export async function deletePlatform(id: string): Promise<boolean> {
  const result = await db
    .update(platforms)
    .set({
      status: 'inactive',
      updatedAt: new Date(),
    })
    .where(eq(platforms.id, id))
    .returning();

  return result.length > 0;
}

/**
 * Get platform statistics
 * Validates: Requirements 1.4
 */
export async function getPlatformStats(platformId: string) {
  const platform = await getPlatformById(platformId);

  if (!platform) {
    return null;
  }

  // Import campaign service to get counts
  const { getCampaigns } = await import('./CampaignService');

  // Get active campaigns count
  const activeCampaigns = await getCampaigns({
    platformId,
    status: 'published',
    includeExpired: false,
  });

  // Get total campaigns count (including expired)
  const allCampaigns = await getCampaigns({
    platformId,
    status: 'published',
    includeExpired: true,
  });

  return {
    platform,
    activeCampaigns: activeCampaigns.length,
    totalCampaigns: allCampaigns.length,
    totalReactions: 0, // This will be calculated when reaction stats are available
  };
}
