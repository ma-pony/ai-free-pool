import * as z from 'zod';

// Campaign translation schema
const campaignTranslationSchema = z.object({
  locale: z.enum(['zh', 'en']),
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional().nullable(),
  isAiGenerated: z.boolean().optional(),
});

// Create campaign validation schema
export const CreateCampaignSchema = z.object({
  platformId: z.string().uuid('Platform ID must be a valid UUID'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  status: z.enum(['pending', 'published', 'rejected', 'expired']).optional(),
  freeCredit: z.string().optional().nullable(),
  startDate: z.string().transform(val => val === '' ? undefined : val).pipe(z.coerce.date().optional()).optional().nullable(),
  endDate: z.string().transform(val => val === '' ? undefined : val).pipe(z.coerce.date().optional()).optional().nullable(),
  officialLink: z.string().url('Official link must be a valid URL'),
  aiModels: z.array(z.string()).optional().nullable(),
  usageLimits: z.string().optional().nullable(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().nullable(),
  isFeatured: z.boolean().optional(),
  featuredUntil: z.string().transform(val => val === '' ? undefined : val).pipe(z.coerce.date().optional()).optional().nullable(),
  submittedBy: z.string().optional().nullable(),
  translations: z.array(campaignTranslationSchema).min(1, 'At least one translation is required'),
  conditionTagIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  autoTranslate: z.boolean().optional(), // Auto-translate by default
});

// Update campaign validation schema (all fields optional except translations must have at least one if provided)
export const UpdateCampaignSchema = z.object({
  platformId: z.string().uuid('Platform ID must be a valid UUID').optional(),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  status: z.enum(['pending', 'published', 'rejected', 'expired']).optional(),
  freeCredit: z.string().optional().nullable(),
  startDate: z.string().transform(val => val === '' ? undefined : val).pipe(z.coerce.date().optional()).optional().nullable(),
  endDate: z.string().transform(val => val === '' ? undefined : val).pipe(z.coerce.date().optional()).optional().nullable(),
  officialLink: z.string().url('Official link must be a valid URL').optional(),
  aiModels: z.array(z.string()).optional().nullable(),
  usageLimits: z.string().optional().nullable(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().nullable(),
  isFeatured: z.boolean().optional(),
  featuredUntil: z.string().transform(val => val === '' ? undefined : val).pipe(z.coerce.date().optional()).optional().nullable(),
  translations: z.array(campaignTranslationSchema).min(1).optional(),
  conditionTagIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  autoTranslate: z.boolean().optional(), // Allow manual control of auto-translation
});

// Condition tag validation schemas
export const CreateConditionTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.enum(['requirement', 'benefit']),
  difficultyWeight: z.number().int().min(0).max(10).default(0),
});

export const UpdateConditionTagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  type: z.enum(['requirement', 'benefit']).optional(),
  difficultyWeight: z.number().int().min(0).max(10).optional(),
});

// Tag validation schemas
export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.enum(['category', 'ai_model', 'general']),
});

export const UpdateTagSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  type: z.enum(['category', 'ai_model', 'general']).optional(),
});

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>;
export type CreateConditionTagInput = z.infer<typeof CreateConditionTagSchema>;
export type UpdateConditionTagInput = z.infer<typeof UpdateConditionTagSchema>;
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
