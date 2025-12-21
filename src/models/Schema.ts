import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the Next.js initialization process through `instrumentation.ts`.
// Simply restart your Next.js server to apply the database changes.
// Alternatively, if your database is running, you can run `pnpm run db:migrate` and there is no need to restart the server.

// Need a database for production? Just claim it by running `pnpm run neon:claim`.
// Tested and compatible with Next.js Boilerplate

// Legacy counter table (keeping for backward compatibility)
export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ============================================================================
// AI Free Pool Schema
// ============================================================================

// Platforms table - AI tool/service providers
export const platforms = pgTable(
  'platforms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    logo: text('logo'),
    website: text('website'),
    description: text('description'),
    socialLinks: jsonb('social_links').$type<{
      twitter?: string;
      github?: string;
      discord?: string;
    }>(),
    status: varchar('status', { length: 50 }).notNull().default('active'), // active, inactive
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    slugIdx: uniqueIndex('platforms_slug_idx').on(table.slug),
    statusIdx: index('platforms_status_idx').on(table.status),
  }),
);

// Campaigns table - Free credit campaigns/activities
export const campaigns = pgTable(
  'campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    platformId: uuid('platform_id')
      .references(() => platforms.id), // Nullable when pending platform review
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, published, rejected, expired
    freeCredit: text('free_credit'), // e.g., "$5 USD", "10000 tokens"
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    officialLink: text('official_link').notNull(),
    aiModels: jsonb('ai_models').$type<string[]>(),
    usageLimits: text('usage_limits'),
    difficultyLevel: varchar('difficulty_level', { length: 50 }), // easy, medium, hard
    isFeatured: boolean('is_featured').notNull().default(false),
    featuredUntil: timestamp('featured_until'),
    needsVerification: boolean('needs_verification').notNull().default(false),
    submittedBy: varchar('submitted_by', { length: 255 }), // Clerk user ID
    // Pending platform info - stored when user submits a new platform for review
    pendingPlatform: jsonb('pending_platform').$type<{
      name: string;
      slug: string;
      website?: string;
      description?: string;
    }>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  table => ({
    slugIdx: uniqueIndex('campaigns_slug_idx').on(table.slug),
    statusIdx: index('campaigns_status_idx').on(table.status),
    endDateIdx: index('campaigns_end_date_idx').on(table.endDate),
    platformIdIdx: index('campaigns_platform_id_idx').on(table.platformId),
    isFeaturedIdx: index('campaigns_is_featured_idx').on(table.isFeatured),
    submittedByIdx: index('campaigns_submitted_by_idx').on(table.submittedBy),
  }),
);

// Campaign translations table - Multi-language support
export const campaignTranslations = pgTable(
  'campaign_translations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 10 }).notNull(), // 'zh' | 'en'
    title: varchar('title', { length: 500 }).notNull(),
    description: text('description'),
    isAiGenerated: boolean('is_ai_generated').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    uniqueCampaignLocale: unique('campaign_translations_campaign_locale_unique').on(
      table.campaignId,
      table.locale,
    ),
    campaignIdIdx: index('campaign_translations_campaign_id_idx').on(table.campaignId),
  }),
);

// Condition tags table - Tags for campaign participation conditions
export const conditionTags = pgTable(
  'condition_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(), // 'requirement' | 'benefit'
    difficultyWeight: integer('difficulty_weight').notNull().default(0), // 0-10, used to calculate difficulty
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    slugIdx: uniqueIndex('condition_tags_slug_idx').on(table.slug),
    typeIdx: index('condition_tags_type_idx').on(table.type),
  }),
);

// Campaign condition tags junction table (many-to-many)
export const campaignConditionTags = pgTable(
  'campaign_condition_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => conditionTags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    uniqueCampaignTag: unique('campaign_condition_tags_campaign_tag_unique').on(
      table.campaignId,
      table.tagId,
    ),
    campaignIdIdx: index('campaign_condition_tags_campaign_id_idx').on(table.campaignId),
    tagIdIdx: index('campaign_condition_tags_tag_id_idx').on(table.tagId),
  }),
);

// Tags table - General categorization tags
export const tags = pgTable(
  'tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(), // 'category' | 'ai_model' | 'general'
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    slugIdx: uniqueIndex('tags_slug_idx').on(table.slug),
    typeIdx: index('tags_type_idx').on(table.type),
  }),
);

// Campaign tags junction table (many-to-many)
export const campaignTags = pgTable(
  'campaign_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    uniqueCampaignTag: unique('campaign_tags_campaign_tag_unique').on(
      table.campaignId,
      table.tagId,
    ),
    campaignIdIdx: index('campaign_tags_campaign_id_idx').on(table.campaignId),
    tagIdIdx: index('campaign_tags_tag_id_idx').on(table.tagId),
  }),
);

// Reactions table - User quick feedback on campaigns
export const reactions = pgTable(
  'reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
    type: varchar('type', { length: 50 }).notNull(), // 'still_works' | 'expired' | 'info_incorrect'
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  table => ({
    uniqueUserCampaign: unique('reactions_user_campaign_unique').on(
      table.userId,
      table.campaignId,
    ),
    campaignIdIdx: index('reactions_campaign_id_idx').on(table.campaignId),
    userIdIdx: index('reactions_user_id_idx').on(table.userId),
    typeIdx: index('reactions_type_idx').on(table.type),
  }),
);

// Comments table - User detailed feedback
export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
    parentId: uuid('parent_id'),
    content: text('content').notNull(),
    isMarkedUseful: boolean('is_marked_useful').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  table => ({
    campaignIdIdx: index('comments_campaign_id_idx').on(table.campaignId),
    userIdIdx: index('comments_user_id_idx').on(table.userId),
    parentIdIdx: index('comments_parent_id_idx').on(table.parentId),
  }),
);

// Comment reactions table - Emoji reactions on comments
export const commentReactions = pgTable(
  'comment_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
    emoji: varchar('emoji', { length: 10 }).notNull(), // '👍', '👎', '😄', '🎉', etc.
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    uniqueUserCommentEmoji: unique('comment_reactions_user_comment_emoji_unique').on(
      table.userId,
      table.commentId,
      table.emoji,
    ),
    commentIdIdx: index('comment_reactions_comment_id_idx').on(table.commentId),
    userIdIdx: index('comment_reactions_user_id_idx').on(table.userId),
  }),
);

// Bookmarks table - User saved campaigns
export const bookmarks = pgTable(
  'bookmarks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    uniqueUserCampaign: unique('bookmarks_user_campaign_unique').on(
      table.userId,
      table.campaignId,
    ),
    userIdIdx: index('bookmarks_user_id_idx').on(table.userId),
    campaignIdIdx: index('bookmarks_campaign_id_idx').on(table.campaignId),
  }),
);

// User participated campaigns table - Track campaigns user has participated in
export const userParticipatedCampaigns = pgTable(
  'user_participated_campaigns',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    participatedAt: timestamp('participated_at').notNull().defaultNow(),
    notes: text('notes'), // Optional notes about participation
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    uniqueUserCampaign: unique('user_participated_campaigns_user_campaign_unique').on(
      table.userId,
      table.campaignId,
    ),
    userIdIdx: index('user_participated_campaigns_user_id_idx').on(table.userId),
    campaignIdIdx: index('user_participated_campaigns_campaign_id_idx').on(table.campaignId),
  }),
);

// Campaign emoji reactions table - Emoji reactions on campaigns
export const campaignEmojiReactions = pgTable(
  'campaign_emoji_reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
    emoji: varchar('emoji', { length: 10 }).notNull(), // '👍', '❤️', '🔥', '🎉', etc.
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  table => ({
    uniqueUserCampaignEmoji: unique('campaign_emoji_reactions_user_campaign_emoji_unique').on(
      table.userId,
      table.campaignId,
      table.emoji,
    ),
    campaignIdIdx: index('campaign_emoji_reactions_campaign_id_idx').on(table.campaignId),
    userIdIdx: index('campaign_emoji_reactions_user_id_idx').on(table.userId),
  }),
);

// ============================================================================
// Relations
// ============================================================================

export const platformsRelations = relations(platforms, ({ many }) => ({
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  platform: one(platforms, {
    fields: [campaigns.platformId],
    references: [platforms.id],
  }),
  translations: many(campaignTranslations),
  conditionTags: many(campaignConditionTags),
  tags: many(campaignTags),
  reactions: many(reactions),
  comments: many(comments),
  bookmarks: many(bookmarks),
  participations: many(userParticipatedCampaigns),
}));

export const campaignTranslationsRelations = relations(campaignTranslations, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignTranslations.campaignId],
    references: [campaigns.id],
  }),
}));

export const conditionTagsRelations = relations(conditionTags, ({ many }) => ({
  campaigns: many(campaignConditionTags),
}));

export const campaignConditionTagsRelations = relations(campaignConditionTags, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignConditionTags.campaignId],
    references: [campaigns.id],
  }),
  tag: one(conditionTags, {
    fields: [campaignConditionTags.tagId],
    references: [conditionTags.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  campaigns: many(campaignTags),
}));

export const campaignTagsRelations = relations(campaignTags, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignTags.campaignId],
    references: [campaigns.id],
  }),
  tag: one(tags, {
    fields: [campaignTags.tagId],
    references: [tags.id],
  }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [reactions.campaignId],
    references: [campaigns.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [comments.campaignId],
    references: [campaigns.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'comment_replies',
  }),
  replies: many(comments, {
    relationName: 'comment_replies',
  }),
  reactions: many(commentReactions),
}));

export const commentReactionsRelations = relations(commentReactions, ({ one }) => ({
  comment: one(comments, {
    fields: [commentReactions.commentId],
    references: [comments.id],
  }),
}));

// Featured campaign impressions table - Track when featured campaigns are viewed
export const featuredImpressions = pgTable(
  'featured_impressions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 }), // Clerk user ID (nullable for anonymous users)
    sessionId: varchar('session_id', { length: 255 }), // Session identifier
    ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    campaignIdIdx: index('featured_impressions_campaign_id_idx').on(table.campaignId),
    createdAtIdx: index('featured_impressions_created_at_idx').on(table.createdAt),
  }),
);

// Featured campaign clicks table - Track when featured campaigns are clicked
export const featuredClicks = pgTable(
  'featured_clicks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 255 }), // Clerk user ID (nullable for anonymous users)
    sessionId: varchar('session_id', { length: 255 }), // Session identifier
    ipAddress: varchar('ip_address', { length: 45 }), // IPv4 or IPv6
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  table => ({
    campaignIdIdx: index('featured_clicks_campaign_id_idx').on(table.campaignId),
    createdAtIdx: index('featured_clicks_created_at_idx').on(table.createdAt),
  }),
);

export const userParticipatedCampaignsRelations = relations(userParticipatedCampaigns, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [userParticipatedCampaigns.campaignId],
    references: [campaigns.id],
  }),
}));

export const featuredImpressionsRelations = relations(featuredImpressions, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [featuredImpressions.campaignId],
    references: [campaigns.id],
  }),
}));

export const featuredClicksRelations = relations(featuredClicks, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [featuredClicks.campaignId],
    references: [campaigns.id],
  }),
}));
