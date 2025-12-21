'use client';

import { useAuth } from '@clerk/nextjs';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

type BookmarkContextType = {
  bookmarkedCampaignIds: Set<string>;
  isLoading: boolean;
  hasBookmarked: (campaignId: string) => boolean;
  toggleBookmark: (campaignId: string) => Promise<boolean>;
  refreshBookmarks: () => Promise<void>;
};

const BookmarkContext = createContext<BookmarkContextType | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [bookmarkedCampaignIds, setBookmarkedCampaignIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all bookmarked campaign IDs once on mount
  const fetchBookmarks = useCallback(async () => {
    if (!isSignedIn) {
      setBookmarkedCampaignIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bookmarks/ids');
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setBookmarkedCampaignIds(new Set(data.data));
      }
    } catch (error) {
      console.error('Error fetching bookmark IDs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const hasBookmarked = useCallback(
    (campaignId: string) => bookmarkedCampaignIds.has(campaignId),
    [bookmarkedCampaignIds],
  );

  const toggleBookmark = useCallback(
    async (campaignId: string): Promise<boolean> => {
      if (!isSignedIn) {
        return false;
      }

      try {
        const response = await fetch(`/api/bookmarks/${campaignId}`, {
          method: 'POST',
        });
        const data = await response.json();

        if (data.success) {
          const newBookmarked = data.data.bookmarked;
          setBookmarkedCampaignIds((prev) => {
            const newSet = new Set(prev);
            if (newBookmarked) {
              newSet.add(campaignId);
            } else {
              newSet.delete(campaignId);
            }
            return newSet;
          });
          return newBookmarked;
        }
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
      return false;
    },
    [isSignedIn],
  );

  const value = useMemo(
    () => ({
      bookmarkedCampaignIds,
      isLoading,
      hasBookmarked,
      toggleBookmark,
      refreshBookmarks: fetchBookmarks,
    }),
    [bookmarkedCampaignIds, isLoading, hasBookmarked, toggleBookmark, fetchBookmarks],
  );

  return (
    <BookmarkContext value={value}>
      {children}
    </BookmarkContext>
  );
}

export function useBookmark() {
  const context = use(BookmarkContext);
  if (!context) {
    throw new Error('useBookmark must be used within a BookmarkProvider');
  }
  return context;
}

// Optional hook that doesn't throw if used outside provider
export function useBookmarkOptional() {
  return use(BookmarkContext);
}
