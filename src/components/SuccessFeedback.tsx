/**
 * Success Feedback Component
 * 成功反馈 - 操作成功后的庆祝动画
 * 使用 Portal 渲染到 body，避免与父组件的 hover 状态冲突
 */
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type SuccessFeedbackProps = {
  message: string;
  subMessage?: string;
  icon?: string;
  duration?: number;
  onClose?: () => void;
};

export default function SuccessFeedback({
  message,
  subMessage,
  icon = '🎉',
  duration = 3000,
  onClose,
}: SuccessFeedbackProps) {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 确保只在客户端渲染
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!show || !mounted) {
    return null;
  }

  const content = (
    <div className="pointer-events-none fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="animate-in zoom-in relative max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl duration-300">
        {/* 成功图标 */}
        <div className="animate-bounce-number mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-linear-to-br from-green-400 to-emerald-500 text-4xl shadow-lg">
          {icon}
        </div>

        {/* 成功消息 */}
        <h3 className="mb-2 text-xl font-bold text-gray-900">
          {message}
        </h3>

        {/* 子消息 */}
        {subMessage && (
          <p className="text-gray-600">
            {subMessage}
          </p>
        )}

        {/* 装饰性粒子效果 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array.from({ length: 6 })].map((_, i) => (
            <div
              key={i}
              className="animate-float absolute"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + (i % 2) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                fontSize: '1.5rem',
              }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 使用 Portal 渲染到 body，完全脱离父组件的 DOM 结构
  return createPortal(content, document.body);
}
