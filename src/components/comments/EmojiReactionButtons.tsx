'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type EmojiReactionStats = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

type EmojiReactionButtonsProps = {
  commentId: string;
  initialReactions?: EmojiReactionStats[];
};

// Common emoji reactions
const COMMON_EMOJIS = ['👍', '👎', '😄', '🎉', '❤️', '🚀'];

/**
 * Emoji reaction buttons for comments
 * Validates: Requirements 6.5-6.7, Property 13
 */
export function EmojiReactionButtons({
  commentId,
  initialReactions = [],
}: EmojiReactionButtonsProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [reactions, setReactions] = useState<EmojiReactionStats[]>(initialReactions);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fetch reactions if not provided
  useEffect(() => {
    if (initialReactions.length === 0) {
      fetchReactions();
    }
  }, [commentId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/comments/${commentId}/reactions`);
      const data = await response.json();

      if (data.success) {
        setReactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (emoji: string) => {
    // Requirement 6.5: Check authentication
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setIsLoading(true);

    try {
      const existingReaction = reactions.find(
        r => r.emoji === emoji && r.userReacted,
      );

      if (existingReaction) {
        // Requirement 6.7: Remove reaction if already reacted
        const response = await fetch(
          `/api/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`,
          {
            method: 'DELETE',
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to remove reaction');
        }

        // Refresh reactions after removing
        await fetchReactions();
      } else {
        // Requirement 6.5: Add reaction
        const response = await fetch(
          `/api/comments/${commentId}/reactions/${encodeURIComponent(emoji)}`,
          {
            method: 'POST',
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to add reaction');
        }

        // Refresh reactions after adding
        await fetchReactions();
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    } finally {
      setIsLoading(false);
      setShowEmojiPicker(false);
    }
  };

  // Get reactions that have been used
  const usedReactions = reactions.filter(r => r.count > 0);

  // Get common emojis that haven't been used yet
  const availableEmojis = COMMON_EMOJIS.filter(
    emoji => !reactions.find(r => r.emoji === emoji && r.count > 0),
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Display existing reactions */}
      {usedReactions.map(reaction => (
        <button
          key={reaction.emoji}
          onClick={() => handleReaction(reaction.emoji)}
          disabled={isLoading}
          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-all ${
            reaction.userReacted
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          title={reaction.userReacted ? '取消反应' : '添加反应'}
        >
          <span>{reaction.emoji}</span>
          <span className="font-medium">{reaction.count}</span>
        </button>
      ))}

      {/* Add reaction button */}
      {isSignedIn && (
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isLoading}
            className="flex size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            title="添加反应"
          >
            <span className="text-lg">😊</span>
          </button>

          {/* Emoji picker dropdown */}
          {showEmojiPicker && (
            <>
              {/* Backdrop to close picker */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowEmojiPicker(false)}
              />

              {/* Emoji picker */}
              <div className="absolute bottom-full left-0 z-20 mb-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <div className="flex gap-1">
                  {availableEmojis.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="flex size-10 items-center justify-center rounded hover:bg-gray-100"
                      title={`添加 ${emoji}`}
                    >
                      <span className="text-xl">{emoji}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {!isSignedIn && usedReactions.length === 0 && (
        <p className="text-xs text-gray-500">
          登录后可添加反应
        </p>
      )}
    </div>
  );
}
