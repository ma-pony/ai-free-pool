'use client';

import { useUser } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { trackCampaignSubmission } from '@/libs/Analytics';

// Form validation schema
const campaignSubmissionSchema = z.object({
  platformId: z.string().min(1, 'Platform is required'),
  platformName: z.string().optional(), // For creating new platform
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  freeCredit: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().min(1, 'End date is required'),
  officialLink: z.string().url('Must be a valid URL'),
  aiModels: z.string().optional(), // Comma-separated
  usageLimits: z.string().optional(),
  conditionTagIds: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof campaignSubmissionSchema>;

export function CampaignSubmissionForm() {
  const t = useTranslations('SubmitCampaign');
  const router = useRouter();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Array<{ id: string; name: string }>>([]);
  const [conditionTags, setConditionTags] = useState<Array<{ id: string; name: string }>>([]);
  const [isNewPlatform, setIsNewPlatform] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(campaignSubmissionSchema),
    defaultValues: {
      conditionTagIds: [],
    },
  });

  // Load platforms and condition tags
  useState(() => {
    const loadData = async () => {
      try {
        const [platformsRes, tagsRes] = await Promise.all([
          fetch('/api/platforms'),
          fetch('/api/condition-tags'),
        ]);

        if (platformsRes.ok) {
          const platformsData = await platformsRes.json();
          setPlatforms(platformsData.data || []);
        }

        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setConditionTags(tagsData.data || []);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  });

  const selectedConditionTags = watch('conditionTagIds') || [];

  const onSubmit = async (data: FormData) => {
    if (!user) {
      setError(t('error_not_logged_in'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Parse AI models if provided
      const aiModels = data.aiModels
        ? data.aiModels.split(',').map(m => m.trim()).filter(Boolean)
        : undefined;

      const payload = {
        platformId: isNewPlatform ? undefined : data.platformId,
        platformName: isNewPlatform ? data.platformName : undefined,
        slug,
        status: 'pending',
        freeCredit: data.freeCredit || undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: new Date(data.endDate),
        officialLink: data.officialLink,
        aiModels,
        usageLimits: data.usageLimits || undefined,
        submittedBy: user.id,
        translations: [
          {
            locale: 'zh', // Default to Chinese, will be auto-detected
            title: data.title,
            description: data.description || undefined,
            isAiGenerated: false,
          },
        ],
        conditionTagIds: data.conditionTagIds,
        autoTranslate: true, // Enable auto-translation
      };

      const response = await fetch('/api/campaigns/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || t('error_submission_failed'));
      }

      // Track campaign submission (Requirement 16.5)
      const platformName = isNewPlatform
        ? data.platformName || 'New Platform'
        : platforms.find(p => p.id === data.platformId)?.name || 'Unknown';
      trackCampaignSubmission(platformName, payload.autoTranslate);

      // Success! Redirect to success page
      router.push('/dashboard/submit-campaign/success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_submission_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConditionTag = (tagId: string) => {
    const current = selectedConditionTags;
    const newTags = current.includes(tagId)
      ? current.filter(id => id !== tagId)
      : [...current, tagId];
    setValue('conditionTagIds', newTags);
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Platform Selection */}
      <div>
        <label htmlFor="platformId" className="block text-sm font-medium text-gray-700">
          {t('field_platform')}
          {' '}
          <span className="text-red-500">*</span>
        </label>
        <div className="mt-1 space-y-2">
          <select
            id="platformId"
            {...register('platformId')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => {
              setIsNewPlatform(e.target.value === 'new');
              setValue('platformId', e.target.value);
            }}
          >
            <option value="">{t('select_platform')}</option>
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
            <option value="new">{t('create_new_platform')}</option>
          </select>
          {errors.platformId && (
            <p className="text-sm text-red-600">{errors.platformId.message}</p>
          )}
        </div>

        {/* New Platform Name */}
        {isNewPlatform && (
          <div className="mt-2">
            <input
              type="text"
              {...register('platformName')}
              placeholder={t('platform_name_placeholder')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Campaign Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          {t('field_title')}
          {' '}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          {...register('title')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('title_placeholder')}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          {t('field_description')}
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('description_placeholder')}
        />
        <p className="mt-1 text-sm text-gray-500">{t('description_hint')}</p>
      </div>

      {/* Free Credit */}
      <div>
        <label htmlFor="freeCredit" className="block text-sm font-medium text-gray-700">
          {t('field_free_credit')}
        </label>
        <input
          type="text"
          id="freeCredit"
          {...register('freeCredit')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('free_credit_placeholder')}
        />
        <p className="mt-1 text-sm text-gray-500">{t('free_credit_hint')}</p>
      </div>

      {/* Official Link */}
      <div>
        <label htmlFor="officialLink" className="block text-sm font-medium text-gray-700">
          {t('field_official_link')}
          {' '}
          <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          id="officialLink"
          {...register('officialLink')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://example.com/free-credit"
        />
        {errors.officialLink && (
          <p className="mt-1 text-sm text-red-600">{errors.officialLink.message}</p>
        )}
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            {t('field_start_date')}
          </label>
          <input
            type="date"
            id="startDate"
            {...register('startDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            {t('field_end_date')}
            {' '}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="endDate"
            {...register('endDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* AI Models */}
      <div>
        <label htmlFor="aiModels" className="block text-sm font-medium text-gray-700">
          {t('field_ai_models')}
        </label>
        <input
          type="text"
          id="aiModels"
          {...register('aiModels')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('ai_models_placeholder')}
        />
        <p className="mt-1 text-sm text-gray-500">{t('ai_models_hint')}</p>
      </div>

      {/* Usage Limits */}
      <div>
        <label htmlFor="usageLimits" className="block text-sm font-medium text-gray-700">
          {t('field_usage_limits')}
        </label>
        <textarea
          id="usageLimits"
          {...register('usageLimits')}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={t('usage_limits_placeholder')}
        />
      </div>

      {/* Condition Tags */}
      {conditionTags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('field_condition_tags')}
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {conditionTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleConditionTag(tag.id)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedConditionTags.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
          <p className="mt-1 text-sm text-gray-500">{t('condition_tags_hint')}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t('button_cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? t('button_submitting') : t('button_submit')}
        </button>
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="text-sm font-medium text-blue-900">{t('info_title')}</h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-800">
          <li>{t('info_review')}</li>
          <li>{t('info_translation')}</li>
          <li>{t('info_notification')}</li>
        </ul>
      </div>
    </form>
  );
}
