'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { getHomeCategories } from '@/config/categories';

export default function CategoryLinks() {
  const t = useTranslations('Index');
  const locale = useLocale();

  // 获取首页展示的分类
  const categories = getHomeCategories();

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {categories.map(category => (
        <Link
          key={category.slug}
          href={`/${locale}/campaigns?categories=${category.slug}`}
          className="group flex flex-col items-center gap-3 rounded-xl border-2 border-gray-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-primary-500 hover:shadow-lg"
        >
          <span className="text-4xl transition-transform group-hover:scale-110">
            {category.icon}
          </span>
          <span className="text-center text-sm font-medium text-gray-700 group-hover:text-primary-600">
            {locale === 'zh' ? category.nameZh : category.nameEn}
          </span>
        </Link>
      ))}
    </div>
  );
}
