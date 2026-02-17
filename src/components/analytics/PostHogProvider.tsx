'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { SuspendedPostHogPageView } from './PostHogPageView';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST;

// Init once at module level — 'use client' guarantees this runs in browser only
if (typeof window !== 'undefined' && POSTHOG_KEY && !posthog.__loaded) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // We capture manually in PostHogPageView
    capture_pageleave: true,
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.debug();
      }
    },
  });
}

export const PostHogProvider = (props: { children: React.ReactNode }) => {
  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {props.children}
    </PHProvider>
  );
};
