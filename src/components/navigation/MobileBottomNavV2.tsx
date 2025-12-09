/**
 * 移动端底部导航 V2
 * 使用统一导航配置
 */

'use client';

import { useAuth } from '@clerk/nextjs';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getNavItems, getNavTranslationKey } from '@/config/navigation';

// 图标映射
const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  home: active => (
    <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  campaigns: active => (
    <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  bookmarks: active => (
    <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
  profile: active => (
    <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  sign_in: active => (
    <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  sign_up: active => (
    <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
};

// 默认图标
const defaultIcon = (active: boolean) => (
  <svg className="size-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export function MobileBottomNavV2() {
  const pathname = usePathname();
  const t = useTranslations('Index');
  const tRoot = useTranslations('RootLayout');
  const { isSignedIn } = useAuth();

  // 获取移动端导航项
  const navItems = getNavItems({
    isAuthenticated: isSignedIn || false,
    target: 'mobile',
  });

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
      {/* 占位空间 */}
      <div className="h-16 md:hidden" />

      {/* 底部导航 */}
      <nav
        className="safe-area-bottom fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white shadow-lg md:hidden"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex h-16 items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            const IconComponent = ICONS[item.id] || defaultIcon;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex h-full min-w-[60px] flex-1 flex-col items-center justify-center transition-all active:scale-95 ${
                  active
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
                aria-label={getLabel(item.id)}
                aria-current={active ? 'page' : undefined}
              >
                <div className={`transition-transform ${active ? 'scale-110' : ''}`}>
                  {IconComponent(active)}
                </div>
                <span className={`mt-1 max-w-[60px] truncate text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                  {getLabel(item.id)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
