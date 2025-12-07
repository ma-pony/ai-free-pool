/**
 * Slug Generation Utilities
 * Validates: Requirements 15.6, 15.7, 15.8
 *
 * Utilities for generating URL-friendly slugs from text
 */

/**
 * Generate a URL-friendly slug from text
 * - Converts to lowercase
 * - Replaces spaces and special characters with hyphens
 * - Removes consecutive hyphens
 * - Trims hyphens from start and end
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-{2,}/g, '-')
    // Remove hyphens from start and end
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generate a unique slug by appending a number if needed
 * Used when creating new entities to avoid slug conflicts
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
): string {
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a string is a valid slug
 * - Only lowercase letters, numbers, and hyphens
 * - No consecutive hyphens
 * - No hyphens at start or end
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Extract slug from a URL path
 * Example: /campaigns/openai-free-credit -> openai-free-credit
 */
export function extractSlugFromPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : null;
}
