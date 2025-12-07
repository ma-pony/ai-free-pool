/**
 * Toast Notification Component
 * 用于显示操作反馈
 */
'use client';

import { useEffect, useState } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
};

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) {
    return null;
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className="animate-in slide-in-from-bottom fixed bottom-24 left-1/2 z-50 -translate-x-1/2 duration-300 md:bottom-8">
      <div className={`flex items-center gap-3 rounded-lg ${colors[type]} px-6 py-3 text-white shadow-lg`}>
        <span className="text-xl">{icons[type]}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
