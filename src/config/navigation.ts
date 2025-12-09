/**
 * 统一导航配置
 * 解决问题：导航系统不一致
 *
 * 所有导航组件从此配置读取，确保一致性
 */

export type NavItem = {
  id: string;
  icon: string;
  href: string;
  requiresAuth?: boolean;
  hideWhenAuth?: boolean;
  showInHeader?: boolean;
  showInMobile?: boolean;
  showInHamburger?: boolean;
};

// 主导航项配置
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    icon: '🏠',
    href: '/',
    showInHeader: true,
    showInMobile: true,
    showInHamburger: true,
  },
  {
    id: 'campaigns',
    icon: '🎯',
    href: '/campaigns',
    showInHeader: true,
    showInMobile: true,
    showInHamburger: true,
  },
  {
    id: 'platforms',
    icon: '🏢',
    href: '/platforms',
    showInHeader: false,
    showInMobile: false,
    showInHamburger: true,
  },
  {
    id: 'tags',
    icon: '🏷️',
    href: '/tags',
    showInHeader: false,
    showInMobile: false,
    showInHamburger: true,
  },
  {
    id: 'about',
    icon: 'ℹ️',
    href: '/about',
    showInHeader: true,
    showInMobile: false,
    showInHamburger: true,
  },
];

// 用户相关导航项
export const USER_NAV_ITEMS: NavItem[] = [
  {
    id: 'submit',
    icon: '➕',
    href: '/dashboard/submit-campaign',
    requiresAuth: true,
    showInHeader: false,
    showInMobile: false,
    showInHamburger: true,
  },
  {
    id: 'bookmarks',
    icon: '🔖',
    href: '/dashboard/profile?tab=bookmarks',
    requiresAuth: true,
    showInHeader: false,
    showInMobile: true,
    showInHamburger: false,
  },
  {
    id: 'profile',
    icon: '👤',
    href: '/dashboard/profile',
    requiresAuth: true,
    showInHeader: true,
    showInMobile: true,
    showInHamburger: true,
  },
];

// 认证导航项
export const AUTH_NAV_ITEMS: NavItem[] = [
  {
    id: 'sign_in',
    icon: '🔑',
    href: '/sign-in',
    hideWhenAuth: true,
    showInHeader: true,
    showInMobile: true,
    showInHamburger: true,
  },
  {
    id: 'sign_up',
    icon: '✨',
    href: '/sign-up',
    hideWhenAuth: true,
    showInHeader: true,
    showInMobile: true,
    showInHamburger: true,
  },
];

// 辅助函数：根据条件过滤导航项
export function getNavItems(options: {
  isAuthenticated: boolean;
  target: 'header' | 'mobile' | 'hamburger';
}): NavItem[] {
  const { isAuthenticated, target } = options;

  const filterKey = target === 'header'
    ? 'showInHeader'
    : target === 'mobile'
      ? 'showInMobile'
      : 'showInHamburger';

  const allItems = [...NAV_ITEMS, ...USER_NAV_ITEMS, ...AUTH_NAV_ITEMS];

  return allItems.filter((item) => {
    // 检查是否在目标位置显示
    if (!item[filterKey]) {
      return false;
    }

    // 检查认证状态
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }
    if (item.hideWhenAuth && isAuthenticated) {
      return false;
    }

    return true;
  });
}

// 获取导航项的翻译key
export function getNavTranslationKey(id: string): string {
  const keyMap: Record<string, string> = {
    home: 'nav_home',
    campaigns: 'nav_campaigns',
    platforms: 'nav_platforms',
    tags: 'nav_tags',
    about: 'nav_about',
    submit: 'nav_submit',
    bookmarks: 'nav_bookmarks',
    profile: 'nav_profile',
    sign_in: 'sign_in_link',
    sign_up: 'sign_up_link',
  };
  return keyMap[id] || id;
}
