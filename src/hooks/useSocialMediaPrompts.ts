'use client';

import { useEffect, useState } from 'react';
import { trackSocialMediaPrompt } from '@/libs/Analytics';

type PromptTrigger = 'welcome' | 'bookmark' | 'expired' | null;

const STORAGE_KEY = 'aifreepool_social_prompts';
const WELCOME_DISMISS_DAYS = 7;

type PromptState = {
  welcomeShown: boolean;
  welcomeDismissedAt: number | null;
  bookmarkPromptShown: boolean;
  bookmarkCount: number;
};

export function useSocialMediaPrompts() {
  const [showModal, setShowModal] = useState(false);
  const [trigger, setTrigger] = useState<PromptTrigger>(null);

  // Load state from localStorage
  const loadState = (): PromptState => {
    if (typeof window === 'undefined') {
      return {
        welcomeShown: false,
        welcomeDismissedAt: null,
        bookmarkPromptShown: false,
        bookmarkCount: 0,
      };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load social prompt state:', error);
    }

    return {
      welcomeShown: false,
      welcomeDismissedAt: null,
      bookmarkPromptShown: false,
      bookmarkCount: 0,
    };
  };

  // Save state to localStorage
  const saveState = (state: PromptState) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save social prompt state:', error);
    }
  };

  // Check if welcome prompt should be shown
  const shouldShowWelcome = (): boolean => {
    const state = loadState();

    // Never shown before
    if (!state.welcomeShown) {
      return true;
    }

    // Check if 7 days have passed since dismissal
    if (state.welcomeDismissedAt) {
      const daysSinceDismiss = (Date.now() - state.welcomeDismissedAt) / (1000 * 60 * 60 * 24);
      return daysSinceDismiss >= WELCOME_DISMISS_DAYS;
    }

    return false;
  };

  // Show welcome modal on first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      if (shouldShowWelcome()) {
        setTrigger('welcome');
        setShowModal(true);
        // Track prompt shown
        trackSocialMediaPrompt('welcome', 'shown');
      }
    }, 2000); // Show after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Track bookmark count
  const trackBookmark = () => {
    const state = loadState();
    const newCount = state.bookmarkCount + 1;

    // Show prompt after 3rd bookmark
    if (newCount === 3 && !state.bookmarkPromptShown) {
      setTrigger('bookmark');
      setShowModal(true);
      // Track prompt shown
      trackSocialMediaPrompt('bookmark_3rd', 'shown');

      saveState({
        ...state,
        bookmarkCount: newCount,
        bookmarkPromptShown: true,
      });
    } else {
      saveState({
        ...state,
        bookmarkCount: newCount,
      });
    }
  };

  // Show expired campaign prompt
  const showExpiredPrompt = () => {
    setTrigger('expired');
    setShowModal(true);
    // Track prompt shown
    trackSocialMediaPrompt('expired_campaign', 'shown');
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);

    // Mark welcome as shown
    if (trigger === 'welcome') {
      const state = loadState();
      saveState({
        ...state,
        welcomeShown: true,
        welcomeDismissedAt: Date.now(),
      });
    }

    // Reset trigger after a delay
    setTimeout(() => {
      setTrigger(null);
    }, 300);
  };

  // Manual trigger
  const openModal = (triggerType: PromptTrigger = null) => {
    setTrigger(triggerType);
    setShowModal(true);
  };

  return {
    showModal,
    trigger,
    closeModal,
    trackBookmark,
    showExpiredPrompt,
    openModal,
  };
}
