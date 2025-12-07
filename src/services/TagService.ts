import type { Tag } from '@/types/Campaign';
import { and, eq, ilike, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { campaignTags, tags } from '@/models/Schema';

export type CreateTagInput = {
  name: string;
  slug: string;
  type: 'category' | 'ai_model' | 'general';
};

export type UpdateTagInput = Partial<CreateTagInput>;

export type TagFilters = {
  type?: 'category' | 'ai_model' | 'general';
  search?: string;
  hasActiveCampaigns?: boolean; // Only show tags with active campaigns
};

/**
 * Get all tags with optional filters
 * Validates: Requirements 10.1, 10.3, 10.4
 */
export async function getTags(filters?: TagFilters): Promise<Tag[]> {
  const conditions = [];

  // Filter by type
  if (filters?.type) {
    conditions.push(eq(tags.type, filters.type));
  }

  // Search by name
  if (filters?.search) {
    conditions.push(ilike(tags.name, `%${filters.search}%`));
  }

  const query = db
    .select()
    .from(tags)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(tags.name);

  const result = await query;

  // If filtering by active campaigns, we need to check which tags have campaigns
  if (filters?.hasActiveCampaigns) {
    const tagsWithCampaigns = await db
      .selectDistinct({ tagId: campaignTags.tagId })
      .from(campaignTags);

    const tagIdsWithCampaigns = new Set(tagsWithCampaigns.map(t => t.tagId));

    return result.filter(tag => tagIdsWithCampaigns.has(tag.id)) as Tag[];
  }

  return result as Tag[];
}

/**
 * Get a single tag by ID
 * Validates: Requirements 10.1
 */
export async function getTagById(id: string): Promise<Tag | null> {
  const result = await db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .limit(1);

  return (result[0] as Tag) || null;
}

/**
 * Get a single tag by slug
 * Validates: Requirements 10.1, 10.3
 */
export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const result = await db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .limit(1);

  return (result[0] as Tag) || null;
}

/**
 * Create a new tag
 * Validates: Requirements 10.1, 10.2
 */
export async function createTag(input: CreateTagInput): Promise<Tag> {
  // Check if slug already exists
  const existing = await getTagBySlug(input.slug);
  if (existing) {
    throw new Error(`Tag with slug "${input.slug}" already exists`);
  }

  // Check if name already exists for the same type
  const nameExists = await db
    .select()
    .from(tags)
    .where(and(eq(tags.name, input.name), eq(tags.type, input.type)))
    .limit(1);

  if (nameExists.length > 0) {
    throw new Error(`Tag with name "${input.name}" and type "${input.type}" already exists`);
  }

  const result = await db
    .insert(tags)
    .values({
      name: input.name,
      slug: input.slug,
      type: input.type,
    })
    .returning();

  return result[0]! as Tag;
}

/**
 * Update an existing tag
 * Validates: Requirements 10.1, 10.2
 */
export async function updateTag(id: string, input: UpdateTagInput): Promise<Tag | null> {
  // Check if tag exists
  const existing = await getTagById(id);
  if (!existing) {
    return null;
  }

  // If slug is being updated, check for conflicts
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await getTagBySlug(input.slug);
    if (slugExists) {
      throw new Error(`Tag with slug "${input.slug}" already exists`);
    }
  }

  // If name is being updated, check for conflicts
  if (input.name && input.name !== existing.name) {
    const nameExists = await db
      .select()
      .from(tags)
      .where(
        and(
          eq(tags.name, input.name),
          eq(tags.type, input.type || existing.type),
        ),
      )
      .limit(1);

    if (nameExists.length > 0) {
      throw new Error(`Tag with name "${input.name}" already exists`);
    }
  }

  const result = await db
    .update(tags)
    .set(input)
    .where(eq(tags.id, id))
    .returning();

  return (result[0] as Tag) || null;
}

/**
 * Delete a tag
 * Note: This will fail if the tag is associated with any campaigns due to foreign key constraint
 * Validates: Requirements 10.1
 */
export async function deleteTag(id: string): Promise<boolean> {
  try {
    const result = await db.delete(tags).where(eq(tags.id, id)).returning();

    return result.length > 0;
  } catch (error) {
    // If deletion fails due to foreign key constraint, throw a more helpful error
    throw new Error('Cannot delete tag because it is associated with one or more campaigns');
  }
}

/**
 * Associate a tag with a campaign
 * Validates: Requirements 10.1
 */
export async function addTagToCampaign(campaignId: string, tagId: string): Promise<void> {
  // Check if association already exists
  const existing = await db
    .select()
    .from(campaignTags)
    .where(and(eq(campaignTags.campaignId, campaignId), eq(campaignTags.tagId, tagId)))
    .limit(1);

  if (existing.length > 0) {
    return; // Already associated, no need to add again
  }

  await db.insert(campaignTags).values({
    campaignId,
    tagId,
  });
}

/**
 * Remove a tag from a campaign
 * Validates: Requirements 10.1
 */
export async function removeTagFromCampaign(campaignId: string, tagId: string): Promise<boolean> {
  const result = await db
    .delete(campaignTags)
    .where(and(eq(campaignTags.campaignId, campaignId), eq(campaignTags.tagId, tagId)))
    .returning();

  return result.length > 0;
}

/**
 * Get all tags for a campaign
 * Validates: Requirements 10.1, 10.3
 */
export async function getCampaignTags(campaignId: string): Promise<Tag[]> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      type: tags.type,
      createdAt: tags.createdAt,
    })
    .from(campaignTags)
    .innerJoin(tags, eq(campaignTags.tagId, tags.id))
    .where(eq(campaignTags.campaignId, campaignId));

  return result as Tag[];
}

/**
 * Get tags with campaign counts
 * Validates: Requirements 10.4
 */
export async function getTagsWithCounts(filters?: TagFilters): Promise<
  Array<Tag & { campaignCount: number }>
> {
  const conditions = [];

  // Filter by type
  if (filters?.type) {
    conditions.push(eq(tags.type, filters.type));
  }

  // Search by name
  if (filters?.search) {
    conditions.push(ilike(tags.name, `%${filters.search}%`));
  }

  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      type: tags.type,
      createdAt: tags.createdAt,
      campaignCount: sql<number>`cast(count(${campaignTags.id}) as int)`,
    })
    .from(tags)
    .leftJoin(campaignTags, eq(tags.id, campaignTags.tagId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(tags.id)
    .orderBy(tags.name);

  return result as Array<Tag & { campaignCount: number }>;
}

/**
 * Get autocomplete suggestions for tags
 * Validates: Requirements 10.2
 */
export async function getTagSuggestions(
  query: string,
  type?: 'category' | 'ai_model' | 'general',
  limit: number = 10,
): Promise<Tag[]> {
  const conditions = [ilike(tags.name, `%${query}%`)];

  if (type) {
    conditions.push(eq(tags.type, type));
  }

  const result = await db
    .select()
    .from(tags)
    .where(and(...conditions))
    .orderBy(tags.name)
    .limit(limit);

  return result as Tag[];
}
