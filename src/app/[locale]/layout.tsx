import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import SocialMediaPromptProvider from '@/components/SocialMediaPromptProvider';
import { routing } from '@/libs/I18nRouting';
import '@/styles/global.css';

export const metadata: Metadata = {
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
      <body suppressHydrationWarning>
        <ClerkProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <PostHogProvider>
              <SocialMediaPromptProvider>
                {props.children}
              </SocialMediaPromptProvider>
            </PostHogProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
