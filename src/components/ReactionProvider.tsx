'use client';

import { createContext, use, useCallback, useMemo, useRef, useState } from 'react';

export type ReactionStats = {
  stillWorks: number;
  expired: number;
  infoIncorrect: number;
  total: number;
};

type ReactionData = {
  stats: ReactionStats;
  userReaction: string | null;
};

type ReactionContextType = {
  reactionData: Map<string, ReactionData>;
  isLoading: boolean;
  getReactionData: (campaignId: string) => ReactionData | undefined;
  loadReactions: (campaignIds: string[]) => Promise<void>;
  updateReaction: (campaignId: string, data: ReactionData) => void;
};

const ReactionContext = createContext<ReactionContextType | null>(null);

export function ReactionProvider({ children }: { children: React.ReactNode }) {
  const [reactionData, setReactionData] = useState<Map<string, ReactionData>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const loadedIdsRef = useRef<Set<string>>(new Set());

  const loadReactions = useCallback(async (campaignIds: string[]) => {
    // Filter out already loaded IDs using ref (stable reference)
    const newIds = campaignIds.filter(id => !loadedIdsRef.current.has(id));
    if (newIds.length === 0) {
      return;
    }

    // Mark as loaded immediately to prevent duplicate calls
    newIds.forEach(id => loadedIdsRef.current.add(id));

    setIsLoading(true);
    try {
      const response = await fetch('/api/reactions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignIds: newIds }),
      });
      const data = await response.json();

      if (data.success && data.data) {
        setReactionData((prev) => {
          const newMap = new Map(prev);
          for (const [id, value] of Object.entries(data.data)) {
            newMap.set(id, value as ReactionData);
          }
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error loading batch reactions:', error);
      // Remove from loaded on error so it can be retried
      newIds.forEach(id => loadedIdsRef.current.delete(id));
    } finally {
      setIsLoading(false);
    }
  }, []); // No dependencies - uses ref

  const getReactionData = useCallback(
    (campaignId: string) => reactionData.get(campaignId),
    [reactionData],
  );

  const updateReaction = useCallback(
    (campaignId: string, data: ReactionData) => {
      setReactionData((prev) => {
        const newMap = new Map(prev);
        newMap.set(campaignId, data);
        return newMap;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      reactionData,
      isLoading,
      getReactionData,
      loadReactions,
      updateReaction,
    }),
    [reactionData, isLoading, getReactionData, loadReactions, updateReaction],
  );

  return (
    <ReactionContext value={value}>
      {children}
    </ReactionContext>
  );
}

export function useReaction() {
  const context = use(ReactionContext);
  if (!context) {
    throw new Error('useReaction must be used within a ReactionProvider');
  }
  return context;
}

export function useReactionOptional() {
  return use(ReactionContext);
}
