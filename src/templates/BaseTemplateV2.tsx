/**
 * BaseTemplate V2 - 重构版本
 *
 * 改进：
 * - 集成 SkipLink 可访问性
 * - 使用统一动画配置
 * - 优化 header sticky 行为
 * - 添加 main-content id 用于 SkipLink
 */

'use client';

import Link from 'next/link';
import { SkipLink } from '@/components/a11y';
import SocialMediaIcons from '@/components/SocialMediaIcons';
import { TRANSITION_CLASSES } from '@/config/animations';
import { AppConfig } from '@/utils/AppConfig';

type BaseTemplateV2Props = {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
  showFooter?: boolean;
};

export function BaseTemplateV2({
  leftNav,
  rightNav,
  children,
  showFooter = true,
}: BaseTemplateV2Props) {
  return (
    <div className="w-full text-gray-700 antialiased">
      {/* 可访问性：跳转链接 */}
      <SkipLink />

      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <header className={`sticky top-0 z-40 -mx-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm ${TRANSITION_CLASSES.base}`}>
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className={`flex items-center gap-2 ${TRANSITION_CLASSES.colors}`}
            >
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-gray-900 sm:text-2xl">
                {AppConfig.name}
              </span>
            </Link>

            {/* Desktop Navigation - Left */}
            <nav aria-label="Main navigation" className="hidden md:block">
              <ul className="flex items-center gap-x-6 text-base">
                {leftNav}
              </ul>
            </nav>

            {/* Desktop Navigation - Right */}
            <nav className="hidden md:block">
              <ul className="flex items-center gap-x-4 text-base">
                {rightNav}
              </ul>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" className="min-h-[60vh] py-6">
          {children}
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="mb-16 border-t border-gray-200 py-8 md:mb-0">
            <div className="mx-auto max-w-5xl">
              {/* Social Media Section */}
              <div className="mb-6">
                <h3 className="mb-4 text-center text-base font-semibold text-gray-900">
                  Follow Us
                </h3>
                <div className="flex justify-center">
                  <SocialMediaIcons iconSize="md" variant="colored" showLabels />
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                  Stay updated with the latest AI free credit campaigns
                </p>
              </div>

              {/* Copyright */}
              <div className="text-center text-sm text-gray-500">
                {`© ${new Date().getFullYear()} ${AppConfig.name}. All rights reserved.`}
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
