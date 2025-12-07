'use client';

import { SignOutButton } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};

export function AdminSidebar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('Admin');

  // Navigation items
  const navigation: NavItem[] = [
    {
      name: t('dashboard'),
      href: `/${locale}/admin`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: t('pending'),
      href: `/${locale}/admin/pending`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      badge: 0, // Will be updated dynamically
    },
    {
      name: t('verify'),
      href: `/${locale}/admin/verification-needed`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      badge: 0, // Will be updated dynamically
    },
    {
      name: t('campaigns'),
      href: `/${locale}/admin/campaigns`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: t('platforms'),
      href: `/${locale}/admin/platforms`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      name: t('import'),
      href: `/${locale}/admin/import`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
    {
      name: t('featured'),
      href: `/${locale}/admin/featured`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      name: t('tags'),
      href: `/${locale}/admin/tags`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      name: t('settings'),
      href: `/${locale}/admin/settings`,
      icon: (
        <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}/admin`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 z-50 flex items-center p-4 lg:hidden">
        <button
          type="button"
          className="rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="bg-opacity-75 fixed inset-0 z-40 bg-gray-600 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
            <Link href={`/${locale}/admin`} className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <span className="font-semibold text-white">Admin</span>
            </Link>
            <button
              type="button"
              className="rounded-md p-2 text-gray-400 hover:bg-slate-700 hover:text-white lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'border-l-4 border-indigo-500 bg-slate-900 text-white'
                      : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <span className={active ? 'text-indigo-400' : 'text-gray-400 group-hover:text-gray-300'}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      item.name === 'Pending' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
                    }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="space-y-2 border-t border-slate-700 p-4">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700 hover:text-white"
            >
              <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>{t('back_to_site')}</span>
            </Link>
            <SignOutButton>
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{t('sign_out')}</span>
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>
    </>
  );
}
