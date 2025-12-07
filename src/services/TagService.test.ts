import type { CreateTagInput, TagFilters, UpdateTagInput } from './TagService';
import { describe, expect, it } from 'vitest';

describe('TagService Types', () => {
  it('should have correct CreateTagInput type', () => {
    const input: CreateTagInput = {
      name: 'Test Tag',
      slug: 'test-tag',
      type: 'category',
    };

    expect(input.name).toBe('Test Tag');
    expect(input.slug).toBe('test-tag');
    expect(input.type).toBe('category');
  });

  it('should have correct UpdateTagInput type', () => {
    const input: UpdateTagInput = {
      name: 'Updated Tag',
    };

    expect(input.name).toBe('Updated Tag');
  });

  it('should have correct TagFilters type', () => {
    const filters: TagFilters = {
      type: 'ai_model',
      search: 'GPT',
      hasActiveCampaigns: true,
    };

    expect(filters.type).toBe('ai_model');
    expect(filters.search).toBe('GPT');
    expect(filters.hasActiveCampaigns).toBe(true);
  });

  it('should allow all tag types', () => {
    const types: Array<'category' | 'ai_model' | 'general'> = [
      'category',
      'ai_model',
      'general',
    ];

    types.forEach((type) => {
      const input: CreateTagInput = {
        name: `Test ${type}`,
        slug: `test-${type}`,
        type,
      };

      expect(input.type).toBe(type);
    });
  });
});
