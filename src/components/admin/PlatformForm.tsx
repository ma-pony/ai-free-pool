'use client';

import type { Platform } from '@/types/Platform';
import type { CreatePlatformInput } from '@/validations/PlatformValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CreatePlatformSchema } from '@/validations/PlatformValidation';

type PlatformFormProps = {
  platform?: Platform;
  onSubmit: (data: CreatePlatformInput) => Promise<void>;
  onCancel: () => void;
};

export function PlatformForm({ platform, onSubmit, onCancel }: PlatformFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('Admin');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreatePlatformSchema),
    defaultValues: platform
      ? {
          name: platform.name,
          slug: platform.slug,
          logo: platform.logo || undefined,
          website: platform.website || undefined,
          description: platform.description || undefined,
          socialLinks: platform.socialLinks || undefined,
          status: platform.status as 'active' | 'inactive',
        }
      : {
          status: 'active' as const,
        },
  });

  const onSubmitForm = async (data: unknown) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data as CreatePlatformInput);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('basic_information')}</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t('platform_name')}
            {' '}
            *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., OpenAI"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            {t('slug')}
            {' '}
            *
          </label>
          <input
            {...register('slug')}
            type="text"
            id="slug"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., openai"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('slug_hint')}
          </p>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            {t('description')}
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="Brief description of the platform"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            {t('status')}
          </label>
          <select
            {...register('status')}
            id="status"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="active">{t('status_active')}</option>
            <option value="inactive">{t('status_inactive')}</option>
          </select>
        </div>
      </div>

      {/* Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('links')}</h3>

        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
            {t('platform_logo')}
          </label>
          <input
            {...register('logo')}
            type="url"
            id="logo"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="https://example.com/logo.png"
          />
          {errors.logo && (
            <p className="mt-1 text-sm text-red-600">{errors.logo.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            {t('platform_website')}
          </label>
          <input
            {...register('website')}
            type="url"
            id="website"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="https://example.com"
          />
          {errors.website && (
            <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('social_media')}</h3>

        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
            {t('twitter_url')}
          </label>
          <input
            {...register('socialLinks.twitter')}
            type="url"
            id="twitter"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="https://twitter.com/username"
          />
          {errors.socialLinks?.twitter && (
            <p className="mt-1 text-sm text-red-600">{errors.socialLinks.twitter.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="github" className="block text-sm font-medium text-gray-700">
            {t('github_url')}
          </label>
          <input
            {...register('socialLinks.github')}
            type="url"
            id="github"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="https://github.com/username"
          />
          {errors.socialLinks?.github && (
            <p className="mt-1 text-sm text-red-600">{errors.socialLinks.github.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="discord" className="block text-sm font-medium text-gray-700">
            {t('discord_url')}
          </label>
          <input
            {...register('socialLinks.discord')}
            type="url"
            id="discord"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="https://discord.gg/invite"
          />
          {errors.socialLinks?.discord && (
            <p className="mt-1 text-sm text-red-600">{errors.socialLinks.discord.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? t('saving') : platform ? t('update') : t('create')}
        </button>
      </div>
    </form>
  );
}
