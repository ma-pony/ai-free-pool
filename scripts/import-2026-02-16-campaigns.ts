#!/usr/bin/env tsx

/**
 * 2026-02-16 补录活动：春节红包活动 + 启动项目计划
 * 
 * pool-ops 今天发现但因旧收录标准跳过的活动
 */

import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, campaignTranslations, platforms } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

function generateSlug(text: string): string {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/-{2,}/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

type CampaignData = {
  platformName: string;
  title: string;
  titleEn: string;
  titleFr: string;
  description: string;
  descriptionEn: string;
  descriptionFr: string;
  officialLink: string;
  freeCredit: string;
  aiModels: string[];
};

// 新平台（数据库里还没有的）
const newPlatforms = [
  { name: 'OpenAI', nameEn: 'OpenAI', website: 'https://openai.com', description: 'OpenAI 是全球领先的 AI 研究公司，提供 GPT 系列大语言模型 API 服务。', descriptionEn: 'OpenAI is a leading AI research company offering GPT series large language model API services.' },
  { name: 'Anthropic', nameEn: 'Anthropic', website: 'https://www.anthropic.com', description: 'Anthropic 是 AI 安全公司，提供 Claude 系列大语言模型 API 服务。', descriptionEn: 'Anthropic is an AI safety company offering Claude series large language model API services.' },
];

// 春节活动 + 启动项目计划（平台名匹配数据库实际名称）
const campaignsData: CampaignData[] = [
  // === 国内春节红包活动 ===
  {
    platformName: '腾讯混元',
    title: '春节红包活动 - 15亿补贴',
    titleEn: 'Chinese New Year Red Packet - 1.5B Yuan Subsidy',
    titleFr: 'Enveloppes rouges du Nouvel An chinois - 1,5 milliard de yuans',
    description: '腾讯元宝春节期间推出15亿补贴红包活动，用户参与互动可获得现金红包和免费使用额度。限时活动。',
    descriptionEn: 'Tencent Yuanbao launches 1.5 billion yuan subsidy during Chinese New Year. Users can earn cash red packets and free usage credits through interactive activities. Limited time.',
    descriptionFr: 'Tencent Yuanbao lance une subvention de 1,5 milliard de yuans pendant le Nouvel An chinois. Les utilisateurs peuvent gagner des enveloppes rouges et des crédits gratuits.',
    officialLink: 'https://yuanbao.tencent.com',
    freeCredit: '15亿补贴池',
    aiModels: ['混元大模型'],
  },
  {
    platformName: '阿里云百炼平台',
    title: '春节红包活动 - 30亿补贴',
    titleEn: 'Chinese New Year Red Packet - 3B Yuan Subsidy',
    titleFr: 'Enveloppes rouges du Nouvel An chinois - 3 milliards de yuans',
    description: '阿里通义千问春节期间推出30亿补贴活动，包含免费 API 调用额度和现金红包。限时活动。',
    descriptionEn: 'Alibaba Qwen launches 3 billion yuan subsidy during Chinese New Year, including free API credits and cash red packets. Limited time.',
    descriptionFr: 'Alibaba Qwen lance une subvention de 3 milliards de yuans pendant le Nouvel An chinois, incluant des crédits API gratuits et des enveloppes rouges.',
    officialLink: 'https://tongyi.aliyun.com',
    freeCredit: '30亿补贴池',
    aiModels: ['Qwen-Max', 'Qwen-Plus', 'Qwen-Turbo'],
  },
  {
    platformName: '百度千帆',
    title: '春节红包活动 - 5亿补贴',
    titleEn: 'Chinese New Year Red Packet - 500M Yuan Subsidy',
    titleFr: 'Enveloppes rouges du Nouvel An chinois - 500 millions de yuans',
    description: '百度文心一言春节期间推出5亿补贴活动，用户可获得免费对话额度和现金红包。限时活动。',
    descriptionEn: 'Baidu ERNIE Bot launches 500 million yuan subsidy during Chinese New Year. Users can earn free chat credits and cash red packets. Limited time.',
    descriptionFr: 'Baidu ERNIE Bot lance une subvention de 500 millions de yuans pendant le Nouvel An chinois avec des crédits de chat gratuits.',
    officialLink: 'https://yiyan.baidu.com',
    freeCredit: '5亿补贴池',
    aiModels: ['ERNIE 4.0', 'ERNIE 3.5'],
  },
  // === 国际启动项目计划 ===
  {
    platformName: 'OpenAI',
    title: 'Startup Fund - 最高 $2,500 API 额度',
    titleEn: 'Startup Fund - Up to $2,500 API Credits',
    titleFr: 'Fonds Startup - Jusqu\'à 2 500 $ de crédits API',
    description: 'OpenAI 为初创企业提供最高 $2,500 的 API 使用额度。需要申请审核，适合有产品原型的创业团队。',
    descriptionEn: 'OpenAI offers up to $2,500 in API credits for startups. Requires application review, suitable for teams with product prototypes.',
    descriptionFr: 'OpenAI offre jusqu\'à 2 500 $ de crédits API pour les startups. Nécessite une candidature.',
    officialLink: 'https://openai.com/fund',
    freeCredit: '$2,500',
    aiModels: ['GPT-4o', 'GPT-4', 'GPT-3.5-Turbo'],
  },
  {
    platformName: 'Anthropic',
    title: 'Startup Program - 最高 $25,000 API 额度',
    titleEn: 'Startup Program - Up to $25,000 API Credits',
    titleFr: 'Programme Startup - Jusqu\'à 25 000 $ de crédits API',
    description: 'Anthropic 为初创企业提供最高 $25,000 的 API 使用额度，包含技术支持和优先访问新模型。需要申请。',
    descriptionEn: 'Anthropic offers up to $25,000 in API credits for startups, including technical support and early access to new models. Application required.',
    descriptionFr: 'Anthropic offre jusqu\'à 25 000 $ de crédits API pour les startups, avec support technique et accès prioritaire.',
    officialLink: 'https://www.anthropic.com/startups',
    freeCredit: '$25,000',
    aiModels: ['Claude Opus', 'Claude Sonnet', 'Claude Haiku'],
  },
  {
    platformName: 'Google Cloud Vertex AI',
    title: 'AI Startup Program - 最高 $200,000 云额度',
    titleEn: 'AI Startup Program - Up to $200,000 Cloud Credits',
    titleFr: 'Programme AI Startup - Jusqu\'à 200 000 $ de crédits cloud',
    description: 'Google Cloud 为 AI 初创企业提供最高 $200,000 的云服务额度，覆盖 Vertex AI、Gemini API 等全线产品。需要申请。',
    descriptionEn: 'Google Cloud offers up to $200,000 in cloud credits for AI startups, covering Vertex AI, Gemini API and more. Application required.',
    descriptionFr: 'Google Cloud offre jusqu\'à 200 000 $ de crédits cloud pour les startups IA, couvrant Vertex AI, Gemini API et plus.',
    officialLink: 'https://cloud.google.com/startup',
    freeCredit: '$200,000',
    aiModels: ['Gemini Pro', 'Gemini Ultra', 'PaLM 2'],
  },
];

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema: { campaigns, campaignTranslations, platforms } });

  // 先创建新平台（OpenAI、Anthropic）
  for (const p of newPlatforms) {
    const existing = await db.query.platforms.findFirst({ where: eq(platforms.name, p.name) });
    if (existing) {
      console.log(`⏭ 平台已存在: ${p.name}`);
      continue;
    }
    await db.insert(platforms).values({
      name: p.name,
      slug: generateSlug(p.nameEn),
      website: p.website,
      description: p.description,
      status: 'published',
    });
    console.log(`✓ 创建平台: ${p.name}`);
  }

  let successCount = 0;
  let skipCount = 0;

  for (const campaignData of campaignsData) {
    // 查找平台
    const platform = await db.query.platforms.findFirst({
      where: eq(platforms.name, campaignData.platformName),
    });

    if (!platform) {
      console.log(`⚠ 平台不存在: ${campaignData.platformName}，跳过`);
      skipCount++;
      continue;
    }

    const slug = generateSlug(campaignData.titleEn);

    // 检查是否已存在
    const existing = await db.query.campaigns.findFirst({
      where: eq(campaigns.slug, slug),
    });

    if (existing) {
      console.log(`⏭ 已存在: ${campaignData.title} (${slug})`);
      skipCount++;
      continue;
    }

    try {
      const [newCampaign] = await db
        .insert(campaigns)
        .values({
          platformId: platform.id,
          slug,
          status: 'published',
          freeCredit: campaignData.freeCredit,
          officialLink: campaignData.officialLink,
          aiModels: campaignData.aiModels,
          difficultyLevel: 'easy',
          isFeatured: false,
          needsVerification: false,
        })
        .returning();

      await db.insert(campaignTranslations).values([
        { campaignId: newCampaign!.id, locale: 'zh', title: campaignData.title, description: campaignData.description, isAiGenerated: false },
        { campaignId: newCampaign!.id, locale: 'en', title: campaignData.titleEn, description: campaignData.descriptionEn, isAiGenerated: false },
        { campaignId: newCampaign!.id, locale: 'fr', title: campaignData.titleFr, description: campaignData.descriptionFr, isAiGenerated: false },
      ]);

      console.log(`✓ 创建活动: ${campaignData.title} (${slug})`);
      successCount++;
    } catch (error) {
      console.error(`✗ 创建活动失败: ${campaignData.title}`, error);
    }
  }

  console.log(`\n=== 导入完成 ===`);
  console.log(`成功: ${successCount} | 跳过: ${skipCount} | 总计: ${campaignsData.length}`);
}

main().then(() => process.exit(0)).catch(e => { console.error('❌', e); process.exit(1); });
