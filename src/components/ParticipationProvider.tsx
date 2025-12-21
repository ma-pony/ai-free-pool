'use client';

import { useAuth } from '@clerk/nextjs';
import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

type ParticipationContextType = {
  participatedCampaignIds: Set<string>;
  isLoading: boolean;
  hasParticipated: (campaignId: string) => boolean;
  toggleParticipation: (campaignId: string) => Promise<boolean>;
  refreshParticipations: () => Promise<void>;
};

const ParticipationContext = createContext<ParticipationContextType | null>(null);

export function ParticipationProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [participatedCampaignIds, setParticipatedCampaignIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all participated campaign IDs once on mount
  const fetchParticipations = useCallback(async () => {
    if (!isSignedIn) {
      setParticipatedCampaignIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/participations/ids');
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setParticipatedCampaignIds(new Set(data.data));
      }
    } catch (error) {
      console.error('Error fetching participation IDs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchParticipations();
  }, [fetchParticipations]);

  const hasParticipated = useCallback(
    (campaignId: string) => participatedCampaignIds.has(campaignId),
    [participatedCampaignIds],
  );

  const toggleParticipation = useCallback(
    async (campaignId: string): Promise<boolean> => {
      if (!isSignedIn) {
        return false;
      }

      try {
        const response = await fetch(`/api/participations/${campaignId}`, {
          method: 'POST',
        });
        const data = await response.json();

        if (data.success) {
          const newParticipated = data.data.participated;
          setParticipatedCampaignIds((prev) => {
            const newSet = new Set(prev);
            if (newParticipated) {
              newSet.add(campaignId);
            } else {
              newSet.delete(campaignId);
            }
            return newSet;
          });
          return newParticipated;
        }
      } catch (error) {
        console.error('Error toggling participation:', error);
      }
      return false;
    },
    [isSignedIn],
  );

  const value = useMemo(
    () => ({
      participatedCampaignIds,
      isLoading,
      hasParticipated,
      toggleParticipation,
      refreshParticipations: fetchParticipations,
    }),
    [participatedCampaignIds, isLoading, hasParticipated, toggleParticipation, fetchParticipations],
  );

  return (
    <ParticipationContext value={value}>
      {children}
    </ParticipationContext>
  );
}

export function useParticipation() {
  const context = use(ParticipationContext);
  if (!context) {
    throw new Error('useParticipation must be used within a ParticipationProvider');
  }
  return context;
}

// Optional hook that doesn't throw if used outside provider
export function useParticipationOptional() {
  return use(ParticipationContext);
}
