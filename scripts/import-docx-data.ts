import { resolve } from 'node:path';
// 加载环境变量
import { config } from 'dotenv';

import { createCampaign } from '../src/services/CampaignService';
import { createPlatform, getPlatformBySlug } from '../src/services/PlatformService';
import { generateSlug } from '../src/utils/SlugHelpers';

// 加载 .env 和 .env.local 文件
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

// 定义平台和活动数据结构
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

// 从文档中解析的数据
const platformsData: PlatformData[] = [
  {
    name: '硅基流动',
    nameEn: 'Siliconflow',
    website: 'https://cloud.siliconflow.cn',
    description: '支持国内外常见的所有AI模型',
    descriptionEn: 'Supports all common domestic and international AI models',
  },
  {
    name: 'ChatAnyWhere',
    nameEn: 'ChatAnyWhere',
    website: 'https://github.com/chatanywhere/GPT_API_free',
    description: '免费API Key限制200请求/天，支持多种GPT和DeepSeek模型',
    descriptionEn: 'Free API Key with 200 requests/day limit, supports various GPT and DeepSeek models',
  },
  {
    name: '302.ai',
    nameEn: '302.ai',
    website: 'https://302.ai',
    description: '支持国内外常见的所有AI模型',
    descriptionEn: 'Supports all common domestic and international AI models',
  },
  {
    name: 'BurnCloud AI API',
    nameEn: 'BurnCloud AI API',
    website: 'https://ai.burncloud.com',
    description: '支持国内外常见的所有AI模型',
    descriptionEn: 'Supports all common domestic and international AI models',
  },
  {
    name: 'Z.ai',
    nameEn: 'Z.ai',
    website: 'https://z.ai',
    description: 'GLM国外版，提供GLM系列模型',
    descriptionEn: 'International version of GLM, provides GLM series models',
  },
];

const campaignsData: CampaignData[] = [
  {
    platformName: '硅基流动',
    title: '硅基流动注册赠送活动',
    titleEn: 'Siliconflow Registration Gift Campaign',
    description: '注册赠送20元，邀请好友赠送10元。支持国内外常见的所有AI模型。',
    descriptionEn: 'Get ¥20 for registration, ¥10 for each referral. Supports all common AI models.',
    officialLink: 'https://cloud.siliconflow.cn/i/ttKDdkVT',
    freeCredit: '¥20 + ¥10/邀请',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  {
    platformName: 'ChatAnyWhere',
    title: 'ChatAnyWhere 免费API Key',
    titleEn: 'ChatAnyWhere Free API Key',
    description: '免费API Key限制200请求/天，支持GPT、DeepSeek、Claude、Gemini、Grok等多种模型。',
    descriptionEn: 'Free API Key with 200 requests/day limit. Supports GPT, DeepSeek, Claude, Gemini, Grok and more.',
    officialLink: 'https://github.com/chatanywhere/GPT_API_free',
    freeCredit: '200请求/天',
    aiModels: ['GPT', 'DeepSeek', 'Claude', 'Gemini', 'Grok'],
  },
  {
    platformName: '302.ai',
    title: '302.ai 注册绑定手机赠送',
    titleEn: '302.ai Registration Phone Binding Gift',
    description: '注册并绑定手机号赠送1美金。支持国内外常见的所有AI模型。',
    descriptionEn: 'Get $1 for registration and phone binding. Supports all common AI models.',
    officialLink: 'https://302.ai/',
    freeCredit: '$1',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  {
    platformName: 'BurnCloud AI API',
    title: 'BurnCloud AI API 客服赠送活动',
    titleEn: 'BurnCloud AI API Customer Service Gift',
    description: '联系客服领取1美金。支持国内外常见的所有AI模型。',
    descriptionEn: 'Contact customer service to get $1. Supports all common AI models.',
    officialLink: 'https://ai.burncloud.com/register?aff=opK9',
    freeCredit: '$1',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  {
    platformName: 'Z.ai',
    title: 'Z.ai GLM模型免费使用',
    titleEn: 'Z.ai GLM Models Free Access',
    description: 'GLM-4.5-Flash一直免费，其他GLM模型限时免费。',
    descriptionEn: 'GLM-4.5-Flash is always free, other GLM models are temporarily free.',
    officialLink: 'https://z.ai/chat',
    freeCredit: 'GLM-4.5-Flash永久免费',
    aiModels: ['GLM-4.5-Flash', 'GLM-4', 'GLM-3'],
  },
];

async function importData() {
  console.log('开始导入平台和活动数据...\n');

  try {
    // 1. 导入平台
    console.log('=== 导入平台 ===');
    const platformMap = new Map<string, string>(); // name -> id

    for (const platformData of platformsData) {
      const slug = generateSlug(platformData.nameEn);

      // 检查平台是否已存在
      let platform = await getPlatformBySlug(slug);

      if (platform) {
        console.log(`✓ 平台已存在: ${platformData.name} (${slug})`);
        platformMap.set(platformData.name, platform.id);
      } else {
        // 创建新平台
        platform = await createPlatform({
          name: platformData.name,
          slug,
          website: platformData.website,
          description: platformData.description,
          status: 'active',
        });
        console.log(`✓ 创建平台: ${platformData.name} (${slug})`);
        platformMap.set(platformData.name, platform.id);
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

      try {
        const campaign = await createCampaign({
          platformId,
          slug,
          status: 'published', // 这些是已验证的活动，直接发布
          freeCredit: campaignData.freeCredit,
          officialLink: campaignData.officialLink,
          aiModels: campaignData.aiModels,
          difficultyLevel: 'easy', // 注册类活动通常比较简单
          translations: [
            {
              locale: 'zh',
              title: campaignData.title,
              description: campaignData.description,
              isAiGenerated: false,
            },
            {
              locale: 'en',
              title: campaignData.titleEn,
              description: campaignData.descriptionEn,
              isAiGenerated: false,
            },
          ],
          autoTranslate: false, // 我们已经提供了翻译，不需要自动翻译
        });

        console.log(`✓ 创建活动: ${campaignData.title} (${slug})`);
        successCount++;
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          console.log(`✓ 活动已存在: ${campaignData.title} (${slug})`);
          skipCount++;
        } else {
          console.error(`✗ 创建活动失败: ${campaignData.title}`, error);
        }
      }
    }

    console.log(`\n=== 导入完成 ===`);
    console.log(`成功创建: ${successCount} 个活动`);
    console.log(`跳过: ${skipCount} 个活动`);
    console.log(`总计: ${campaignsData.length} 个活动\n`);
  } catch (error) {
    console.error('导入失败:', error);
    throw error;
  }
}

// 执行导入
importData()
  .then(() => {
    console.log('数据导入成功完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('数据导入失败:', error);
    process.exit(1);
  });
