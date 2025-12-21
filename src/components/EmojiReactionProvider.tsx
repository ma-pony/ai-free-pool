'use client';

import { createContext, use, useCallback, useMemo, useRef, useState } from 'react';

export type EmojiReactionData = {
  emoji: string;
  count: number;
  userReacted: boolean;
};

type EmojiReactionContextType = {
  emojiData: Map<string, EmojiReactionData[]>;
  isLoading: boolean;
  getEmojiReactions: (campaignId: string) => EmojiReactionData[] | undefined;
  loadEmojiReactions: (campaignIds: string[]) => Promise<void>;
  updateEmojiReactions: (campaignId: string, data: EmojiReactionData[]) => void;
};

const EmojiReactionContext = createContext<EmojiReactionContextType | null>(null);

export function EmojiReactionProvider({ children }: { children: React.ReactNode }) {
  const [emojiData, setEmojiData] = useState<Map<string, EmojiReactionData[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const loadedIdsRef = useRef<Set<string>>(new Set());

  const loadEmojiReactions = useCallback(async (campaignIds: string[]) => {
    // Filter out already loaded IDs using ref (stable reference)
    const newIds = campaignIds.filter(id => !loadedIdsRef.current.has(id));
    if (newIds.length === 0) {
      return;
    }

    // Mark as loaded immediately to prevent duplicate calls
    newIds.forEach(id => loadedIdsRef.current.add(id));

    setIsLoading(true);
    try {
      const response = await fetch('/api/campaigns/emoji-reactions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignIds: newIds }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        setEmojiData((prev) => {
          const newMap = new Map(prev);
          for (const [id, value] of Object.entries(data.data)) {
            newMap.set(id, value as EmojiReactionData[]);
          }
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error loading batch emoji reactions:', error);
      // Remove from loaded on error so it can be retried
      newIds.forEach(id => loadedIdsRef.current.delete(id));
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - uses ref

  const getEmojiReactions = useCallback(
    (campaignId: string) => emojiData.get(campaignId),
    [emojiData],
  );

  const updateEmojiReactions = useCallback(
    (campaignId: string, data: EmojiReactionData[]) => {
      setEmojiData((prev) => {
        const newMap = new Map(prev);
        newMap.set(campaignId, data);
        return newMap;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      emojiData,
      isLoading,
      getEmojiReactions,
      loadEmojiReactions,
      updateEmojiReactions,
    }),
    [emojiData, isLoading, getEmojiReactions, loadEmojiReactions, updateEmojiReactions],
  );

  return (
    <EmojiReactionContext value={value}>
      {children}
    </EmojiReactionContext>
  );
}

export function useEmojiReaction() {
  const context = use(EmojiReactionContext);
  if (!context) {
    throw new Error('useEmojiReaction must be used within an EmojiReactionProvider');
  }
  return context;
}

export function useEmojiReactionOptional() {
  return use(EmojiReactionContext);
}
