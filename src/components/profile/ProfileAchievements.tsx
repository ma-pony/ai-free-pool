/**
 * Profile Achievements Component
 * 个人资料页成就展示
 */
'use client';

import { useEffect, useState } from 'react';
import AchievementBadge from '@/components/AchievementBadge';

type ProfileAchievementsProps = {
  bookmarkCount: number;
};

export function ProfileAchievements({ bookmarkCount }: ProfileAchievementsProps) {
  const [showAchievement, setShowAchievement] = useState(false);

  // 检查是否刚达成新成就（从 localStorage 读取上次的数量）
  useEffect(() => {
    const lastCount = Number.parseInt(localStorage.getItem('lastBookmarkCount') || '0', 10);
    const milestones = [1, 5, 10, 20];

    // 检查是否刚达成新里程碑
    const justAchieved = milestones.some(
      milestone => bookmarkCount === milestone && lastCount < milestone,
    );

    if (justAchieved) {
      // 使用 setTimeout 避免同步 setState
      const timer = setTimeout(() => {
        setShowAchievement(true);
      }, 0);

      // 更新 localStorage
      localStorage.setItem('lastBookmarkCount', bookmarkCount.toString());

      return () => clearTimeout(timer);
    }

    // 更新 localStorage
    localStorage.setItem('lastBookmarkCount', bookmarkCount.toString());
    return undefined;
  }, [bookmarkCount]);

  return (
    <>
      {showAchievement && (
        <AchievementBadge
          bookmarkCount={bookmarkCount}
          onClose={() => setShowAchievement(false)}
        />
      )}
    </>
  );
}
