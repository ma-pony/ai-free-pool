/**
 * Submission Success Component
 * 提交成功页面 - 贡献激励
 */
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type SubmissionSuccessProps = {
  campaignTitle?: string;
  contributionCount?: number;
};

export default function SubmissionSuccess({
  campaignTitle = '您的活动',
  contributionCount = 0,
}: SubmissionSuccessProps) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // 3秒后隐藏彩带效果
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      {/* 彩带效果 */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).fill(0).map((_, i) => {
            // 预计算位置避免在渲染时调用 Math.random
            const particles = ['🎉', '🎊', '✨', '🌟', '💫'];
            return (
              <div
                key={i}
                className="animate-float absolute"
                style={{
                  left: `${(i * 5) % 100}%`,
                  top: `${(i * 7) % 100}%`,
                  animationDelay: `${(i * 0.1) % 2}s`,
                  fontSize: `${1 + (i % 4) * 0.25}rem`,
                }}
              >
                {particles[i % particles.length]}
              </div>
            );
          })}
        </div>
      )}

      {/* 主内容 */}
      <div className="animate-in zoom-in relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl duration-500 md:p-12">
        {/* 成功图标 */}
        <div className="animate-bounce-number mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-5xl shadow-lg">
          ✅
        </div>

        {/* 标题 */}
        <h1 className="mb-4 text-center text-3xl font-bold text-gray-900">
          🎉 提交成功！
        </h1>

        {/* 活动标题 */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <div className="mb-1 text-sm text-blue-700">您提交的活动</div>
          <div className="text-lg font-semibold text-blue-900">{campaignTitle}</div>
        </div>

        {/* 感谢信息 */}
        <div className="mb-8 space-y-4 text-center">
          <p className="text-lg text-gray-700">
            感谢您的贡献！您的分享让更多人发现了这个优质活动。
          </p>

          {/* 贡献统计 */}
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="mb-2 text-sm text-purple-700">您的贡献影响力</div>
            <div className="mb-1 text-4xl font-bold text-purple-600">
              {contributionCount > 0 ? contributionCount : '∞'}
            </div>
            <div className="text-sm text-purple-600">
              {contributionCount > 0
                ? `已帮助 ${contributionCount} 人发现优质活动`
                : '即将帮助无数人发现这个活动'}
            </div>
          </div>

          {/* 审核提示 */}
          <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div className="flex-1 text-left">
                <div className="mb-1 font-semibold text-yellow-900">审核中</div>
                <div className="text-sm text-yellow-700">
                  我们的团队将在 24 小时内审核您的提交。审核通过后，活动将自动发布并翻译为多种语言。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/campaigns"
            className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-center font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700 active:scale-95"
          >
            继续探索活动
          </Link>
          <Link
            href="/dashboard/profile?tab=submitted"
            className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 active:scale-95"
          >
            查看我的提交
          </Link>
        </div>

        {/* 社交分享提示 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            💡 提示：关注我们的社交媒体，第一时间了解审核结果
          </p>
        </div>
      </div>
    </div>
  );
}
