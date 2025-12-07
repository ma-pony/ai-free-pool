'use client';

import Link from 'next/link';
import SocialMediaIcons from '@/components/SocialMediaIcons';
import { AppConfig } from '@/utils/AppConfig';

export const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="w-full text-gray-700 antialiased">
      <div className="mx-auto max-w-7xl px-4">
        {/* Compact Header */}
        <header className="sticky top-0 z-40 -mx-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-xl font-bold text-gray-900 sm:text-2xl">
                {AppConfig.name}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav aria-label="Main navigation" className="hidden md:block">
              <ul className="flex items-center gap-x-6 text-base">
                {props.leftNav}
              </ul>
            </nav>

            {/* Right Actions */}
            <nav className="hidden md:block">
              <ul className="flex items-center gap-x-4 text-base">
                {props.rightNav}
              </ul>
            </nav>
          </div>
        </header>

        <main className="min-h-[60vh] py-6">{props.children}</main>

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
      </div>
    </div>
  );
};
