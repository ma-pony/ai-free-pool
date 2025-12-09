/**
 * Achievement Badge Component
 * 成就徽章 - 收藏里程碑
 */
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  color: string;
};

const getAchievements = (t: any): Achievement[] => [
  {
    id: 'first_bookmark',
    title: t('achievement_first_bookmark'),
    description: t('achievement_first_bookmark_desc'),
    icon: '🌟',
    threshold: 1,
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'collector',
    title: t('achievement_collector'),
    description: t('achievement_collector_desc'),
    icon: '📚',
    threshold: 5,
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'enthusiast',
    title: t('achievement_enthusiast'),
    description: t('achievement_enthusiast_desc'),
    icon: '🎯',
    threshold: 10,
    color: 'from-orange-400 to-orange-600',
  },
  {
    id: 'master',
    title: t('achievement_master'),
    description: t('achievement_master_desc'),
    icon: '👑',
    threshold: 20,
    color: 'from-yellow-400 to-yellow-600',
  },
];

type AchievementBadgeProps = {
  bookmarkCount: number;
  onClose?: () => void;
};

export default function AchievementBadge({ bookmarkCount, onClose }: AchievementBadgeProps) {
  const t = useTranslations('Profile');
  const [show, setShow] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const achievements = getAchievements(t);
    // 检查是否达成新成就
    const newAchievement = achievements.find(
      a => a.threshold === bookmarkCount,
    );

    if (newAchievement) {
      // 使用 setTimeout 避免同步 setState
      const showTimer = setTimeout(() => {
        setCurrentAchievement(newAchievement);
        setShow(true);
      }, 0);

      // 5秒后自动关闭
      const closeTimer = setTimeout(() => {
        setShow(false);
        setTimeout(() => onClose?.(), 300);
      }, 5000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(closeTimer);
      };
    }
    return undefined;
  }, [bookmarkCount, onClose, t]);

  if (!show || !currentAchievement) {
    return null;
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 duration-300">
      <div className="animate-in zoom-in relative max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl duration-500">
        {/* 关闭按钮 */}
        <button
          onClick={() => {
            setShow(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 成就图标 */}
        <div className={`mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-gradient-to-br ${currentAchievement.color} animate-bounce-number text-5xl shadow-lg`}>
          {currentAchievement.icon}
        </div>

        {/* 成就标题 */}
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          🎉
          {' '}
          {t('achievement_unlocked')}
        </h2>

        {/* 成就名称 */}
        <h3 className="mb-2 text-xl font-semibold text-gray-800">
          {currentAchievement.title}
        </h3>

        {/* 成就描述 */}
        <p className="mb-4 text-gray-600">
          {currentAchievement.description}
        </p>

        {/* 估算节省金额 */}
        <div className="rounded-lg bg-green-50 p-4">
          <div className="text-sm text-green-700">{t('achievement_estimated_savings')}</div>
          <div className="text-2xl font-bold text-green-600">
            $
            {bookmarkCount * 10}
            +
          </div>
          <div className="text-xs text-green-600">{t('achievement_based_on_average')}</div>
        </div>

        {/* 继续探索按钮 */}
        <button
          onClick={() => {
            setShow(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700 active:scale-95"
        >
          {t('achievement_continue')}
          {' '}
          →
        </button>
      </div>
    </div>
  );
}
