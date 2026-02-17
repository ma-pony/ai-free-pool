import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { BookmarkProvider } from '@/components/BookmarkProvider';
import { EmojiReactionProvider } from '@/components/EmojiReactionProvider';
import { ToastProvider } from '@/components/feedback';
import { ParticipationProvider } from '@/components/ParticipationProvider';
import { ReactionProvider } from '@/components/ReactionProvider';
import SocialMediaPromptProvider from '@/components/SocialMediaPromptProvider';
import { routing } from '@/libs/I18nRouting';
import '@/styles/global.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://aifreepool.com'),
  icons: [
    {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'icon',
      url: '/favicon.ico',
    },
  ],
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // Load messages for client components
  const messages = (await import(`../../locales/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-8425376455595468" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8425376455595468"
          crossOrigin="anonymous"
        />
        {/* PostHog Analytics */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once setConfig register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getOneClickSurveyDiscount getSurveys getActiveMatchingSurveys getSessionReplayUrl decide".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}', {
                api_host: '${process.env.NEXT_PUBLIC_POSTHOG_HOST}',
                capture_pageview: false,
                capture_pageleave: true,
              });
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ClerkProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <PostHogProvider>
              {/* ToastProvider 用于全局通知 */}
              <ToastProvider>
                <SocialMediaPromptProvider>
                  {/* Providers 用于批量获取状态，避免N+1问题 */}
                  <BookmarkProvider>
                    <ParticipationProvider>
                      <ReactionProvider>
                        <EmojiReactionProvider>
                          {props.children}
                        </EmojiReactionProvider>
                      </ReactionProvider>
                    </ParticipationProvider>
                  </BookmarkProvider>
                </SocialMediaPromptProvider>
              </ToastProvider>
            </PostHogProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
