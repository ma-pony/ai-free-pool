/**
 * 统一的 AI 模型配置
 * 用于筛选器和活动关联
 */

export type AiModelConfig = {
  id: string; // 唯一标识符
  name: string; // 显示名称
  provider: string; // 提供商
  category: string; // 分类（文本、图像、音频等）
  order: number; // 排序
  isPopular: boolean; // 是否热门（在筛选器中优先显示）
};

/**
 * 标准 AI 模型列表
 * 这些模型应该与数据库中的活动数据保持同步
 */
export const AI_MODELS: AiModelConfig[] = [
  // OpenAI 系列
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    category: 'text',
    order: 1,
    isPopular: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    category: 'text',
    order: 2,
    isPopular: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    category: 'text',
    order: 3,
    isPopular: true,
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    category: 'image',
    order: 4,
    isPopular: true,
  },
  {
    id: 'whisper',
    name: 'Whisper',
    provider: 'OpenAI',
    category: 'audio',
    order: 5,
    isPopular: false,
  },

  // Anthropic Claude 系列
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    category: 'text',
    order: 6,
    isPopular: true,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    category: 'text',
    order: 7,
    isPopular: true,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    category: 'text',
    order: 8,
    isPopular: false,
  },

  // Google Gemini 系列
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    category: 'text',
    order: 9,
    isPopular: true,
  },
  {
    id: 'gemini-ultra',
    name: 'Gemini Ultra',
    provider: 'Google',
    category: 'text',
    order: 10,
    isPopular: false,
  },

  // Meta Llama 系列
  {
    id: 'llama-3',
    name: 'Llama 3',
    provider: 'Meta',
    category: 'text',
    order: 11,
    isPopular: false,
  },
  {
    id: 'llama-2',
    name: 'Llama 2',
    provider: 'Meta',
    category: 'text',
    order: 12,
    isPopular: false,
  },

  // Midjourney
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney',
    category: 'image',
    order: 13,
    isPopular: true,
  },

  // Stable Diffusion
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    provider: 'Stability AI',
    category: 'image',
    order: 14,
    isPopular: true,
  },

  // 其他
  {
    id: 'codex',
    name: 'Codex',
    provider: 'OpenAI',
    category: 'code',
    order: 15,
    isPopular: false,
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    provider: 'GitHub',
    category: 'code',
    order: 16,
    isPopular: true,
  },
];

/**
 * 获取所有 AI 模型
 */
export function getAllAiModels(): AiModelConfig[] {
  return AI_MODELS.sort((a, b) => a.order - b.order);
}

/**
 * 获取热门 AI 模型
 */
export function getPopularAiModels(): AiModelConfig[] {
  return AI_MODELS.filter(model => model.isPopular).sort((a, b) => a.order - b.order);
}

/**
 * 根据分类获取 AI 模型
 */
export function getAiModelsByCategory(category: string): AiModelConfig[] {
  return AI_MODELS.filter(model => model.category === category).sort((a, b) => a.order - b.order);
}

/**
 * 根据提供商获取 AI 模型
 */
export function getAiModelsByProvider(provider: string): AiModelConfig[] {
  return AI_MODELS.filter(model => model.provider === provider).sort((a, b) => a.order - b.order);
}

/**
 * 根据 ID 获取 AI 模型
 */
export function getAiModelById(id: string): AiModelConfig | undefined {
  return AI_MODELS.find(model => model.id === id);
}

/**
 * 获取所有提供商
 */
export function getAllProviders(): string[] {
  return Array.from(new Set(AI_MODELS.map(model => model.provider))).sort();
}

/**
 * 获取所有分类
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(AI_MODELS.map(model => model.category))).sort();
}
