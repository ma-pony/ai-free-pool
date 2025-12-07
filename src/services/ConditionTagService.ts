import type {
  ConditionTag,
  ConditionTagFilters,
  CreateConditionTagInput,
  UpdateConditionTagInput,
} from '@/types/Campaign';
import { and, eq, ilike } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { campaignConditionTags, conditionTags } from '@/models/Schema';

/**
 * Get all condition tags with optional filters
 * Validates: Requirements 2.7, 2.12
 */
export async function getConditionTags(filters?: ConditionTagFilters): Promise<ConditionTag[]> {
  const conditions = [];

  // Filter by type
  if (filters?.type) {
    conditions.push(eq(conditionTags.type, filters.type));
  }

  // Search by name
  if (filters?.search) {
    conditions.push(ilike(conditionTags.name, `%${filters.search}%`));
  }

  const result = await db
    .select()
    .from(conditionTags)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(conditionTags.name);

  return result as ConditionTag[];
}

/**
 * Get a single condition tag by ID
 * Validates: Requirements 2.7
 */
export async function getConditionTagById(id: string): Promise<ConditionTag | null> {
  const result = await db
    .select()
    .from(conditionTags)
    .where(eq(conditionTags.id, id))
    .limit(1);

  return (result[0] as ConditionTag) || null;
}

/**
 * Get a single condition tag by slug
 * Validates: Requirements 2.7
 */
export async function getConditionTagBySlug(slug: string): Promise<ConditionTag | null> {
  const result = await db
    .select()
    .from(conditionTags)
    .where(eq(conditionTags.slug, slug))
    .limit(1);

  return (result[0] as ConditionTag) || null;
}

/**
 * Create a new condition tag
 * Validates: Requirements 2.7
 */
export async function createConditionTag(input: CreateConditionTagInput): Promise<ConditionTag> {
  // Check if slug already exists
  const existing = await getConditionTagBySlug(input.slug);
  if (existing) {
    throw new Error(`Condition tag with slug "${input.slug}" already exists`);
  }

  // Check if name already exists
  const nameExists = await db
    .select()
    .from(conditionTags)
    .where(eq(conditionTags.name, input.name))
    .limit(1);

  if (nameExists.length > 0) {
    throw new Error(`Condition tag with name "${input.name}" already exists`);
  }

  const result = await db
    .insert(conditionTags)
    .values({
      name: input.name,
      slug: input.slug,
      type: input.type,
      difficultyWeight: input.difficultyWeight || 0,
    })
    .returning();

  return result[0]! as ConditionTag;
}

/**
 * Update an existing condition tag
 * Validates: Requirements 2.7
 */
export async function updateConditionTag(
  id: string,
  input: UpdateConditionTagInput,
): Promise<ConditionTag | null> {
  // Check if tag exists
  const existing = await getConditionTagById(id);
  if (!existing) {
    return null;
  }

  // If slug is being updated, check for conflicts
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await getConditionTagBySlug(input.slug);
    if (slugExists) {
      throw new Error(`Condition tag with slug "${input.slug}" already exists`);
    }
  }

  // If name is being updated, check for conflicts
  if (input.name && input.name !== existing.name) {
    const nameExists = await db
      .select()
      .from(conditionTags)
      .where(eq(conditionTags.name, input.name))
      .limit(1);

    if (nameExists.length > 0) {
      throw new Error(`Condition tag with name "${input.name}" already exists`);
    }
  }

  const result = await db
    .update(conditionTags)
    .set(input)
    .where(eq(conditionTags.id, id))
    .returning();

  return (result[0] as ConditionTag) || null;
}

/**
 * Delete a condition tag
 * Note: This will fail if the tag is associated with any campaigns due to foreign key constraint
 * Validates: Requirements 2.7
 */
export async function deleteConditionTag(id: string): Promise<boolean> {
  try {
    const result = await db.delete(conditionTags).where(eq(conditionTags.id, id)).returning();

    return result.length > 0;
  } catch (error) {
    // If deletion fails due to foreign key constraint, throw a more helpful error
    throw new Error(
      'Cannot delete condition tag because it is associated with one or more campaigns',
    );
  }
}

/**
 * Associate a condition tag with a campaign
 * Validates: Requirements 2.7
 */
export async function addConditionTagToCampaign(
  campaignId: string,
  tagId: string,
): Promise<void> {
  // Check if association already exists
  const existing = await db
    .select()
    .from(campaignConditionTags)
    .where(
      and(
        eq(campaignConditionTags.campaignId, campaignId),
        eq(campaignConditionTags.tagId, tagId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return; // Already associated, no need to add again
  }

  await db.insert(campaignConditionTags).values({
    campaignId,
    tagId,
  });
}

/**
 * Remove a condition tag from a campaign
 * Validates: Requirements 2.7
 */
export async function removeConditionTagFromCampaign(
  campaignId: string,
  tagId: string,
): Promise<boolean> {
  const result = await db
    .delete(campaignConditionTags)
    .where(
      and(
        eq(campaignConditionTags.campaignId, campaignId),
        eq(campaignConditionTags.tagId, tagId),
      ),
    )
    .returning();

  return result.length > 0;
}

/**
 * Get all condition tags for a campaign
 * Validates: Requirements 2.7, 2.11
 */
export async function getCampaignConditionTags(campaignId: string): Promise<ConditionTag[]> {
  const result = await db
    .select({
      id: conditionTags.id,
      name: conditionTags.name,
      slug: conditionTags.slug,
      type: conditionTags.type,
      difficultyWeight: conditionTags.difficultyWeight,
      createdAt: conditionTags.createdAt,
    })
    .from(campaignConditionTags)
    .innerJoin(conditionTags, eq(campaignConditionTags.tagId, conditionTags.id))
    .where(eq(campaignConditionTags.campaignId, campaignId));

  return result as ConditionTag[];
}
