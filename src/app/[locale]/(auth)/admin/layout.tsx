import { auth } from '@clerk/nextjs/server';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  // Force admin panel to use Chinese locale
  if (locale !== 'zh') {
    redirect(`/zh/admin`);
  }

  setRequestLocale(locale);
  const t = await getTranslations({
    locale,
    namespace: 'AdminLayout',
  });

  // Check if user is authenticated and is admin
  const authData = await auth();
  const { userId } = authData;

  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  // Check admin permissions
  const { isAdmin } = await import('@/utils/AdminAuth');
  if (!isAdmin(authData)) {
    // User is authenticated but not an admin
    redirect(`/${locale}`);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar locale={locale} />

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {t('title', { default: 'AI Free Pool Admin' })}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications placeholder */}
              <button
                type="button"
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                aria-label="Notifications"
              >
                <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {/* User menu placeholder */}
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-medium text-white">
                  A
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {props.children}
        </main>
      </div>
    </div>
  );
}
