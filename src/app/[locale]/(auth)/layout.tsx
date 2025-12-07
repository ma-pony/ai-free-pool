import { ClerkProvider } from '@clerk/nextjs';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/libs/I18nRouting';
import { ClerkLocalizations } from '@/utils/AppConfig';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const clerkLocale = ClerkLocalizations.supportedLocales[locale as keyof typeof ClerkLocalizations.supportedLocales] ?? ClerkLocalizations.defaultLocale;
  let signInUrl = '/sign-in';
  let signUpUrl = '/sign-up';
  let profileUrl = '/dashboard/profile';
  let afterSignOutUrl = '/';

  if (locale !== routing.defaultLocale) {
    signInUrl = `/${locale}${signInUrl}`;
    signUpUrl = `/${locale}${signUpUrl}`;
    profileUrl = `/${locale}${profileUrl}`;
    afterSignOutUrl = `/${locale}${afterSignOutUrl}`;
  }

  return (
    <ClerkProvider
      appearance={{
        cssLayerName: 'clerk', // Ensure Clerk is compatible with Tailwind CSS v4
      }}
      localization={clerkLocale}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
      signInFallbackRedirectUrl={profileUrl}
      signUpFallbackRedirectUrl={profileUrl}
      afterSignOutUrl={afterSignOutUrl}
    >
      {props.children}
    </ClerkProvider>
  );
}
