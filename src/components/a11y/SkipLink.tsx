/**
 * Skip to Content 链接
 * 解决问题：缺少 skip-to-content 链接
 *
 * 允许键盘用户跳过导航直接到主内容
 */

'use client';

import { useTranslations } from 'next-intl';

type SkipLinkProps = {
  targetId?: string;
};

export function SkipLink({ targetId = 'main-content' }: SkipLinkProps) {
  const t = useTranslations('A11y');

  return (
    <a
      href={`#${targetId}`}
      className="fixed top-0 left-0 z-9999 -translate-y-full rounded-br-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
    >
      {t('skip_to_content') || 'Skip to main content'}
    </a>
  );
}
