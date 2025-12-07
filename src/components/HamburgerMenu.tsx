/**
 * Hamburger Menu Component
 * Validates: Requirements 14.4
 *
 * Mobile navigation menu with hamburger icon
 */

'use client';

import { SignOutButton, useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LocaleSwitcher } from './LocaleSwitcher';

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Index');
  const tMenu = useTranslations('Menu');
  const tRoot = useTranslations('RootLayout');
  const { isSignedIn } = useAuth();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    { name: t('nav_home'), path: '/', icon: '🏠' },
    { name: t('nav_campaigns'), path: '/campaigns', icon: '🎯' },
    { name: 'Platforms', path: '/platforms', icon: '🏢' },
    { name: 'Tags', path: '/tags', icon: '🏷️' },
    { name: 'About', path: '/about', icon: 'ℹ️' },
    { name: 'Submit', path: '/dashboard/submit-campaign', icon: '➕' },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none md:hidden"
        aria-label={tMenu('menu')}
        aria-expanded={isOpen}
      >
        {isOpen
          ? (
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )
          : (
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Menu Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{tMenu('menu')}</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label={tMenu('menu')}
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path
                  || (item.path !== '/' && pathname.startsWith(item.path));

                return (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* User Actions */}
            <div className="space-y-2">
              {isSignedIn
                ? (
                    <>
                      <Link
                        href="/dashboard/profile"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <span className="text-xl">👤</span>
                        <span>{tRoot('user_profile_link')}</span>
                      </Link>
                      <SignOutButton>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                        >
                          <span className="text-xl">🚪</span>
                          <span>{tRoot('sign_out')}</span>
                        </button>
                      </SignOutButton>
                    </>
                  )
                : (
                    <>
                      <Link
                        href="/sign-in"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <span className="text-xl">🔑</span>
                        <span>{tRoot('sign_in_link')}</span>
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <span className="text-xl">✨</span>
                        <span>{tRoot('sign_up_link')}</span>
                      </Link>
                    </>
                  )}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* Language Switcher */}
            <div className="px-4">
              <p className="mb-2 text-sm font-medium text-gray-700">{tMenu('language')}</p>
              <LocaleSwitcher />
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-4">
            <p className="text-center text-xs text-gray-500">
              AI Free Pool ©
              {' '}
              {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
