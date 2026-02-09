#!/usr/bin/env tsx

/**
 * 导入平台和活动数据到数据库
 *
 * 这个脚本从 Word 文档中解析的数据导入到数据库中
 * 使用 drizzle-orm 直接操作数据库，避免环境变量验证问题
 */

import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

// 必须在所有导入之前加载环境变量
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
// 现在可以安全地导入其他模块
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, campaignTranslations, platforms } from '../src/models/Schema';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

// 定义数据结构
type PlatformData = {
  name: string;
  nameEn: string;
  website: string;
  description: string;
  descriptionEn: string;
};

type CampaignData = {
  platformName: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  officialLink: string;
  freeCredit: string;
  aiModels: string[];
};

// 生成 slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// 从文档中解析的数据
// 从文档中提取的所有平台数据（共11个）
const platformsData: PlatformData[] = [
  // 1. 智谱GLM官网
  {
    name: '智谱GLM官网',
    nameEn: 'Zhipu GLM',
    website: 'https://www.bigmodel.cn',
    description: '智谱AI官方平台，提供GLM系列模型',
    descriptionEn: 'Official Zhipu AI platform, provides GLM series models',
  },
  // 2. 阿里云百炼平台
  {
    name: '阿里云百炼平台',
    nameEn: 'Aliyun Bailian',
    website: 'https://www.aliyun.com/minisite/goods',
    description: '阿里云AI模型服务平台，支持通义千问、DeepSeek、Kimi-K2、MiniMax系列模型',
    descriptionEn: 'Aliyun AI model service platform, supports Qwen, DeepSeek, Kimi-K2, MiniMax series models',
  },
  // 3. 火山引擎(豆包)
  {
    name: '火山引擎',
    nameEn: 'Volcengine',
    website: 'https://console.volcengine.com',
    description: '字节跳动旗下云服务平台，提供豆包系列模型',
    descriptionEn: 'ByteDance cloud service platform, provides Doubao series models',
  },
  // 4. 月之暗面（kimi）
  {
    name: '月之暗面',
    nameEn: 'Moonshot AI',
    website: 'https://platform.moonshot.cn',
    description: 'Kimi AI官方平台，提供Kimi系列模型',
    descriptionEn: 'Kimi AI official platform, provides Kimi series models',
  },
  // 5. Google AI Studio
  {
    name: 'Google AI Studio',
    nameEn: 'Google AI Studio',
    website: 'https://aistudio.google.com',
    description: 'Google AI开发平台，提供Gemini、Veo、Nano等模型',
    descriptionEn: 'Google AI development platform, provides Gemini, Veo, Nano and other models',
  },
  // 6. 硅基流动
  {
    name: '硅基流动',
    nameEn: 'Siliconflow',
    website: 'https://cloud.siliconflow.cn',
    description: '第三方中转平台，支持国内外常见的所有AI模型',
    descriptionEn: 'Third-party relay platform, supports all common domestic and international AI models',
  },
  // 7. OpenRouter
  {
    name: 'OpenRouter',
    nameEn: 'OpenRouter',
    website: 'https://openrouter.ai',
    description: '第三方中转平台，支持国内外常见的所有模型',
    descriptionEn: 'Third-party relay platform, supports all common domestic and international models',
  },
  // 8. ChatAnyWhere
  {
    name: 'ChatAnyWhere',
    nameEn: 'ChatAnyWhere',
    website: 'https://github.com/chatanywhere/GPT_API_free',
    description: '第三方中转平台，免费API Key限制200请求/天',
    descriptionEn: 'Third-party relay platform, free API Key with 200 requests/day limit',
  },
  // 9. 302.ai
  {
    name: '302.ai',
    nameEn: '302.ai',
    website: 'https://302.ai',
    description: '第三方中转平台，支持国内外常见的所有AI模型',
    descriptionEn: 'Third-party relay platform, supports all common domestic and international AI models',
  },
  // 10. BurnCloud AI API
  {
    name: 'BurnCloud AI API',
    nameEn: 'BurnCloud AI API',
    website: 'https://ai.burncloud.com',
    description: '第三方中转平台，支持国内外常见的所有AI模型',
    descriptionEn: 'Third-party relay platform, supports all common domestic and international AI models',
  },
  // 11. Z.ai (GLM国外版)
  {
    name: 'Z.ai',
    nameEn: 'Z.ai',
    website: 'https://z.ai',
    description: 'GLM国外版，提供GLM系列模型',
    descriptionEn: 'International version of GLM, provides GLM series models',
  },
  // 12. DeepSeek
  {
    name: 'DeepSeek',
    nameEn: 'DeepSeek',
    website: 'https://platform.deepseek.com',
    description: 'DeepSeek官方API平台，提供DeepSeek-V3.2系列模型',
    descriptionEn: 'DeepSeek official API platform, provides DeepSeek-V3.2 series models',
  },
  // 13. Groq
  {
    name: 'Groq',
    nameEn: 'Groq',
    website: 'https://groq.com',
    description: '基于LPU架构的高速AI推理平台，提供免费API',
    descriptionEn: 'High-speed AI inference platform based on LPU architecture, provides free API',
  },
];

// 从文档中提取的所有活动数据（共11个）
const campaignsData: CampaignData[] = [
  // 1. 智谱GLM官网
  {
    platformName: '智谱GLM官网',
    title: '智谱GLM注册实名认证赠送',
    titleEn: 'Zhipu GLM Registration Verification Gift',
    description: '注册用户+实名认证，赠送2000万token体验包。多个模型完全免费（不限token），支持128K-200K上下文。',
    descriptionEn: 'Register and verify identity to get 20 million token experience package. Multiple models are completely free (unlimited tokens), supporting 128K-200K context.',
    officialLink: 'https://www.bigmodel.cn/claude-code?ic=W6STVGJOK7',
    freeCredit: '多个模型完全免费（不限token）',
    aiModels: ['GLM-4.7', 'GLM-4.7-Flash', 'GLM-4-Flash-250414', 'GLM-Z1-Flash', 'GLM-4.6'],
  },
  // 2. 阿里云百炼平台
  {
    platformName: '阿里云百炼平台',
    title: '阿里云百炼新用户免费额度',
    titleEn: 'Aliyun Bailian New User Free Quota',
    description: '注册用户+实名认证，新用户一次性领取超7000万免费tokens，有效期90天。',
    descriptionEn: 'Register and verify identity, new users get over 70 million free tokens at once, valid for 90 days.',
    officialLink: 'https://www.aliyun.com/minisite/goods?userCode=gsjtjf7x',
    freeCredit: '新用户7000万tokens',
    aiModels: ['Qwen3-Max', 'Qwen3-Flash', 'Qwen-Plus', 'Qwen-Turbo', 'DeepSeek', 'Kimi-K2', 'MiniMax'],
  },
  // 3. 火山引擎(豆包)
  {
    platformName: '火山引擎',
    title: '火山引擎新用户免费额度',
    titleEn: 'Volcengine New User Free Quota',
    description: '注册用户+实名认证，每个模型免费50万token。',
    descriptionEn: 'Register and verify identity to get 500,000 free tokens per model.',
    officialLink: 'https://console.volcengine.com/auth/signup',
    freeCredit: '每模型50万Token',
    aiModels: ['Doubao', 'DeepSeek', 'Kimi-K2', 'Wan2.1'],
  },
  // 4. 月之暗面（kimi）
  {
    platformName: '月之暗面',
    title: '月之暗面新用户赠送',
    titleEn: 'Moonshot AI New User Gift',
    description: '新用户注册赠送15元账户余额。',
    descriptionEn: 'New users get ¥15 account balance upon registration.',
    officialLink: 'https://platform.moonshot.cn',
    freeCredit: '¥15',
    aiModels: ['Kimi', 'Moonshot-v1'],
  },
  // 5. Google AI Studio
  {
    platformName: 'Google AI Studio',
    title: 'Google AI Studio免费额度',
    titleEn: 'Google AI Studio Free Quota',
    description: '注册账号，大部分模型都有免费额度。',
    descriptionEn: 'Register an account, most models have free quota.',
    officialLink: 'https://aistudio.google.com/app/',
    freeCredit: '大部分模型免费',
    aiModels: ['Gemini', 'Veo', 'Nano'],
  },
  // 6. 硅基流动
  {
    platformName: '硅基流动',
    title: '硅基流动新用户赠送',
    titleEn: 'Siliconflow New User Gift',
    description: '新用户手机注册即得2000万Tokens。',
    descriptionEn: 'New users get 20 million tokens upon phone registration.',
    officialLink: 'https://cloud.siliconflow.cn/i/oEtN4rtO',
    freeCredit: '新用户2000万tokens',
    aiModels: ['DeepSeek', 'Qwen', 'GLM', 'Kimi', 'MiniMax', 'Hunyuan'],
  },
  // 7. OpenRouter
  {
    platformName: 'OpenRouter',
    title: 'OpenRouter每月免费请求',
    titleEn: 'OpenRouter Monthly Free Requests',
    description: '每月100万次免费请求，同时还有一些免费模型可以使用。',
    descriptionEn: '1 million free requests per month, plus some free models available.',
    officialLink: 'https://openrouter.ai/',
    freeCredit: '每月100万次请求',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  // 8. ChatAnyWhere
  {
    platformName: 'ChatAnyWhere',
    title: 'ChatAnyWhere免费API Key',
    titleEn: 'ChatAnyWhere Free API Key',
    description: '点击官方链接领取免费API Key。免费版支持 gpt-5.2/5.1/5/4o(5次/天), deepseek-r1/v3(30次/天), gpt-4o-mini/3.5-turbo等(200次/天)。',
    descriptionEn: 'Get free API Key from official link. Free version supports gpt-5.2/5.1/5/4o (5 times/day), deepseek-r1/v3 (30 times/day), gpt-4o-mini/3.5-turbo etc. (200 times/day).',
    officialLink: 'https://github.com/chatanywhere/GPT_API_free',
    freeCredit: '200请求/天',
    aiModels: ['GPT-5.2', 'GPT-5.1', 'GPT-5', 'GPT-4o', 'DeepSeek-R1', 'DeepSeek-V3', 'Claude', 'Gemini', 'Grok'],
  },
  // 9. 302.ai
  {
    platformName: '302.ai',
    title: '302.ai注册绑定手机赠送',
    titleEn: '302.ai Registration Phone Binding Gift',
    description: '注册用户绑定手机后赠送1美金余额。',
    descriptionEn: 'Get $1 balance after registration and phone binding.',
    officialLink: 'https://302.ai/',
    freeCredit: '$1',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  // 10. BurnCloud AI API
  {
    platformName: 'BurnCloud AI API',
    title: 'BurnCloud AI API客服赠送',
    titleEn: 'BurnCloud AI API Customer Service Gift',
    description: '注册用户找客服领取赠送1美金余额。',
    descriptionEn: 'Contact customer service after registration to get $1 balance.',
    officialLink: 'https://ai.burncloud.com/register?aff=opK9',
    freeCredit: '$1',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  // 11. Z.ai (GLM国外版)
  {
    platformName: 'Z.ai',
    title: 'Z.ai GLM模型免费使用',
    titleEn: 'Z.ai GLM Models Free Access',
    description: 'GLM-4.5-Flash一直免费使用，其他GLM模型限时免费。',
    descriptionEn: 'GLM-4.5-Flash is always free, other GLM models are temporarily free.',
    officialLink: 'https://z.ai/chat',
    freeCredit: 'GLM-4.5-Flash永久免费',
    aiModels: ['GLM-4.5-Flash', 'GLM-4', 'GLM-3'],
  },
  // 12. DeepSeek
  {
    platformName: 'DeepSeek',
    title: 'DeepSeek新用户赠送',
    titleEn: 'DeepSeek New User Gift',
    description: '新用户注册赠送余额，DeepSeek-V3.2价格极低（$0.28/1M input tokens）。',
    descriptionEn: 'New users get balance upon registration. DeepSeek-V3.2 has extremely low pricing ($0.28/1M input tokens).',
    officialLink: 'https://platform.deepseek.com',
    freeCredit: '注册赠送余额',
    aiModels: ['DeepSeek-V3.2', 'DeepSeek-R1'],
  },
  // 13. Groq
  {
    platformName: 'Groq',
    title: 'Groq免费API',
    titleEn: 'Groq Free API',
    description: '注册即可获取免费API密钥，基于LPU架构提供超快推理速度。',
    descriptionEn: 'Get free API key upon registration, provides ultra-fast inference speed based on LPU architecture.',
    officialLink: 'https://console.groq.com/keys',
    freeCredit: '免费API（有速率限制）',
    aiModels: ['LLaMA', 'Mixtral', 'Gemma'],
  },
];

async function main() {
  console.log('开始导入平台和活动数据...\n');

  // 检查环境变量
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    console.error('请确保 .env.local 文件中包含 DATABASE_URL');
    process.exit(1);
  }

  // 初始化数据库连接
  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  try {
    // 1. 导入平台
    console.log('=== 导入平台 ===');
    const platformMap = new Map<string, string>(); // name -> id

    for (const platformData of platformsData) {
      const slug = generateSlug(platformData.nameEn);

      // 检查平台是否已存在
      const existing = await db
        .select()
        .from(platforms)
        .where(eq(platforms.slug, slug))
        .limit(1);

      if (existing.length > 0) {
        console.log(`✓ 平台已存在: ${platformData.name} (${slug})`);
        platformMap.set(platformData.name, existing[0]!.id);
      } else {
        // 创建新平台
        const [newPlatform] = await db
          .insert(platforms)
          .values({
            name: platformData.name,
            slug,
            website: platformData.website,
            description: platformData.description,
            status: 'active',
          })
          .returning();

        console.log(`✓ 创建平台: ${platformData.name} (${slug})`);
        platformMap.set(platformData.name, newPlatform!.id);
      }
    }

    console.log(`\n成功导入 ${platformMap.size} 个平台\n`);

    // 2. 导入活动
    console.log('=== 导入活动 ===');
    let successCount = 0;
    let skipCount = 0;

    for (const campaignData of campaignsData) {
      const platformId = platformMap.get(campaignData.platformName);

      if (!platformId) {
        console.log(`✗ 跳过活动: ${campaignData.title} (平台未找到: ${campaignData.platformName})`);
        skipCount++;
        continue;
      }

      const slug = generateSlug(`${campaignData.platformName}-${campaignData.titleEn}`);

      // 检查活动是否已存在
      const existingCampaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.slug, slug))
        .limit(1);

      if (existingCampaign.length > 0) {
        console.log(`✓ 活动已存在: ${campaignData.title} (${slug})`);
        skipCount++;
        continue;
      }

      try {
        // 创建活动
        const [newCampaign] = await db
          .insert(campaigns)
          .values({
            platformId,
            slug,
            status: 'published', // 这些是已验证的活动，直接发布
            freeCredit: campaignData.freeCredit,
            officialLink: campaignData.officialLink,
            aiModels: campaignData.aiModels,
            difficultyLevel: 'easy', // 注册类活动通常比较简单
            isFeatured: false,
            needsVerification: false,
          })
          .returning();

        // 添加翻译
        await db.insert(campaignTranslations).values([
          {
            campaignId: newCampaign!.id,
            locale: 'zh',
            title: campaignData.title,
            description: campaignData.description,
            isAiGenerated: false,
          },
          {
            campaignId: newCampaign!.id,
            locale: 'en',
            title: campaignData.titleEn,
            description: campaignData.descriptionEn,
            isAiGenerated: false,
          },
        ]);

        console.log(`✓ 创建活动: ${campaignData.title} (${slug})`);
        successCount++;
      } catch (error) {
        console.error(`✗ 创建活动失败: ${campaignData.title}`, error);
      }
    }

    console.log(`\n=== 导入完成 ===`);
    console.log(`成功创建: ${successCount} 个活动`);
    console.log(`跳过: ${skipCount} 个活动`);
    console.log(`总计: ${campaignsData.length} 个活动\n`);
  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  }
}

// 执行导入
main()
  .then(() => {
    console.log('✅ 数据导入成功完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 数据导入失败:', error);
    process.exit(1);
  });
