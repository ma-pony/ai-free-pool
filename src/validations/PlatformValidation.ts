import * as z from 'zod';

// Helper to transform empty strings to undefined
const emptyStringToUndefined = z.string().transform(val => val === '' ? undefined : val);

// Social links schema
const socialLinksSchema = z.object({
  twitter: emptyStringToUndefined.pipe(z.string().url().optional()).optional(),
  github: emptyStringToUndefined.pipe(z.string().url().optional()).optional(),
  discord: emptyStringToUndefined.pipe(z.string().url().optional()).optional(),
})
  .optional()
  .transform((val) => {
    // If all fields are undefined/empty, return undefined instead of empty object
    if (!val || (!val.twitter && !val.github && !val.discord)) {
      return undefined;
    }
    return val;
  });

// Create platform validation schema
export const CreatePlatformSchema = z.object({
  name: z.string().min(1, 'Platform name is required').max(255),
  slug: z.string()
    .min(1, 'Slug is required')
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  logo: emptyStringToUndefined.pipe(z.string().url('Logo must be a valid URL').optional()).optional(),
  website: emptyStringToUndefined.pipe(z.string().url('Website must be a valid URL').optional()).optional(),
  description: z.string().optional(),
  socialLinks: socialLinksSchema.optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

// Update platform validation schema (all fields optional)
export const UpdatePlatformSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  logo: z.string().url('Logo must be a valid URL').optional().nullable(),
  website: z.string().url('Website must be a valid URL').optional().nullable(),
  description: z.string().optional().nullable(),
  socialLinks: socialLinksSchema.nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

export type CreatePlatformInput = z.infer<typeof CreatePlatformSchema>;
export type UpdatePlatformInput = z.infer<typeof UpdatePlatformSchema>;
