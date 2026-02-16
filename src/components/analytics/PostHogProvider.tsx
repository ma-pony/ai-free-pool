'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { SuspendedPostHogPageView } from './PostHogPageView';

export const PostHogProvider = (props: { children: React.ReactNode }) => {
  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {props.children}
    </PHProvider>
  );
};
