// Campaign types for AI Free Pool

import type { Platform } from './Platform';

// Pending platform info for campaigns with new platforms awaiting review
export type PendingPlatform = {
  name: string;
  slug: string;
  website?: string;
  description?: string;
};

export type Campaign = {
  id: string;
  platformId: string | null; // Nullable when pending platform review
  platform?: Platform;
  slug: string;
  status: 'pending' | 'published' | 'rejected' | 'expired';
  freeCredit?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  officialLink: string;
  aiModels?: string[] | null;
  usageLimits?: string | null;
  difficultyLevel?: 'easy' | 'medium' | 'hard' | null;
  isFeatured: boolean;
  featuredUntil?: Date | null;
  submittedBy?: string | null;
  pendingPlatform?: PendingPlatform | null; // New platform pending review
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  translations?: CampaignTranslation[];
  conditionTags?: ConditionTag[];
  tags?: Tag[];
};

export type CampaignTranslation = {
  id: string;
  campaignId: string;
  locale: 'zh' | 'en';
  title: string;
  description?: string | null;
  isAiGenerated?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ConditionTag = {
  id: string;
  name: string;
  slug: string;
  type: 'requirement' | 'benefit';
  difficultyWeight: number;
  createdAt: Date;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  type: 'category' | 'ai_model' | 'general';
  createdAt: Date;
};

export type CreateCampaignInput = {
  platformId?: string | null; // Optional when pendingPlatform is provided
  pendingPlatform?: PendingPlatform | null; // New platform pending review
  slug: string;
  status?: 'pending' | 'published' | 'rejected' | 'expired';
  freeCredit?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  officialLink: string;
  aiModels?: string[] | null;
  usageLimits?: string | null;
  difficultyLevel?: 'easy' | 'medium' | 'hard' | null;
  isFeatured?: boolean;
  featuredUntil?: Date | null;
  submittedBy?: string | null;
  translations?: {
    locale: 'zh' | 'en';
    title: string;
    description?: string | null;
    isAiGenerated?: boolean;
  }[];
  conditionTagIds?: string[];
  tagIds?: string[];
  autoTranslate?: boolean; // If true, automatically translate content to both languages
};

export type UpdateCampaignInput = Partial<Omit<CreateCampaignInput, 'slug'>> & {
  slug?: string;
};

export type CampaignListFilters = {
  status?: 'pending' | 'published' | 'rejected' | 'expired';
  platformId?: string;
  platformIds?: string[]; // Array of platform IDs for multi-platform filtering
  search?: string;
  isFeatured?: boolean;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  submittedBy?: string;
  includeExpired?: boolean;
  includeDeleted?: boolean;
  // Filter by category tags (Requirements 9.2)
  categoryTags?: string[]; // Array of tag slugs or IDs
  // Filter by AI models (Requirements 9.3)
  aiModels?: string[]; // Array of AI model names
  // Filter by condition tags (Requirements 9.4, 9.5)
  conditionTags?: string[]; // Array of condition tag slugs or IDs
  // Sort options (Requirements 9.7)
  sortBy?: 'latest' | 'popular' | 'expiring_soon' | 'highest_credit';
  // Pagination
  limit?: number;
  offset?: number;
  // Exclude participated campaigns for a specific user
  excludeParticipatedByUserId?: string;
};

export type CreateConditionTagInput = {
  name: string;
  slug: string;
  type: 'requirement' | 'benefit';
  difficultyWeight?: number;
};

export type UpdateConditionTagInput = Partial<CreateConditionTagInput>;

export type ConditionTagFilters = {
  type?: 'requirement' | 'benefit';
  search?: string;
};
