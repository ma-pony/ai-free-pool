/**
 * 统一的参与条件配置
 * 用于筛选器和活动关联
 */

export type ConditionTagConfig = {
  slug: string; // URL 友好的标识符
  nameZh: string; // 中文名称
  nameEn: string; // 英文名称
  type: 'requirement' | 'benefit'; // 类型：要求 或 优势
  difficultyWeight: number; // 难度权重 (0-10)
  order: number; // 排序
  icon?: string; // 可选的图标
  description?: { // 可选的描述
    zh: string;
    en: string;
  };
};

/**
 * 标准参与条件列表
 * 这些条件应该与数据库中的 condition_tags 表保持同步
 */
export const CONDITION_TAGS: ConditionTagConfig[] = [
  // ========== 要求类 (Requirements) ==========
  {
    slug: 'email-verification',
    nameZh: '邮箱验证',
    nameEn: 'Email Verification',
    type: 'requirement',
    difficultyWeight: 1,
    order: 1,
    icon: '📧',
    description: {
      zh: '需要验证邮箱地址',
      en: 'Email verification required',
    },
  },
  {
    slug: 'phone-verification',
    nameZh: '手机验证',
    nameEn: 'Phone Verification',
    type: 'requirement',
    difficultyWeight: 2,
    order: 2,
    icon: '📱',
    description: {
      zh: '需要验证手机号码',
      en: 'Phone number verification required',
    },
  },
  {
    slug: 'credit-card',
    nameZh: '信用卡绑定',
    nameEn: 'Credit Card Required',
    type: 'requirement',
    difficultyWeight: 5,
    order: 3,
    icon: '💳',
    description: {
      zh: '需要绑定信用卡（不扣费）',
      en: 'Credit card binding required (no charge)',
    },
  },
  {
    slug: 'id-verification',
    nameZh: '身份验证',
    nameEn: 'ID Verification',
    type: 'requirement',
    difficultyWeight: 7,
    order: 4,
    icon: '🆔',
    description: {
      zh: '需要上传身份证明文件',
      en: 'ID document upload required',
    },
  },
  {
    slug: 'student-verification',
    nameZh: '学生认证',
    nameEn: 'Student Verification',
    type: 'requirement',
    difficultyWeight: 4,
    order: 5,
    icon: '🎓',
    description: {
      zh: '需要学生身份证明',
      en: 'Student status verification required',
    },
  },
  {
    slug: 'developer-verification',
    nameZh: '开发者认证',
    nameEn: 'Developer Verification',
    type: 'requirement',
    difficultyWeight: 3,
    order: 6,
    icon: '👨‍💻',
    description: {
      zh: '需要开发者身份验证',
      en: 'Developer verification required',
    },
  },
  {
    slug: 'github-account',
    nameZh: 'GitHub 账号',
    nameEn: 'GitHub Account',
    type: 'requirement',
    difficultyWeight: 1,
    order: 7,
    icon: '🐙',
    description: {
      zh: '需要 GitHub 账号',
      en: 'GitHub account required',
    },
  },
  {
    slug: 'social-media-share',
    nameZh: '社交媒体分享',
    nameEn: 'Social Media Share',
    type: 'requirement',
    difficultyWeight: 2,
    order: 8,
    icon: '📢',
    description: {
      zh: '需要在社交媒体分享',
      en: 'Social media sharing required',
    },
  },
  {
    slug: 'survey-completion',
    nameZh: '问卷调查',
    nameEn: 'Survey Completion',
    type: 'requirement',
    difficultyWeight: 2,
    order: 9,
    icon: '📋',
    description: {
      zh: '需要完成问卷调查',
      en: 'Survey completion required',
    },
  },
  {
    slug: 'referral-code',
    nameZh: '推荐码',
    nameEn: 'Referral Code',
    type: 'requirement',
    difficultyWeight: 1,
    order: 10,
    icon: '🎟️',
    description: {
      zh: '需要推荐码或邀请链接',
      en: 'Referral code or invite link required',
    },
  },

  // ========== 优势类 (Benefits) ==========
  {
    slug: 'no-credit-card',
    nameZh: '无需信用卡',
    nameEn: 'No Credit Card',
    type: 'benefit',
    difficultyWeight: -3,
    order: 11,
    icon: '🚫💳',
    description: {
      zh: '不需要绑定信用卡',
      en: 'No credit card required',
    },
  },
  {
    slug: 'instant-access',
    nameZh: '即时访问',
    nameEn: 'Instant Access',
    type: 'benefit',
    difficultyWeight: -2,
    order: 12,
    icon: '⚡',
    description: {
      zh: '注册后立即可用',
      en: 'Instant access after registration',
    },
  },
  {
    slug: 'no-expiration',
    nameZh: '永久有效',
    nameEn: 'No Expiration',
    type: 'benefit',
    difficultyWeight: -1,
    order: 13,
    icon: '♾️',
    description: {
      zh: '额度永久有效',
      en: 'Credits never expire',
    },
  },
  {
    slug: 'api-access',
    nameZh: 'API 访问',
    nameEn: 'API Access',
    type: 'benefit',
    difficultyWeight: 0,
    order: 14,
    icon: '🔌',
    description: {
      zh: '提供 API 访问权限',
      en: 'API access included',
    },
  },
  {
    slug: 'commercial-use',
    nameZh: '商业使用',
    nameEn: 'Commercial Use',
    type: 'benefit',
    difficultyWeight: 0,
    order: 15,
    icon: '💼',
    description: {
      zh: '允许商业用途',
      en: 'Commercial use allowed',
    },
  },
  {
    slug: 'open-source',
    nameZh: '开源项目',
    nameEn: 'Open Source',
    type: 'benefit',
    difficultyWeight: 0,
    order: 16,
    icon: '🔓',
    description: {
      zh: '开源项目可免费使用',
      en: 'Free for open source projects',
    },
  },
  {
    slug: 'educational-discount',
    nameZh: '教育优惠',
    nameEn: 'Educational Discount',
    type: 'benefit',
    difficultyWeight: 0,
    order: 17,
    icon: '🎓',
    description: {
      zh: '教育用途享受优惠',
      en: 'Discount for educational use',
    },
  },
  {
    slug: 'unlimited-requests',
    nameZh: '无限请求',
    nameEn: 'Unlimited Requests',
    type: 'benefit',
    difficultyWeight: 0,
    order: 18,
    icon: '∞',
    description: {
      zh: '不限制请求次数',
      en: 'Unlimited API requests',
    },
  },
  {
    slug: 'priority-support',
    nameZh: '优先支持',
    nameEn: 'Priority Support',
    type: 'benefit',
    difficultyWeight: 0,
    order: 19,
    icon: '🎯',
    description: {
      zh: '享受优先技术支持',
      en: 'Priority technical support',
    },
  },
  {
    slug: 'free-trial',
    nameZh: '免费试用',
    nameEn: 'Free Trial',
    type: 'benefit',
    difficultyWeight: 0,
    order: 20,
    icon: '🆓',
    description: {
      zh: '提供免费试用期',
      en: 'Free trial period included',
    },
  },
];

/**
 * 获取所有参与条件
 */
export function getAllConditionTags(): ConditionTagConfig[] {
  return CONDITION_TAGS.sort((a, b) => a.order - b.order);
}

/**
 * 获取要求类条件
 */
export function getRequirementTags(): ConditionTagConfig[] {
  return CONDITION_TAGS.filter(tag => tag.type === 'requirement').sort((a, b) => a.order - b.order);
}

/**
 * 获取优势类条件
 */
export function getBenefitTags(): ConditionTagConfig[] {
  return CONDITION_TAGS.filter(tag => tag.type === 'benefit').sort((a, b) => a.order - b.order);
}

/**
 * 根据 slug 获取条件
 */
export function getConditionTagBySlug(slug: string): ConditionTagConfig | undefined {
  return CONDITION_TAGS.find(tag => tag.slug === slug);
}

/**
 * 计算活动难度
 * 基于关联的条件标签的难度权重
 */
export function calculateDifficulty(conditionSlugs: string[]): 'easy' | 'medium' | 'hard' {
  const totalWeight = conditionSlugs.reduce((sum, slug) => {
    const tag = getConditionTagBySlug(slug);
    return sum + (tag?.difficultyWeight || 0);
  }, 0);

  if (totalWeight <= 3) {
    return 'easy';
  }
  if (totalWeight <= 7) {
    return 'medium';
  }
  return 'hard';
}

/**
 * 获取推荐的条件组合（用于创建活动时的建议）
 */
export function getRecommendedConditions(difficulty: 'easy' | 'medium' | 'hard'): ConditionTagConfig[] {
  const requirements = getRequirementTags();
  const benefits = getBenefitTags();

  switch (difficulty) {
    case 'easy':
      // 简单：只需邮箱，提供即时访问
      return [
        ...requirements.filter(t => ['email-verification', 'no-credit-card'].includes(t.slug)),
        ...benefits.filter(t => ['instant-access', 'no-credit-card'].includes(t.slug)),
      ];
    case 'medium':
      // 中等：需要手机或社交验证
      return [
        ...requirements.filter(t => ['email-verification', 'phone-verification'].includes(t.slug)),
        ...benefits.filter(t => ['api-access', 'free-trial'].includes(t.slug)),
      ];
    case 'hard':
      // 困难：需要信用卡或身份验证
      return [
        ...requirements.filter(t => ['credit-card', 'id-verification'].includes(t.slug)),
        ...benefits.filter(t => ['commercial-use', 'priority-support'].includes(t.slug)),
      ];
    default:
      return [];
  }
}
