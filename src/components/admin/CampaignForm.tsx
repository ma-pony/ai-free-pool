'use client';

import type { Campaign, ConditionTag } from '@/types/Campaign';
import type { Platform } from '@/types/Platform';
import type { CreateCampaignInput } from '@/validations/CampaignValidation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { CreateCampaignSchema } from '@/validations/CampaignValidation';

type CampaignFormProps = {
  campaign?: Campaign;
  onSubmit: (data: CreateCampaignInput) => Promise<void>;
  onCancel: () => void;
};

export function CampaignForm({ campaign, onSubmit, onCancel }: CampaignFormProps) {
  const t = useTranslations('Admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [conditionTags, setConditionTags] = useState<ConditionTag[]>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [selectedConditionTags, setSelectedConditionTags] = useState<string[]>(
    campaign?.conditionTags?.map(ct => ct.id) || [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    campaign?.tags?.map(t => t.id) || [],
  );
  const fetchedRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateCampaignSchema),
    defaultValues: campaign
      ? {
          platformId: campaign.platformId,
          slug: campaign.slug,
          status: campaign.status,
          freeCredit: campaign.freeCredit || undefined,
          startDate: campaign.startDate ? new Date(campaign.startDate) : undefined,
          endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
          officialLink: campaign.officialLink,
          aiModels: campaign.aiModels || undefined,
          usageLimits: campaign.usageLimits || undefined,
          difficultyLevel: campaign.difficultyLevel || undefined,
          isFeatured: campaign.isFeatured,
          featuredUntil: campaign.featuredUntil ? new Date(campaign.featuredUntil) : undefined,
          translations: campaign.translations?.map(t => ({
            locale: t.locale,
            title: t.title,
            description: t.description || undefined,
            isAiGenerated: t.isAiGenerated,
          })) || [],
          conditionTagIds: campaign.conditionTags?.map(ct => ct.id) || [],
        }
      : {
          status: 'pending' as const,
          isFeatured: false,
          translations: [{ locale: 'en' as const, title: '', description: '', isAiGenerated: false }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'translations',
  });

  // Fetch platforms, condition tags, and tags
  const fetchData = useCallback(async () => {
    try {
      const [platformsRes, conditionTagsRes, tagsRes] = await Promise.all([
        fetch('/api/platforms?status=all'),
        fetch('/api/condition-tags'),
        fetch('/api/tags'),
      ]);

      const platformsData = await platformsRes.json();
      const conditionTagsData = await conditionTagsRes.json();
      const tagsData = await tagsRes.json();

      if (platformsData.success) {
        setPlatforms(platformsData.data);
        // Re-set platformId after platforms are loaded (for edit mode)
        if (campaign?.platformId) {
          setValue('platformId', campaign.platformId);
        }
      }

      if (conditionTagsData.success) {
        setConditionTags(conditionTagsData.data);
      }

      if (tagsData.success) {
        setTags(tagsData.data);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, [campaign?.platformId, setValue]);

  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }
    fetchedRef.current = true;
    fetchData();
  }, [fetchData]);

  const onSubmitForm = async (data: unknown) => {
    setIsSubmitting(true);
    try {
      // Add selected condition tags and tags
      const submitData = {
        ...(data as CreateCampaignInput),
        conditionTagIds: selectedConditionTags,
        tagIds: selectedTags,
      };
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConditionTag = (tagId: string) => {
    setSelectedConditionTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId],
    );
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId],
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('basic_information')}</h3>

        <div>
          <label htmlFor="platformId" className="block text-sm font-medium text-gray-700">
            {t('platform')}
            {' '}
            *
          </label>
          <select
            {...register('platformId')}
            id="platformId"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">{t('select_platform')}</option>
            {platforms.map(platform => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
          {errors.platformId && (
            <p className="mt-1 text-sm text-red-600">{errors.platformId.message}</p>
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
            placeholder="e.g., openai-free-credit"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t('slug_hint')}
          </p>
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              {t('status')}
            </label>
            <select
              {...register('status')}
              id="status"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="pending">{t('status_pending')}</option>
              <option value="published">{t('status_published')}</option>
              <option value="rejected">{t('status_rejected')}</option>
              <option value="expired">{t('status_expired')}</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700">
              {t('campaign_difficulty')}
            </label>
            <select
              {...register('difficultyLevel')}
              id="difficultyLevel"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">{t('auto_calculate')}</option>
              <option value="easy">{t('easy')}</option>
              <option value="medium">{t('medium')}</option>
              <option value="hard">{t('hard')}</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              {t('difficulty_hint')}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="freeCredit" className="block text-sm font-medium text-gray-700">
            {t('free_credit')}
          </label>
          <input
            {...register('freeCredit')}
            type="text"
            id="freeCredit"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., $5 USD, 10000 tokens"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              {t('start_date')}
            </label>
            <input
              {...register('startDate')}
              type="date"
              id="startDate"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              {t('end_date')}
            </label>
            <input
              {...register('endDate')}
              type="date"
              id="endDate"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="officialLink" className="block text-sm font-medium text-gray-700">
            {t('official_link')}
            {' '}
            *
          </label>
          <input
            {...register('officialLink')}
            type="url"
            id="officialLink"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="https://example.com/campaign"
          />
          {errors.officialLink && (
            <p className="mt-1 text-sm text-red-600">{errors.officialLink.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="usageLimits" className="block text-sm font-medium text-gray-700">
            {t('usage_limits')}
          </label>
          <textarea
            {...register('usageLimits')}
            id="usageLimits"
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., 100 requests per day"
          />
        </div>
      </div>

      {/* Condition Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('condition_tags')}</h3>
        <p className="text-sm text-gray-600">
          {t('condition_tags_desc')}
        </p>

        <div className="flex flex-wrap gap-2">
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
              {tag.type === 'requirement' && ' 🔒'}
              {tag.type === 'benefit' && ' ✨'}
              <span className="ml-1 text-xs opacity-75">
                (
                {tag.difficultyWeight}
                )
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('tags_label')}</h3>
        <p className="text-sm text-gray-600">
          {t('tags_hint')}
        </p>

        {tags.length > 0
          ? (
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag.name}
                    {tag.type === 'category' && ' 📁'}
                    {tag.type === 'ai_model' && ' 🤖'}
                  </button>
                ))}
              </div>
            )
          : (
              <p className="text-sm text-gray-500">{t('no_tags_available')}</p>
            )}
      </div>

      {/* Translations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {t('translations')}
            {' '}
            *
          </h3>
          <button
            type="button"
            onClick={() =>
              append({ locale: 'zh', title: '', description: '', isAiGenerated: false })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {t('add_translation')}
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="rounded-lg border border-gray-200 p-4">
            <div className="mb-4 flex items-center justify-between">
              <select
                {...register(`translations.${index}.locale`)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t('remove')}
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('title')}
                  {' '}
                  *
                </label>
                <input
                  {...register(`translations.${index}.title`)}
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  placeholder="Campaign title"
                />
                {errors.translations?.[index]?.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.translations[index]?.title?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('description')}
                </label>
                <textarea
                  {...register(`translations.${index}.description`)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  placeholder="Campaign description"
                />
              </div>

              <div className="flex items-center">
                <input
                  {...register(`translations.${index}.isAiGenerated`)}
                  type="checkbox"
                  id={`ai-generated-${index}`}
                  className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor={`ai-generated-${index}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {t('ai_generated')}
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Featured */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t('featured_settings')}</h3>

        <div className="flex items-center">
          <input
            {...register('isFeatured')}
            type="checkbox"
            id="isFeatured"
            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
            {t('mark_as_featured')}
          </label>
        </div>

        {watch('isFeatured') && (
          <div>
            <label htmlFor="featuredUntil" className="block text-sm font-medium text-gray-700">
              {t('featured_until_date')}
            </label>
            <input
              {...register('featuredUntil')}
              type="date"
              id="featuredUntil"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
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
          {isSubmitting ? t('saving') : campaign ? t('update') : t('create')}
        </button>
      </div>
    </form>
  );
}
