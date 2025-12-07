import type { SupportedLanguage } from './TranslationService';
import type {
  Campaign,
  CampaignListFilters,
  CreateCampaignInput,
  UpdateCampaignInput,
} from '@/types/Campaign';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '@/libs/DB';
import {
  campaignConditionTags,
  campaigns,
  campaignTags,
  campaignTranslations,
  conditionTags,
  platforms,
  tags,
} from '@/models/Schema';
import {
  detectLanguage,

  translateCampaignContent,
} from './TranslationService';

/**
 * Get all campaigns with optional filters
 * Validates: Requirements 2.1-2.6, 2.4 (hide expired), 19.2 (database optimization)
 *
 * Performance Optimizations:
 * - Uses eager loading with `with` clause to fetch related data in a single query
 * - Leverages database indexes on status, endDate, platformId, and slug
 * - Implements efficient pagination with limit and offset
 * - Uses SQL EXISTS for complex filtering to avoid N+1 queries
 */
export async function getCampaigns(filters?: CampaignListFilters): Promise<Campaign[]> {
  const conditions = [];

  // Filter by status
  if (filters?.status) {
    conditions.push(eq(campaigns.status, filters.status));
  } else if (!filters?.includeExpired) {
    // By default, exclude expired campaigns (Requirement 2.4)
    conditions.push(sql`${campaigns.status} != 'expired'`);
  }

  // Exclude soft-deleted campaigns unless explicitly requested
  if (!filters?.includeDeleted) {
    conditions.push(isNull(campaigns.deletedAt));
  }

  // Filter by platform (single)
  if (filters?.platformId) {
    conditions.push(eq(campaigns.platformId, filters.platformId));
  }

  // Filter by platforms (multiple)
  if (filters?.platformIds && filters.platformIds.length > 0) {
    conditions.push(inArray(campaigns.platformId, filters.platformIds));
  }

  // Filter by featured status
  if (filters?.isFeatured !== undefined) {
    conditions.push(eq(campaigns.isFeatured, filters.isFeatured));
  }

  // Filter by difficulty level
  if (filters?.difficultyLevel) {
    conditions.push(eq(campaigns.difficultyLevel, filters.difficultyLevel));
  }

  // Filter by submitter
  if (filters?.submittedBy) {
    conditions.push(eq(campaigns.submittedBy, filters.submittedBy));
  }

  // Filter by category tags (Requirement 9.2)
  if (filters?.categoryTags && filters.categoryTags.length > 0) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${campaignTags}
        JOIN ${tags} ON ${campaignTags.tagId} = ${tags.id}
        WHERE ${campaignTags.campaignId} = ${campaigns.id}
        AND ${tags.type} = 'category'
        AND (${tags.slug} IN (${sql.join(filters.categoryTags.map(t => sql`${t}`), sql`, `)})
             OR ${tags.id} IN (${sql.join(filters.categoryTags.map(t => sql`${t}`), sql`, `)}))
      )`,
    );
  }

  // Filter by AI models (Requirement 9.3)
  if (filters?.aiModels && filters.aiModels.length > 0) {
    // Check if any of the specified AI models are in the campaign's aiModels array
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(${campaigns.aiModels}) AS model
        WHERE model = ANY(${filters.aiModels})
      )`,
    );
  }

  // Filter by condition tags (Requirements 9.4, 9.5)
  if (filters?.conditionTags && filters.conditionTags.length > 0) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${campaignConditionTags}
        JOIN ${conditionTags} ON ${campaignConditionTags.tagId} = ${conditionTags.id}
        WHERE ${campaignConditionTags.campaignId} = ${campaigns.id}
        AND (${conditionTags.slug} IN (${sql.join(filters.conditionTags.map(t => sql`${t}`), sql`, `)})
             OR ${conditionTags.id} IN (${sql.join(filters.conditionTags.map(t => sql`${t}`), sql`, `)}))
      )`,
    );
  }

  // Search in platform name, campaign title, and description (Requirement 9.1)
  // Searches across platform name, title, and description
  if (filters?.search) {
    const searchPattern = `%${filters.search}%`;
    conditions.push(
      sql`(
        EXISTS (
          SELECT 1 FROM ${platforms}
          WHERE ${platforms.id} = ${campaigns.platformId}
          AND ${platforms.name} ILIKE ${searchPattern}
        )
        OR EXISTS (
          SELECT 1 FROM ${campaignTranslations}
          WHERE ${campaignTranslations.campaignId} = ${campaigns.id}
          AND (
            ${campaignTranslations.title} ILIKE ${searchPattern}
            OR ${campaignTranslations.description} ILIKE ${searchPattern}
          )
        )
      )`,
    );
  }

  // Determine sort order (Requirement 9.7)
  let orderByClause;
  switch (filters?.sortBy) {
    case 'popular':
      // Sort by reaction count (most reactions first)
      orderByClause = sql`(
        SELECT COUNT(*) FROM ${sql.identifier('reactions')}
        WHERE ${sql.identifier('reactions')}.${sql.identifier('campaign_id')} = ${campaigns.id}
      ) DESC`;
      break;
    case 'expiring_soon':
      // Sort by end date (soonest first), nulls last
      orderByClause = sql`${campaigns.endDate} ASC NULLS LAST`;
      break;
    case 'highest_credit':
      // Sort by free credit (this is a text field, so we'll sort alphabetically)
      // In production, you might want to parse the credit amount
      orderByClause = sql`${campaigns.freeCredit} DESC NULLS LAST`;
      break;
    case 'latest':
    default:
      // Sort by creation date (newest first)
      orderByClause = sql`${campaigns.createdAt} DESC`;
      break;
  }

  const result = await db.query.campaigns.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      platform: true,
      translations: true,
      conditionTags: {
        with: {
          tag: true,
        },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
    orderBy: () => [orderByClause],
    limit: filters?.limit,
    offset: filters?.offset,
  });

  return result as Campaign[];
}

/**
 * Get a single campaign by ID
 * Validates: Requirements 2.1
 */
export async function getCampaignById(id: string): Promise<Campaign | null> {
  const result = await db.query.campaigns.findFirst({
    where: and(eq(campaigns.id, id), isNull(campaigns.deletedAt)),
    with: {
      platform: true,
      translations: true,
      conditionTags: {
        with: {
          tag: true,
        },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  return (result as Campaign) || null;
}

/**
 * Get a single campaign by slug
 * Validates: Requirements 2.1
 */
export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const result = await db.query.campaigns.findFirst({
    where: and(eq(campaigns.slug, slug), isNull(campaigns.deletedAt)),
    with: {
      platform: true,
      translations: true,
      conditionTags: {
        with: {
          tag: true,
        },
      },
      tags: {
        with: {
          tag: true,
        },
      },
    },
  });

  return (result as Campaign) || null;
}

/**
 * Auto-translate campaign content to both languages
 * Validates: Requirements 8.4, 8.5
 */
async function autoTranslateCampaign(
  title: string,
  description: string | null,
): Promise<Array<{ locale: SupportedLanguage; title: string; description: string | null; isAiGenerated: boolean }>> {
  try {
    // Detect the source language
    const sourceLang = await detectLanguage(title);
    const targetLang: SupportedLanguage = sourceLang === 'zh' ? 'en' : 'zh';

    // Translate to the other language
    const translated = await translateCampaignContent(
      title,
      description,
      sourceLang,
      targetLang,
    );

    // Return both versions
    return [
      {
        locale: sourceLang,
        title,
        description,
        isAiGenerated: false, // Original content
      },
      {
        locale: targetLang,
        title: translated.title,
        description: translated.description,
        isAiGenerated: true, // AI-generated translation
      },
    ];
  } catch (error) {
    console.error('Auto-translation failed:', error);
    // Fallback: return only the original content
    const sourceLang = await detectLanguage(title);
    return [
      {
        locale: sourceLang,
        title,
        description,
        isAiGenerated: false,
      },
    ];
  }
}

/**
 * Create a new campaign
 * Validates: Requirements 2.1, 2.2, 4.3, 4.4, 8.4, 8.5
 */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
  // Check if slug already exists
  const existing = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.slug, input.slug), isNull(campaigns.deletedAt)))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Campaign with slug "${input.slug}" already exists`);
  }

  // Verify platform exists
  const platform = await db
    .select()
    .from(platforms)
    .where(eq(platforms.id, input.platformId))
    .limit(1);

  if (platform.length === 0) {
    throw new Error(`Platform with ID "${input.platformId}" not found`);
  }

  // Calculate difficulty level if condition tags are provided
  let difficultyLevel = input.difficultyLevel;
  if (input.conditionTagIds && input.conditionTagIds.length > 0 && !difficultyLevel) {
    difficultyLevel = await calculateDifficultyLevel(input.conditionTagIds);
  }

  // Create campaign
  const [campaign] = await db
    .insert(campaigns)
    .values({
      platformId: input.platformId,
      slug: input.slug,
      status: input.status || 'pending', // Default to pending (Requirement 4.3)
      freeCredit: input.freeCredit || null,
      startDate: input.startDate || null,
      endDate: input.endDate || null,
      officialLink: input.officialLink,
      aiModels: input.aiModels || null,
      usageLimits: input.usageLimits || null,
      difficultyLevel: difficultyLevel || null,
      isFeatured: input.isFeatured || false,
      featuredUntil: input.featuredUntil || null,
      submittedBy: input.submittedBy || null, // Record submitter (Requirement 4.4)
    })
    .returning();

  // Handle translations
  let translationsToInsert;
  if (input.translations && input.translations.length > 0) {
    // Use provided translations
    translationsToInsert = input.translations;
  } else if (input.autoTranslate !== false) {
    // Auto-translate if not explicitly disabled (Requirements 8.4, 8.5)
    // We need at least a title from the first translation or input
    const sourceTitle = input.translations?.[0]?.title || '';
    const sourceDescription = input.translations?.[0]?.description || null;

    if (sourceTitle) {
      translationsToInsert = await autoTranslateCampaign(sourceTitle, sourceDescription);
    }
  }

  // Add translations
  if (translationsToInsert && translationsToInsert.length > 0) {
    await db.insert(campaignTranslations).values(
      translationsToInsert.map(t => ({
        campaignId: campaign!.id,
        locale: t.locale,
        title: t.title,
        description: t.description || null,
        isAiGenerated: t.isAiGenerated || false,
      })),
    );
  }

  // Add condition tags if provided
  if (input.conditionTagIds && input.conditionTagIds.length > 0) {
    await db.insert(campaignConditionTags).values(
      input.conditionTagIds.map(tagId => ({
        campaignId: campaign!.id,
        tagId,
      })),
    );
  }

  // Add tags if provided
  if (input.tagIds && input.tagIds.length > 0) {
    await db.insert(campaignTags).values(
      input.tagIds.map(tagId => ({
        campaignId: campaign!.id,
        tagId,
      })),
    );
  }

  // Fetch and return the complete campaign with relations
  return (await getCampaignById(campaign!.id))!;
}

/**
 * Update an existing campaign
 * Validates: Requirements 2.5
 */
export async function updateCampaign(
  id: string,
  input: UpdateCampaignInput,
): Promise<Campaign | null> {
  // Check if campaign exists and is not deleted
  const existing = await getCampaignById(id);
  if (!existing) {
    return null;
  }

  // If slug is being updated, check for conflicts
  if (input.slug && input.slug !== existing.slug) {
    const slugExists = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.slug, input.slug), isNull(campaigns.deletedAt)))
      .limit(1);

    if (slugExists.length > 0) {
      throw new Error(`Campaign with slug "${input.slug}" already exists`);
    }
  }

  // Calculate difficulty level if condition tags are being updated
  let difficultyLevel = input.difficultyLevel;
  if (input.conditionTagIds && input.conditionTagIds.length > 0 && !difficultyLevel) {
    difficultyLevel = await calculateDifficultyLevel(input.conditionTagIds);
  }

  // Update campaign
  await db
    .update(campaigns)
    .set({
      ...(input.platformId && { platformId: input.platformId }),
      ...(input.slug && { slug: input.slug }),
      ...(input.status && { status: input.status }),
      ...(input.freeCredit !== undefined && { freeCredit: input.freeCredit || null }),
      ...(input.startDate !== undefined && { startDate: input.startDate || null }),
      ...(input.endDate !== undefined && { endDate: input.endDate || null }),
      ...(input.officialLink && { officialLink: input.officialLink }),
      ...(input.aiModels !== undefined && { aiModels: input.aiModels || null }),
      ...(input.usageLimits !== undefined && { usageLimits: input.usageLimits || null }),
      ...(difficultyLevel && { difficultyLevel }),
      ...(input.isFeatured !== undefined && { isFeatured: input.isFeatured }),
      ...(input.featuredUntil !== undefined && { featuredUntil: input.featuredUntil || null }),
      updatedAt: new Date(), // Update timestamp (Requirement 2.5)
    })
    .where(eq(campaigns.id, id));

  // Update translations if provided (Requirements 8.6, 8.7)
  if (input.translations && input.translations.length > 0) {
    // Delete existing translations and insert new ones
    // This allows admins to edit AI-generated translations
    await db.delete(campaignTranslations).where(eq(campaignTranslations.campaignId, id));

    await db.insert(campaignTranslations).values(
      input.translations.map(t => ({
        campaignId: id,
        locale: t.locale,
        title: t.title,
        description: t.description || null,
        // If manually edited, mark as not AI-generated
        isAiGenerated: t.isAiGenerated === true,
      })),
    );
  }

  // Update condition tags if provided
  if (input.conditionTagIds !== undefined) {
    // Delete existing associations
    await db.delete(campaignConditionTags).where(eq(campaignConditionTags.campaignId, id));

    // Insert new associations
    if (input.conditionTagIds.length > 0) {
      await db.insert(campaignConditionTags).values(
        input.conditionTagIds.map(tagId => ({
          campaignId: id,
          tagId,
        })),
      );
    }
  }

  // Update tags if provided
  if (input.tagIds !== undefined) {
    // Delete existing associations
    await db.delete(campaignTags).where(eq(campaignTags.campaignId, id));

    // Insert new associations
    if (input.tagIds.length > 0) {
      await db.insert(campaignTags).values(
        input.tagIds.map(tagId => ({
          campaignId: id,
          tagId,
        })),
      );
    }
  }

  // Fetch and return the updated campaign
  return await getCampaignById(id);
}

/**
 * Delete a campaign (soft delete)
 * Validates: Requirements 2.6
 */
export async function deleteCampaign(id: string): Promise<boolean> {
  const existing = await getCampaignById(id);
  if (!existing) {
    return false;
  }

  // Soft delete by setting deletedAt timestamp (Requirement 2.6)
  const result = await db
    .update(campaigns)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, id))
    .returning();

  return result.length > 0;
}

/**
 * Mark expired campaigns
 * Validates: Requirements 2.3
 * This should be called periodically (e.g., via cron job)
 */
export async function markExpiredCampaigns(): Promise<number> {
  const now = new Date();

  const result = await db
    .update(campaigns)
    .set({
      status: 'expired',
      updatedAt: now,
    })
    .where(
      and(
        sql`${campaigns.endDate} < ${now}`,
        sql`${campaigns.status} != 'expired'`,
        isNull(campaigns.deletedAt),
      ),
    )
    .returning();

  return result.length;
}

/**
 * Calculate difficulty level based on condition tags
 * Validates: Requirements 2.8
 * 0-3 = easy, 4-7 = medium, 8+ = hard
 */
export async function calculateDifficultyLevel(
  tagIds: string[],
): Promise<'easy' | 'medium' | 'hard'> {
  if (tagIds.length === 0) {
    return 'easy';
  }

  const tags = await db
    .select()
    .from(conditionTags)
    .where(inArray(conditionTags.id, tagIds));

  const totalWeight = tags.reduce((sum, tag) => sum + tag.difficultyWeight, 0);

  if (totalWeight <= 3) {
    return 'easy';
  } else if (totalWeight <= 7) {
    return 'medium';
  } else {
    return 'hard';
  }
}

/**
 * Approve a pending campaign
 * Validates: Requirements 4.5
 */
export async function approveCampaign(id: string): Promise<Campaign | null> {
  return await updateCampaign(id, { status: 'published' });
}

/**
 * Reject a pending campaign
 * Validates: Requirements 4.6
 */
export async function rejectCampaign(id: string): Promise<Campaign | null> {
  return await updateCampaign(id, { status: 'rejected' });
}

/**
 * Get campaigns by status
 * Validates: Requirements 4.5, 4.6
 */
export async function getCampaignsByStatus(
  status: 'pending' | 'published' | 'rejected' | 'expired',
): Promise<Campaign[]> {
  return await getCampaigns({ status });
}

/**
 * Set a campaign as featured with expiration date
 * Validates: Requirements 12.1
 */
export async function setFeaturedCampaign(
  id: string,
  featuredUntil: Date,
): Promise<Campaign | null> {
  const existing = await getCampaignById(id);
  if (!existing) {
    return null;
  }

  // Only published campaigns can be featured
  if (existing.status !== 'published') {
    throw new Error('Only published campaigns can be featured');
  }

  return await updateCampaign(id, {
    isFeatured: true,
    featuredUntil,
  });
}

/**
 * Remove featured status from a campaign
 * Validates: Requirements 12.1
 */
export async function removeFeaturedCampaign(id: string): Promise<Campaign | null> {
  return await updateCampaign(id, {
    isFeatured: false,
    featuredUntil: null,
  });
}

/**
 * Get all featured campaigns
 * Validates: Requirements 12.2
 */
export async function getFeaturedCampaigns(): Promise<Campaign[]> {
  return await getCampaigns({
    isFeatured: true,
    status: 'published',
  });
}

/**
 * Auto-expire featured campaigns
 * Validates: Requirements 12.3
 * This should be called periodically (e.g., via cron job)
 */
export async function expireFeaturedCampaigns(): Promise<number> {
  const now = new Date();

  const result = await db
    .update(campaigns)
    .set({
      isFeatured: false,
      updatedAt: now,
    })
    .where(
      and(
        eq(campaigns.isFeatured, true),
        sql`${campaigns.featuredUntil} < ${now}`,
        isNull(campaigns.deletedAt),
      ),
    )
    .returning();

  return result.length;
}

/**
 * Track featured campaign impression
 * Validates: Requirements 12.4
 * @deprecated Use trackImpression from FeaturedCampaignService instead
 */
export async function trackFeaturedImpression(campaignId: string): Promise<void> {
  const { trackImpression } = await import('./FeaturedCampaignService');
  await trackImpression(campaignId);
}

/**
 * Track featured campaign click
 * Validates: Requirements 12.4
 * @deprecated Use trackClick from FeaturedCampaignService instead
 */
export async function trackFeaturedClick(campaignId: string): Promise<void> {
  const { trackClick } = await import('./FeaturedCampaignService');
  await trackClick(campaignId);
}
