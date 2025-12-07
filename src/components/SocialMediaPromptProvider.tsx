'use client';

import type { ReactNode } from 'react';
import { createContext, use } from 'react';
import { useSocialMediaPrompts } from '@/hooks/useSocialMediaPrompts';
import SocialMediaModal from './SocialMediaModal';

type SocialMediaPromptContextType = {
  trackBookmark: () => void;
  showExpiredPrompt: () => void;
  openModal: (trigger?: 'welcome' | 'bookmark' | 'expired' | null) => void;
};

const SocialMediaPromptContext = createContext<SocialMediaPromptContextType | null>(null);

export function useSocialMediaPromptContext() {
  const context = use(SocialMediaPromptContext);
  if (!context) {
    throw new Error('useSocialMediaPromptContext must be used within SocialMediaPromptProvider');
  }
  return context;
}

type SocialMediaPromptProviderProps = {
  children: ReactNode;
};

export default function SocialMediaPromptProvider({ children }: SocialMediaPromptProviderProps) {
  const {
    showModal,
    trigger,
    closeModal,
    trackBookmark,
    showExpiredPrompt,
    openModal,
  } = useSocialMediaPrompts();

  return (
    <SocialMediaPromptContext
      value={{
        trackBookmark,
        showExpiredPrompt,
        openModal,
      }}
    >
      {children}
      <SocialMediaModal
        isOpen={showModal}
        onClose={closeModal}
        trigger={trigger || 'manual'}
      />
    </SocialMediaPromptContext>
  );
}
