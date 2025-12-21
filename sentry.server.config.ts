// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// Sentry is disabled - uncomment below to re-enable
// import * as Sentry from '@sentry/nextjs';

// if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
//   Sentry.init({
//     dsn: 'https://9e2dcf3345f11c5ce6351945220b37a9@o4509456782000128.ingest.us.sentry.io/4510463979814912',
//
//     // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
//     tracesSampleRate: 0.5,
//
//     // Enable logs to be sent to Sentry
//     enableLogs: true,
//
//     // Enable sending user PII (Personally Identifiable Information)
//     // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
//     sendDefaultPii: true,
//   });
// }
