import { SignOutButton } from '@clerk/nextjs';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { BaseTemplate } from '@/templates/BaseTemplate';

export default async function DashboardLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'DashboardLayout',
  });

  return (
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
              href="/dashboard/profile/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              {t('user_profile_link')}
            </Link>
          </li>
        </>
      )}
      rightNav={(
        <>
          <li>
            <SignOutButton>
              <button className="border-none text-gray-700 hover:text-gray-900" type="button">
                {t('sign_out')}
              </button>
            </SignOutButton>
          </li>

          <li>
            <LocaleSwitcher />
          </li>
        </>
      )}
    >
      {props.children}
    </BaseTemplate>
  );
}
