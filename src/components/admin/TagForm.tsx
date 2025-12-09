'use client';

import type { Tag } from '@/types/Campaign';
import type { CreateTagInput } from '@/validations/CampaignValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreateTagSchema } from '@/validations/CampaignValidation';

type TagFormProps = {
  tag?: Tag;
  onSubmit: (data: CreateTagInput) => Promise<void>;
  onCancel: () => void;
};

export function TagForm({ tag, onSubmit, onCancel }: TagFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTagInput>({
    resolver: zodResolver(CreateTagSchema),
    defaultValues: tag
      ? {
          name: tag.name,
          slug: tag.slug,
          type: tag.type,
        }
      : {
          type: 'general' as const,
        },
  });

  // Watch name for auto-generating slug
  watch('name');

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    if (!tag) {
      // Only auto-generate slug for new tags
      const slug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug);
    }
  };

  const onSubmitForm = async (data: CreateTagInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Tag Information</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Tag Name *
          </label>
          <input
            {...register('name', {
              onChange: handleNameChange,
            })}
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., API Development"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug *
          </label>
          <input
            {...register('slug')}
            type="text"
            id="slug"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., api-development"
          />
          <p className="mt-1 text-sm text-gray-500">
            Lowercase letters, numbers, and hyphens only. Auto-generated from name.
          </p>
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Tag Type *
          </label>
          <select
            {...register('type')}
            id="type"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="category">Category</option>
            <option value="ai_model">AI Model</option>
            <option value="general">General</option>
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Category: For campaign categories (e.g., API, Editor, Chat)
            <br />
            AI Model: For specific AI models (e.g., GPT-4, Claude)
            <br />
            General: For other tags
          </p>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : tag ? 'Update Tag' : 'Create Tag'}
        </button>
      </div>
    </form>
  );
}
