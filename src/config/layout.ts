/**
 * 统一布局配置
 * 解决问题：布局模板不统一
 *
 * 定义不同区域的布局特性，确保一致性
 */

export type LayoutType = 'marketing' | 'dashboard' | 'admin' | 'auth';

export type LayoutConfig = {
  // 是否显示顶部导航
  showHeader: boolean;
  // 是否显示移动端底部导航
  showMobileBottomNav: boolean;
  // 是否显示汉堡菜单
  showHamburgerMenu: boolean;
  // 是否显示回到顶部按钮
  showScrollToTop: boolean;
  // 是否显示页脚
  showFooter: boolean;
  // 是否显示侧边栏
  showSidebar: boolean;
  // 侧边栏类型
  sidebarType?: 'admin' | 'dashboard';
  // 最大内容宽度
  maxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  // 内容区域内边距
  contentPadding: boolean;
};

export const LAYOUT_CONFIGS: Record<LayoutType, LayoutConfig> = {
  // 营销页面：首页、活动列表、详情等
  marketing: {
    showHeader: true,
    showMobileBottomNav: true,
    showHamburgerMenu: true,
    showScrollToTop: true,
    showFooter: true,
    showSidebar: false,
    maxWidth: '2xl',
    contentPadding: true,
  },

  // 用户仪表盘：个人中心、提交活动等
  dashboard: {
    showHeader: true,
    showMobileBottomNav: true,
    showHamburgerMenu: true,
    showScrollToTop: true,
    showFooter: true,
    showSidebar: false,
    maxWidth: '2xl',
    contentPadding: true,
  },

  // 管理后台
  admin: {
    showHeader: false, // Admin 有自己的 header
    showMobileBottomNav: false,
    showHamburgerMenu: false,
    showScrollToTop: false,
    showFooter: false,
    showSidebar: true,
    sidebarType: 'admin',
    maxWidth: 'full',
    contentPadding: false,
  },

  // 认证页面：登录、注册
  auth: {
    showHeader: false,
    showMobileBottomNav: false,
    showHamburgerMenu: false,
    showScrollToTop: false,
    showFooter: false,
    showSidebar: false,
    maxWidth: 'sm',
    contentPadding: true,
  },
};

// 获取布局配置
export function getLayoutConfig(type: LayoutType): LayoutConfig {
  return LAYOUT_CONFIGS[type];
}

// 根据路径推断布局类型
export function inferLayoutType(pathname: string): LayoutType {
  if (pathname.includes('/admin')) {
    return 'admin';
  }
  if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) {
    return 'auth';
  }
  if (pathname.includes('/dashboard')) {
    return 'dashboard';
  }
  return 'marketing';
}
