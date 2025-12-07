/**
 * 统一的分类配置
 * 用于首页展示和筛选器
 */

export type CategoryConfig = {
  slug: string;
  icon: string;
  nameZh: string;
  nameEn: string;
  order: number; // 用于排序
  showOnHome: boolean; // 是否在首页显示
};

/**
 * 标准分类列表
 * 这些分类应该与数据库中的 tags 表保持同步
 */
export const CATEGORIES: CategoryConfig[] = [
  {
    slug: 'api',
    icon: '🔌',
    nameZh: 'API',
    nameEn: 'API',
    order: 1,
    showOnHome: true,
  },
  {
    slug: 'editor',
    icon: '✏️',
    nameZh: '编辑器',
    nameEn: 'Editor',
    order: 2,
    showOnHome: true,
  },
  {
    slug: 'chat',
    icon: '💬',
    nameZh: '聊天',
    nameEn: 'Chat',
    order: 3,
    showOnHome: true,
  },
  {
    slug: 'image-generation',
    icon: '🎨',
    nameZh: '图像生成',
    nameEn: 'Image Generation',
    order: 4,
    showOnHome: true,
  },
  {
    slug: 'video',
    icon: '🎬',
    nameZh: '视频',
    nameEn: 'Video',
    order: 5,
    showOnHome: true,
  },
  {
    slug: 'audio',
    icon: '🎵',
    nameZh: '音频',
    nameEn: 'Audio',
    order: 6,
    showOnHome: true,
  },
  {
    slug: 'code-assistant',
    icon: '💻',
    nameZh: '代码助手',
    nameEn: 'Code Assistant',
    order: 7,
    showOnHome: false,
  },
  {
    slug: 'text-generation',
    icon: '📝',
    nameZh: '文本生成',
    nameEn: 'Text Generation',
    order: 8,
    showOnHome: false,
  },
  {
    slug: 'translation',
    icon: '🌐',
    nameZh: '翻译',
    nameEn: 'Translation',
    order: 9,
    showOnHome: false,
  },
  {
    slug: 'data-analysis',
    icon: '📊',
    nameZh: '数据分析',
    nameEn: 'Data Analysis',
    order: 10,
    showOnHome: false,
  },
  {
    slug: 'speech-recognition',
    icon: '🎤',
    nameZh: '语音识别',
    nameEn: 'Speech Recognition',
    order: 11,
    showOnHome: false,
  },
  {
    slug: 'document-processing',
    icon: '📄',
    nameZh: '文档处理',
    nameEn: 'Document Processing',
    order: 12,
    showOnHome: false,
  },
];

/**
 * 获取首页展示的分类
 */
export function getHomeCategories(): CategoryConfig[] {
  return CATEGORIES.filter(cat => cat.showOnHome).sort((a, b) => a.order - b.order);
}

/**
 * 获取所有分类
 */
export function getAllCategories(): CategoryConfig[] {
  return CATEGORIES.sort((a, b) => a.order - b.order);
}

/**
 * 根据 slug 获取分类
 */
export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}
