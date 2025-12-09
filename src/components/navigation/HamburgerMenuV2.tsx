/**
 * 汉堡菜单组件 V2
 * 使用统一导航配置
 */

'use client';

import { SignOutButton, useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getNavItems, getNavTranslationKey } from '@/config/navigation';
import { LocaleSwitcher } from '../LocaleSwitcher';

export function HamburgerMenuV2() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('Index');
  const tRoot = useTranslations('RootLayout');
  const tMenu = useTranslations('Menu');
  const { isSignedIn } = useAuth();

  // 获取导航项
  const navItems = getNavItems({
    isAuthenticated: isSignedIn || false,
    target: 'hamburger',
  });

  // 路由变化时关闭菜单
  useEffect(() => {
    // Close menu when pathname changes
    if (isOpen) {
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // 阻止背景滚动
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 检查是否激活
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/en' || pathname === '/zh';
    }
    return pathname.includes(href);
  };

  // 获取翻译文本
  const getLabel = (id: string) => {
    const key = getNavTranslationKey(id);
    // 尝试从不同命名空间获取翻译
    try {
      if (key.startsWith('nav_')) {
        return t(key as Parameters<typeof t>[0]);
      }
      return tRoot(key as Parameters<typeof tRoot>[0]);
    } catch {
      return id;
    }
  };

  return (
    <>
      {/* 汉堡按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex size-11 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none md:hidden"
        aria-label={tMenu('menu')}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* 遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 菜单面板 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-xl transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <h2 className="text-lg font-semibold text-gray-900">{tMenu('menu')}</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="flex size-11 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label={tMenu('close') || '关闭'}
            >
              <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 导航项 */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className={`flex min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{getLabel(item.id)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* 登出按钮 */}
            {isSignedIn && (
              <>
                <div className="my-6 border-t border-gray-200" />
                <SignOutButton>
                  <button
                    type="button"
                    className="flex min-h-[48px] w-full items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <span className="text-xl">🚪</span>
                    <span>{tRoot('sign_out')}</span>
                  </button>
                </SignOutButton>
              </>
            )}

            {/* 语言切换 */}
            <div className="my-6 border-t border-gray-200" />
            <div className="px-4">
              <p className="mb-2 text-sm font-medium text-gray-700">{tMenu('language')}</p>
              <LocaleSwitcher />
            </div>
          </nav>

          {/* 底部 */}
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
