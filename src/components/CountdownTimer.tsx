/**
 * Countdown Timer Component
 * 倒计时组件 - 增强紧迫感（FOMO）
 */
'use client';

import { useEffect, useState } from 'react';

type CountdownTimerProps = {
  endDate: Date;
  compact?: boolean;
};

export default function CountdownTimer({ endDate, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = new Date(endDate).getTime() - Date.now();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.expired) {
    return (
      <div className="text-sm font-medium text-red-600">
        已过期
      </div>
    );
  }

  // 根据剩余时间选择颜色
  const getColorClass = () => {
    if (timeLeft.days <= 1) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (timeLeft.days <= 3) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    }
    if (timeLeft.days <= 7) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium ${getColorClass()}`}>
        <span>⏰</span>
        {timeLeft.days > 0
          ? (
              <span>
                还剩
                {timeLeft.days}
                {' '}
                天
              </span>
            )
          : (
              <span>
                {String(timeLeft.hours).padStart(2, '0')}
                :
                {String(timeLeft.minutes).padStart(2, '0')}
                :
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border-2 p-4 ${getColorClass()}`}>
      <div className="mb-2 text-center text-sm font-semibold">
        {timeLeft.days <= 1 ? '⚠️ 即将过期' : '⏰ 剩余时间'}
      </div>
      <div className="flex items-center justify-center gap-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className="text-2xl font-bold">{timeLeft.days}</div>
            <div className="text-xs">天</div>
          </div>
        )}
        {(timeLeft.days > 0 || timeLeft.hours > 0) && (
          <>
            {timeLeft.days > 0 && <div className="text-xl">:</div>}
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs">时</div>
            </div>
          </>
        )}
        <div className="text-xl">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs">分</div>
        </div>
        <div className="text-xl">:</div>
        <div className="flex flex-col items-center">
          <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs">秒</div>
        </div>
      </div>
    </div>
  );
}
