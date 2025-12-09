import { SignOutButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { SkipLink } from '@/components/a11y';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { HamburgerMenuV2 } from '@/components/navigation/HamburgerMenuV2';
import { MobileBottomNavV2 } from '@/components/navigation/MobileBottomNavV2';
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

  const { userId } = await auth();

  return (
    <>
      {/* 可访问性：跳转链接 */}
      <SkipLink />

      {/* 移动端汉堡菜单 */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <HamburgerMenuV2 />
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
        {/* 主内容区域 - 添加 id 用于 SkipLink */}
        <main id="main-content" className="py-5 text-xl [&_p]:my-6">
          {props.children}
        </main>
      </BaseTemplate>

      {/* 移动端底部导航 */}
      <MobileBottomNavV2 />

      {/* 回到顶部按钮 */}
      <ScrollToTop />
    </>
  );
}
