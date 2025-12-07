'use client';

import { useState } from 'react';

type ShareButtonProps = {
  title: string;
  description: string;
  shareLabel: string;
};

/**
 * Share Button Component
 * Client component for sharing functionality
 */
export function ShareButton({ title, description, shareLabel }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard();
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:border-blue-500 hover:text-blue-600"
    >
      <span>{copied ? '✓' : '🔗'}</span>
      <span>{copied ? 'Copied!' : shareLabel}</span>
    </button>
  );
}
