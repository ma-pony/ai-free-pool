'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type CampaignEmojiStats = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

type CampaignEmojiReactionsProps = {
  campaignId: string;
  initialReactions?: CampaignEmojiStats[];
  compact?: boolean;
};

// Common emoji reactions for campaigns
const CAMPAIGN_EMOJIS = ['👍', '❤️', '🔥', '🎉', '😍', '🚀'];

/**
 * Emoji reaction buttons for campaigns
 * Similar to comment reactions but for campaign cards
 */
export function CampaignEmojiReactions({
  campaignId,
  initialReactions = [],
  compact = false,
}: CampaignEmojiReactionsProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [reactions, setReactions] = useState<CampaignEmojiStats[]>(initialReactions);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fetch reactions if not provided
  useEffect(() => {
    if (initialReactions.length === 0) {
      fetchReactions();
    }
  }, [campaignId]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/emoji-reactions`);

      if (!response.ok) {
        console.error('Failed to fetch reactions');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setReactions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (emoji: string, e: React.MouseEvent) => {
    // Prevent card click event
    e.preventDefault();
    e.stopPropagation();

    // Check authentication
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
        // Remove reaction if already reacted
        const response = await fetch(
          `/api/campaigns/${campaignId}/emoji-reactions/${encodeURIComponent(emoji)}`,
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
        // Add reaction
        const response = await fetch(
          `/api/campaigns/${campaignId}/emoji-reactions/${encodeURIComponent(emoji)}`,
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
  const availableEmojis = CAMPAIGN_EMOJIS.filter(
    emoji => !reactions.find(r => r.emoji === emoji && r.count > 0),
  );

  if (compact) {
    // Compact view for campaign cards
    return (
      <div className="flex flex-wrap items-center gap-1">
        {/* Show used reactions */}
        {usedReactions.map(reaction => (
          <button
            key={reaction.emoji}
            onClick={e => handleReaction(reaction.emoji, e)}
            disabled={isLoading}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all ${
              reaction.userReacted
                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
            title={reaction.userReacted ? 'Click to remove' : 'Click to react'}
          >
            <span>{reaction.emoji}</span>
            <span className="font-medium">{reaction.count}</span>
          </button>
        ))}

        {/* Add reaction button */}
        {availableEmojis.length > 0 && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
              title="Add reaction"
            >
              <span>😊</span>
              <span>+</span>
            </button>

            {/* Emoji picker dropdown */}
            {showEmojiPicker && (
              <div className="ring-opacity-5 absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-lg bg-white p-2 shadow-lg ring-1 ring-black">
                {availableEmojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={e => handleReaction(emoji, e)}
                    disabled={isLoading}
                    className="rounded p-1 text-lg hover:bg-gray-100 disabled:opacity-50"
                    title={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full view for campaign detail page
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {/* Show used reactions */}
        {usedReactions.map(reaction => (
          <button
            key={reaction.emoji}
            onClick={e => handleReaction(reaction.emoji, e)}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              reaction.userReacted
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            <span className="text-lg">{reaction.emoji}</span>
            <span>{reaction.count}</span>
          </button>
        ))}

        {/* Add reaction button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowEmojiPicker(!showEmojiPicker);
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            <span className="text-lg">😊</span>
            <span>Add Reaction</span>
          </button>

          {/* Emoji picker dropdown */}
          {showEmojiPicker && (
            <div className="ring-opacity-5 absolute top-full left-0 z-10 mt-1 flex gap-2 rounded-lg bg-white p-3 shadow-lg ring-1 ring-black">
              {CAMPAIGN_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={e => handleReaction(emoji, e)}
                  disabled={isLoading}
                  className="rounded-lg p-2 text-2xl hover:bg-gray-100 disabled:opacity-50"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
