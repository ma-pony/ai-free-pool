/**
 * 统一动画配置
 * 解决问题：过渡动画不一致
 *
 * 定义统一的动画时长和缓动函数
 */

// 动画时长（毫秒）
export const DURATION = {
  instant: 0,
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

// 缓动函数
export const EASING = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

// Tailwind 类名映射
export const TRANSITION_CLASSES = {
  // 基础过渡
  base: 'transition-all duration-200 ease-out',

  // 快速过渡（用于 hover 效果）
  fast: 'transition-all duration-150 ease-out',

  // 慢速过渡（用于页面切换）
  slow: 'transition-all duration-300 ease-out',

  // 颜色过渡
  colors: 'transition-colors duration-200 ease-out',

  // 透明度过渡
  opacity: 'transition-opacity duration-200 ease-out',

  // 变换过渡
  transform: 'transition-transform duration-200 ease-out',

  // 弹性过渡（用于按钮点击）
  spring: 'transition-transform duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
} as const;

// 动画类名
export const ANIMATION_CLASSES = {
  // 淡入
  fadeIn: 'animate-in fade-in duration-200',

  // 从右滑入
  slideInRight: 'animate-in slide-in-from-right duration-200',

  // 从左滑入
  slideInLeft: 'animate-in slide-in-from-left duration-200',

  // 从下滑入
  slideInBottom: 'animate-in slide-in-from-bottom duration-200',

  // 缩放进入
  scaleIn: 'animate-in zoom-in-95 duration-200',

  // 脉冲
  pulse: 'animate-pulse',

  // 旋转
  spin: 'animate-spin',
} as const;

// 交互反馈类名
export const INTERACTION_CLASSES = {
  // 按钮点击缩放
  buttonPress: 'active:scale-[0.98]',

  // 卡片悬停
  cardHover: 'hover:shadow-md hover:border-blue-300',

  // 链接悬停
  linkHover: 'hover:text-blue-600',

  // 图标按钮悬停
  iconHover: 'hover:bg-gray-100 active:bg-gray-200',
} as const;
