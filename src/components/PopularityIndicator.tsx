/**
 * Popularity Indicator Component
 * 热度指示器 - 显示活动热度
 */
'use client';

type PopularityIndicatorProps = {
  viewCount?: number;
  bookmarkCount?: number;
  reactionCount?: number;
  compact?: boolean;
};

export default function PopularityIndicator({
  viewCount = 0,
  bookmarkCount = 0,
  reactionCount = 0,
  compact = false,
}: PopularityIndicatorProps) {
  // 计算热度分数
  const popularityScore = viewCount * 0.1 + bookmarkCount * 2 + reactionCount * 1.5;

  // 判断热度等级
  const getPopularityLevel = () => {
    if (popularityScore >= 100) {
      return { label: '🔥 超级热门', color: 'bg-red-500', textColor: 'text-red-600' };
    }
    if (popularityScore >= 50) {
      return { label: '🔥 热门', color: 'bg-orange-500', textColor: 'text-orange-600' };
    }
    if (popularityScore >= 20) {
      return { label: '📈 上升中', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    }
    return null;
  };

  const level = getPopularityLevel();

  if (!level) {
    return null;
  }

  if (compact) {
    return (
      <div className="animate-pulse-ring inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-md">
        <span>{level.label.split(' ')[0]}</span>
        <span className="hidden sm:inline">{level.label.split(' ')[1]}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="mb-2 flex items-center justify-center gap-2">
        <span className="text-2xl">{level.label.split(' ')[0]}</span>
        <span className="text-lg font-bold text-orange-600">{level.label.split(' ')[1]}</span>
      </div>

      <div className="space-y-2 text-sm">
        {viewCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">👀 浏览量</span>
            <span className="font-semibold text-gray-900">{viewCount.toLocaleString()}</span>
          </div>
        )}
        {bookmarkCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">📌 收藏数</span>
            <span className="font-semibold text-gray-900">{bookmarkCount.toLocaleString()}</span>
          </div>
        )}
        {reactionCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">👍 反馈数</span>
            <span className="font-semibold text-gray-900">{reactionCount.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-xs text-gray-500">
        本周已有
        {' '}
        {Math.floor(viewCount * 0.3)}
        {' '}
        人领取
      </div>
    </div>
  );
}
