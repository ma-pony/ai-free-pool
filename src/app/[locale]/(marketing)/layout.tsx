import { SignOutButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { HamburgerMenu } from '@/components/HamburgerMenu';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import MobileBottomNav from '@/components/MobileBottomNav';
import ScrollToTop from '@/components/ScrollToTop';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'RootLayout',
  });

  // Check if user is signed in
  const { userId } = await auth();

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <HamburgerMenu />
      </div>

      <BaseTemplate
        leftNav={(
          <>
            <li>
              <Link
                href="/"
                className="border-none text-gray-700 hover:text-gray-900"
              >
                {t('home_link')}
              </Link>
            </li>
            <li>
              <Link
                href="/campaigns"
                className="border-none text-gray-700 hover:text-gray-900"
              >
                {t('campaigns_link')}
              </Link>
            </li>
            <li>
              <Link
                href="/about/"
                className="border-none text-gray-700 hover:text-gray-900"
              >
                {t('about_link')}
              </Link>
            </li>
          </>
        )}
        rightNav={(
          <>
            {userId ? (
              // Show user menu when signed in
              <>
                <li>
                  <Link
                    href="/dashboard/profile/"
                    className="border-none text-gray-700 hover:text-gray-900"
                  >
                    {t('user_profile_link')}
                  </Link>
                </li>
                <li>
                  <SignOutButton>
                    <button className="border-none text-gray-700 hover:text-gray-900" type="button">
                      {t('sign_out')}
                    </button>
                  </SignOutButton>
                </li>
              </>
            ) : (
              // Show sign in/up when not signed in
              <>
                <li>
                  <Link
                    href="/sign-in/"
                    className="border-none text-gray-700 hover:text-gray-900"
                  >
                    {t('sign_in_link')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sign-up/"
                    className="border-none text-gray-700 hover:text-gray-900"
                  >
                    {t('sign_up_link')}
                  </Link>
                </li>
              </>
            )}

            <li>
              <LocaleSwitcher />
            </li>
          </>
        )}
      >
        <div className="py-5 text-xl [&_p]:my-6">{props.children}</div>
      </BaseTemplate>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}
