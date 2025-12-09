/**
 * 可访问性工具函数
 * 解决问题：颜色对比度问题
 *
 * 提供颜色对比度检查和推荐颜色
 */

/**
 * 计算相对亮度
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

/**
 * 解析十六进制颜色
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result && result[1] && result[2] && result[3]
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}

/**
 * 计算对比度
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return 0;
  }

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 检查是否满足 WCAG AA 标准
 * - 普通文本：4.5:1
 * - 大文本（18px+ 或 14px+ 粗体）：3:1
 */
export function meetsWCAG_AA(
  foreground: string,
  background: string,
  isLargeText = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * 检查是否满足 WCAG AAA 标准
 * - 普通文本：7:1
 * - 大文本：4.5:1
 */
export function meetsWCAG_AAA(
  foreground: string,
  background: string,
  isLargeText = false,
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * 推荐的颜色组合（已验证对比度）
 */
export const ACCESSIBLE_COLORS = {
  // 文本颜色（在白色背景上）
  text: {
    primary: '#111827', // gray-900, 对比度 ~16:1
    secondary: '#374151', // gray-700, 对比度 ~10:1
    tertiary: '#4B5563', // gray-600, 对比度 ~7:1
    muted: '#6B7280', // gray-500, 对比度 ~5:1 (仅用于大文本)
  },

  // 链接颜色
  link: {
    default: '#2563EB', // blue-600, 对比度 ~4.5:1
    hover: '#1D4ED8', // blue-700, 对比度 ~6:1
  },

  // 状态颜色（文本）
  status: {
    success: '#047857', // emerald-700
    warning: '#B45309', // amber-700
    error: '#B91C1C', // red-700
    info: '#1D4ED8', // blue-700
  },

  // 徽章颜色（背景 + 文本）
  badge: {
    success: { bg: '#D1FAE5', text: '#065F46' }, // emerald-100 + emerald-800
    warning: { bg: '#FEF3C7', text: '#92400E' }, // amber-100 + amber-800
    error: { bg: '#FEE2E2', text: '#991B1B' }, // red-100 + red-800
    info: { bg: '#DBEAFE', text: '#1E40AF' }, // blue-100 + blue-800
  },
} as const;

/**
 * 生成可访问的焦点样式
 */
export const FOCUS_STYLES = {
  // 默认焦点环
  ring: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',

  // 内部焦点环（用于深色背景）
  ringInset: 'focus:outline-none focus:ring-2 focus:ring-white focus:ring-inset',

  // 可见焦点（用于链接）
  visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
} as const;
