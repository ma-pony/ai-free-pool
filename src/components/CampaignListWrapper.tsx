'use client';

import { useEffect, useRef } from 'react';
import { useEmojiReactionOptional } from './EmojiReactionProvider';
import { useReactionOptional } from './ReactionProvider';

type CampaignListWrapperProps = {
  campaignIds: string[];
  children: React.ReactNode;
};

/**
 * Wrapper component that triggers batch loading of reactions and emoji reactions
 * for a list of campaigns. This avoids N+1 API calls.
 */
export function CampaignListWrapper({ campaignIds, children }: CampaignListWrapperProps) {
  const reactionContext = useReactionOptional();
  const emojiContext = useEmojiReactionOptional();

  // Use ref to track if we've already loaded for this set of IDs
  const loadedRef = useRef<string>('');
  const idsKey = campaignIds.sort().join(',');

  useEffect(() => {
    // Skip if already loaded for these IDs or no IDs
    if (campaignIds.length === 0 || loadedRef.current === idsKey) {
      return;
    }

    loadedRef.current = idsKey;

    // Batch load reactions
    if (reactionContext) {
      reactionContext.loadReactions(campaignIds);
    }

    // Batch load emoji reactions
    if (emojiContext) {
      emojiContext.loadEmojiReactions(campaignIds);
    }
  }, [idsKey]); // Only depend on the IDs key

  return <>{children}</>;
}
