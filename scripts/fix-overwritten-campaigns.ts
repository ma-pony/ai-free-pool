/**
 * 修复脚本：将之前被错误覆盖的4个活动恢复原始数据并标记为expired
 * 然后用新数据创建新活动
 *
 * 被影响的活动：
 * 1. 智谱GLM - 原: 2000万token → 被改为: 多个模型完全免费
 * 2. 阿里云百炼 - 原: 每模型100万Token → 被改为: 7000万tokens
 * 3. 硅基流动 - 原: ¥14+部分免费模型 → 被改为: 2000万tokens
 * 4. ChatAnyWhere - 原: 200请求/天 → 被改为: GPT-5.2系列描述
 */

import { eq } from 'drizzle-orm';
import { db } from '../src/libs/DB';
import {
  campaignTranslations,
  campaigns,
} from '../src/models/Schema';

// 被错误覆盖的活动 slug → 恢复的原始数据
const overwrittenCampaigns = [
  {
    slug: 'glm-zhipu-glm-registration-verification-gift',
    originalData: {
      freeCredit: '2000万token',
      aiModels: ['GLM-4', 'GLM-4-Flash', 'GLM-3-Turbo'],
    },
    originalZh: {
      title: '智谱GLM注册实名认证赠送',
      description: '注册用户+实名认证，赠送2000万token体验包。',
    },
    originalEn: {
      title: 'Zhipu GLM Registration Verification Gift',
      description: 'Register and verify identity to get 20 million token experience package.',
    },
  },
  {
    slug: 'aliyun-bailian-new-user-free-quota',
    originalData: {
      freeCredit: '每模型100万Token',
      aiModels: ['Qwen', 'DeepSeek', 'Kimi-K2', 'MiniMax'],
    },
    originalZh: {
      title: '阿里云百炼新用户免费额度',
      description: '注册用户+实名认证，每个模型免费100万Token。仅中国大陆版（北京）模型有免费额度，新人免费额度有效期通常是30~90天。',
    },
    originalEn: {
      title: 'Aliyun Bailian New User Free Quota',
      description: 'Register and verify identity to get 1 million free tokens per model. Only China mainland (Beijing) models have free quota, valid for 30-90 days.',
    },
  },
  {
    slug: 'siliconflow-new-user-gift',
    originalData: {
      freeCredit: '¥14 + 部分免费模型',
      aiModels: ['DeepSeek', 'Qwen', 'GLM', 'Kimi', 'MiniMax', 'Hunyuan'],
    },
    originalZh: {
      title: '硅基流动新用户赠送',
      description: '新用户手机注册赠送14元账户余额，另有Qwen、GLM、DeepSeek、混元部分免费模型可使用。',
    },
    originalEn: {
      title: 'Siliconflow New User Gift',
      description: 'New users get ¥14 account balance with phone registration, plus free access to some Qwen, GLM, DeepSeek, Hunyuan models.',
    },
  },
  {
    slug: 'chatanywhere-chatanywhere-free-api-key',
    originalData: {
      freeCredit: '200请求/天',
      aiModels: ['GPT', 'DeepSeek', 'Claude', 'Gemini', 'Grok'],
    },
    originalZh: {
      title: 'ChatAnyWhere免费API Key',
      description: '点击官方链接领取免费API Key，限制200请求/天/IP&Key调用频率。免费版支持gpt-5.1, gpt-5, gpt-4o一天5次；deepseek-r1, deepseek-v3一天30次；gpt-4o-mini等一天200次。',
    },
    originalEn: {
      title: 'ChatAnyWhere Free API Key',
      description: 'Get free API Key from official link, limited to 200 requests/day. Free version supports gpt-5.1, gpt-5, gpt-4o 5 times/day; deepseek-r1, deepseek-v3 30 times/day; gpt-4o-mini etc. 200 times/day.',
    },
  },
];

// 新活动数据
const newCampaigns = [
  {
    platformSlug: 'zhipu-glm',
    title: '智谱GLM免费模型（不限token）',
    titleEn: 'Zhipu GLM Free Models (Unlimited Tokens)',
    description: '多个模型完全免费（不限token），包括GLM-4.7-Flash、GLM-4-Flash-250414、GLM-Z1-Flash等，支持128K-200K上下文。',
    descriptionEn: 'Multiple models completely free (unlimited tokens), including GLM-4.7-Flash, GLM-4-Flash-250414, GLM-Z1-Flash, supporting 128K-200K context.',
    officialLink: 'https://www.bigmodel.cn/claude-code?ic=W6STVGJOK7',
    freeCredit: '多个模型完全免费（不限token）',
    aiModels: ['GLM-4.7', 'GLM-4.7-Flash', 'GLM-4-Flash-250414', 'GLM-Z1-Flash', 'GLM-4.6'],
  },
  {
    platformSlug: 'aliyun-bailian',
    title: '阿里云百炼新用户7000万tokens',
    titleEn: 'Aliyun Bailian New User 70M Tokens',
    description: '注册用户+实名认证，新用户一次性领取超7000万免费tokens，有效期90天。',
    descriptionEn: 'Register and verify identity, new users get over 70 million free tokens at once, valid for 90 days.',
    officialLink: 'https://www.aliyun.com/minisite/goods?userCode=gsjtjf7x',
    freeCredit: '新用户7000万tokens',
    aiModels: ['Qwen3-Max', 'Qwen3-Flash', 'Qwen-Plus', 'Qwen-Turbo', 'DeepSeek', 'Kimi-K2', 'MiniMax'],
  },
  {
    platformSlug: 'siliconflow',
    title: '硅基流动新用户2000万Tokens',
    titleEn: 'Siliconflow New User 20M Tokens',
    description: '新用户手机注册即得2000万Tokens。',
    descriptionEn: 'New users get 20 million tokens upon phone registration.',
    officialLink: 'https://cloud.siliconflow.cn/i/oEtN4rtO',
    freeCredit: '新用户2000万tokens',
    aiModels: ['DeepSeek', 'Qwen', 'GLM', 'Kimi', 'MiniMax', 'Hunyuan'],
  },
  {
    platformSlug: 'chatanywhere',
    title: 'ChatAnyWhere免费API Key（GPT-5系列）',
    titleEn: 'ChatAnyWhere Free API Key (GPT-5 Series)',
    description: '点击官方链接领取免费API Key。免费版支持 gpt-5.2/5.1/5/4o(5次/天), deepseek-r1/v3(30次/天), gpt-4o-mini/3.5-turbo等(200次/天)。',
    descriptionEn: 'Get free API Key from official link. Free version supports gpt-5.2/5.1/5/4o (5 times/day), deepseek-r1/v3 (30 times/day), gpt-4o-mini/3.5-turbo etc. (200 times/day).',
    officialLink: 'https://github.com/chatanywhere/GPT_API_free',
    freeCredit: '200请求/天',
    aiModels: ['GPT-5.2', 'GPT-5.1', 'GPT-5', 'GPT-4o', 'DeepSeek-R1', 'DeepSeek-V3', 'Claude', 'Gemini', 'Grok'],
  },
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function main() {
  console.log('=== 修复被错误覆盖的活动 ===\n');

  // Step 1: 恢复旧活动原始数据并标记为 expired
  console.log('--- Step 1: 恢复旧活动并标记为 expired ---');
  for (const item of overwrittenCampaigns) {
    const existing = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.slug, item.slug))
      .limit(1);

    if (existing.length === 0) {
      console.log(`⚠️ 未找到活动: ${item.slug}`);
      continue;
    }

    const campaign = existing[0]!;

    // 恢复原始数据
    await db
      .update(campaigns)
      .set({
        freeCredit: item.originalData.freeCredit,
        aiModels: item.originalData.aiModels,
        status: 'expired',
      })
      .where(eq(campaigns.id, campaign.id));

    // 恢复翻译
    const translations = await db
      .select()
      .from(campaignTranslations)
      .where(eq(campaignTranslations.campaignId, campaign.id));

    for (const t of translations) {
      if (t.locale === 'zh') {
        await db
          .update(campaignTranslations)
          .set({ title: item.originalZh.title, description: item.originalZh.description })
          .where(eq(campaignTranslations.id, t.id));
      } else if (t.locale === 'en') {
        await db
          .update(campaignTranslations)
          .set({ title: item.originalEn.title, description: item.originalEn.description })
          .where(eq(campaignTranslations.id, t.id));
      }
    }

    console.log(`✓ 已恢复并过期: ${item.slug}`);
  }

  // Step 2: 用新数据创建新活动
  console.log('\n--- Step 2: 创建新活动 ---');
  for (const item of newCampaigns) {
    // 查找平台 ID
    const { platforms } = await import('../src/models/Schema');
    const platform = await db
      .select()
      .from(platforms)
      .where(eq(platforms.slug, item.platformSlug))
      .limit(1);

    if (platform.length === 0) {
      console.log(`⚠️ 未找到平台: ${item.platformSlug}`);
      continue;
    }

    const platformId = platform[0]!.id;
    const slug = generateSlug(`${item.platformSlug}-${item.titleEn}`);

    // 检查新 slug 是否已存在
    const existingNew = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.slug, slug))
      .limit(1);

    if (existingNew.length > 0) {
      console.log(`⚠️ 新活动已存在，跳过: ${slug}`);
      continue;
    }

    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        platformId,
        slug,
        status: 'published',
        freeCredit: item.freeCredit,
        officialLink: item.officialLink,
        aiModels: item.aiModels,
        difficultyLevel: 'easy',
        isFeatured: false,
        needsVerification: false,
      })
      .returning();

    await db.insert(campaignTranslations).values([
      {
        campaignId: newCampaign!.id,
        locale: 'zh',
        title: item.title,
        description: item.description,
        isAiGenerated: false,
      },
      {
        campaignId: newCampaign!.id,
        locale: 'en',
        title: item.titleEn,
        description: item.descriptionEn,
        isAiGenerated: false,
      },
    ]);

    console.log(`✓ 创建新活动: ${item.title} (${slug})`);
  }

  console.log('\n✅ 修复完成');
  process.exit(0);
}

main().catch((error) => {
  console.error('修复失败:', error);
  process.exit(1);
});
