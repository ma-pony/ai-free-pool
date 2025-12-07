'use client';

import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSocialMediaPromptContext } from './SocialMediaPromptProvider';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations('Index');
  const tRoot = useTranslations('RootLayout');
  const { isSignedIn } = useAuth();
  const { openModal } = useSocialMediaPromptContext();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/en' || pathname === '/zh';
    }
    return pathname.includes(path);
  };

  // Base navigation items (always shown)
  const baseNavItems = [
    {
      name: t('nav_home'),
      path: '/',
      icon: (active: boolean) => (
        <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: t('nav_campaigns'),
      path: '/campaigns',
      icon: (active: boolean) => (
        <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
  ];

  // User-specific navigation items (shown when signed in)
  const userNavItems = [
    {
      name: t('nav_bookmarks'),
      path: '/dashboard/profile?tab=bookmarks',
      icon: (active: boolean) => (
        <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
    },
    {
      name: t('nav_profile'),
      path: '/dashboard/profile',
      icon: (active: boolean) => (
        <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  // Guest navigation items (shown when not signed in)
  const guestNavItems = [
    {
      name: tRoot('sign_in_link'),
      path: '/sign-in',
      icon: (active: boolean) => (
        <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      ),
    },
    {
      name: tRoot('sign_up_link'),
      path: '/sign-up',
      icon: (active: boolean) => (
        <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
  ];

  const navItems = [...baseNavItems, ...(isSignedIn ? userNavItems : guestNavItems)];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-16 md:hidden" />

      {/* Mobile Bottom Navigation */}
      <nav
        className="safe-area-bottom fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex h-full min-w-[60px] flex-1 flex-col items-center justify-center transition-all active:scale-95 ${
                  active
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-500 active:text-primary-600'
                }`}
                aria-label={item.name}
                aria-current={active ? 'page' : undefined}
              >
                <div className={`transition-transform ${active ? 'scale-110' : ''}`}>
                  {item.icon(active)}
                </div>
                <span className={`mt-1 max-w-[60px] truncate text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Social Media Button */}
          <button
            onClick={() => openModal()}
            className="flex h-full min-w-[60px] flex-1 flex-col items-center justify-center text-gray-600 transition-all hover:text-primary-500 active:scale-95 active:text-primary-600"
            type="button"
            aria-label={t('nav_follow')}
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            <span className="mt-1 max-w-[60px] truncate text-xs font-medium">{t('nav_follow')}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
