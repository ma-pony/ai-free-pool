#!/usr/bin/env tsx

/**
 * 导入 14 个新平台到数据库
 * 基于 GitHub free-llm-api-resources 项目整理
 */

import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { campaigns, campaignTranslations, platforms } from '../src/models/Schema';

// 加载环境变量
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

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

// 14 个新平台的数据
const newPlatformsData = [
  // 1. Cohere
  {
    platform: {
      name: 'Cohere',
      nameEn: 'Cohere',
      website: 'https://cohere.com',
      description: 'Cohere 企业级 AI 平台，提供 Command、Embed、Rerank 系列模型，支持 23 种语言',
      descriptionEn: 'Cohere enterprise AI platform, provides Command, Embed, Rerank series models, supports 23 languages',
    },
    campaign: {
      title: 'Cohere 免费 API 额度',
      titleEn: 'Cohere Free API Credits',
      titleFr: 'Crédits API gratuits Cohere',
      description: '注册即可获得免费 API 额度，每月 1000 次请求，速率限制 20 req/min。支持 Command-R、Command-A、Aya 系列模型，适合企业级应用开发。',
      descriptionEn: 'Register to get free API credits, 1000 requests per month, rate limit 20 req/min. Supports Command-R, Command-A, Aya series models, ideal for enterprise application development.',
      descriptionFr: 'Inscrivez-vous pour obtenir des crédits API gratuits, 1000 requêtes par mois, limite de 20 req/min. Supporte les modèles Command-R, Command-A et Aya, idéal pour le développement d\'applications d\'entreprise.',
      officialLink: 'https://dashboard.cohere.com/welcome/register',
      freeCredit: '1000次请求/月（20 req/min）',
      aiModels: ['Command-R', 'Command-R+', 'Command-A', 'Aya-23', 'Embed-v3', 'Rerank-4'],
      difficultyLevel: 'easy',
    },
  },

  // 2. Vercel AI Gateway
  {
    platform: {
      name: 'Vercel AI Gateway',
      nameEn: 'Vercel AI Gateway',
      website: 'https://vercel.com/ai-gateway',
      description: 'Vercel AI Gateway 统一 API 网关，一个接口访问数百个 AI 模型，支持负载均衡和故障转移',
      descriptionEn: 'Vercel AI Gateway unified API gateway, access hundreds of AI models through one interface, supports load balancing and failover',
    },
    campaign: {
      title: 'Vercel AI Gateway 免费额度',
      titleEn: 'Vercel AI Gateway Free Tier',
      titleFr: 'Niveau gratuit Vercel AI Gateway',
      description: 'Vercel 所有计划均可使用 AI Gateway，每月 $5 免费额度。统一 API 访问多个提供商（OpenAI、Anthropic、Google 等），支持自动重试和故障转移，零 token 加价。',
      descriptionEn: 'AI Gateway available on all Vercel plans, $5/month free credits. Unified API to access multiple providers (OpenAI, Anthropic, Google, etc.), supports automatic retry and failover, zero token markup.',
      descriptionFr: 'AI Gateway disponible sur tous les plans Vercel, 5$/mois de crédits gratuits. API unifiée pour accéder à plusieurs fournisseurs (OpenAI, Anthropic, Google, etc.), supporte la réessai automatique et le basculement, zéro majoration de tokens.',
      officialLink: 'https://vercel.com/docs/ai-gateway',
      freeCredit: '$5/月',
      aiModels: ['GPT-4', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'Llama'],
      difficultyLevel: 'easy',
    },
  },

  // 3. Google Cloud Vertex AI
  {
    platform: {
      name: 'Google Cloud Vertex AI',
      nameEn: 'Google Cloud Vertex AI',
      website: 'https://cloud.google.com/vertex-ai',
      description: 'Google Cloud 企业级 AI 开发平台，提供 Gemini、Imagen、Veo 等模型，支持 MLOps 全流程',
      descriptionEn: 'Google Cloud enterprise AI development platform, provides Gemini, Imagen, Veo and other models, supports full MLOps workflow',
    },
    campaign: {
      title: 'Google Cloud Vertex AI 免费层级',
      titleEn: 'Google Cloud Vertex AI Free Tier',
      titleFr: 'Niveau gratuit Google Cloud Vertex AI',
      description: '新用户获赠 $300 赠金（90 天有效），可用于 Vertex AI 和 Google Cloud 产品。支持 Gemini 3、Imagen、Veo 等模型，需要 GCP 账号。',
      descriptionEn: 'New users get $300 credits (valid for 90 days) for Vertex AI and Google Cloud products. Supports Gemini 3, Imagen, Veo and other models, requires GCP account.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent 300$ de crédits (valables 90 jours) pour Vertex AI et les produits Google Cloud. Supporte Gemini 3, Imagen, Veo et d\'autres modèles, nécessite un compte GCP.',
      officialLink: 'https://console.cloud.google.com/vertex-ai/studio/multimodal',
      freeCredit: '$300（90天有效）',
      aiModels: ['Gemini-3-Pro', 'Gemini-2.5', 'Imagen', 'Veo', 'Nano'],
      difficultyLevel: 'medium',
    },
  },

  // 4. Baseten
  {
    platform: {
      name: 'Baseten',
      nameEn: 'Baseten',
      website: 'https://www.baseten.co',
      description: 'Baseten 高性能 AI 推理平台，提供模型部署、训练和 API 服务，支持自定义模型',
      descriptionEn: 'Baseten high-performance AI inference platform, provides model deployment, training and API services, supports custom models',
    },
    campaign: {
      title: 'Baseten 试用额度',
      titleEn: 'Baseten Trial Credits',
      titleFr: 'Crédits d\'essai Baseten',
      description: '注册即可获得试用额度，支持 DeepSeek V3.2、GPT OSS 120B、Kimi K2 等模型。提供专用推理服务和预优化模型 API，适合高性能推理场景。',
      descriptionEn: 'Register to get trial credits, supports DeepSeek V3.2, GPT OSS 120B, Kimi K2 and other models. Provides dedicated inference services and pre-optimized model APIs, ideal for high-performance inference scenarios.',
      descriptionFr: 'Inscrivez-vous pour obtenir des crédits d\'essai, supporte DeepSeek V3.2, GPT OSS 120B, Kimi K2 et d\'autres modèles. Fournit des services d\'inférence dédiés et des API de modèles pré-optimisés, idéal pour les scénarios d\'inférence haute performance.',
      officialLink: 'https://login.baseten.co/sign-up',
      freeCredit: '试用额度',
      aiModels: ['DeepSeek-V3.2', 'GPT-OSS-120B', 'Kimi-K2-Thinking', 'Llama-3.3-70B', 'Whisper-Large-V3'],
      difficultyLevel: 'easy',
    },
  },

  // 5. Nebius
  {
    platform: {
      name: 'Nebius',
      nameEn: 'Nebius',
      website: 'https://nebius.com',
      description: 'Nebius AI 基础设施平台，提供 GPU 云服务和 AI 模型部署，专注于欧洲市场',
      descriptionEn: 'Nebius AI infrastructure platform, provides GPU cloud services and AI model deployment, focused on European market',
    },
    campaign: {
      title: 'Nebius 试用额度',
      titleEn: 'Nebius Trial Credits',
      titleFr: 'Crédits d\'essai Nebius',
      description: '注册新用户可获得试用额度，提供 GPU 云服务和 AI 推理基础设施，支持主流开源模型部署。',
      descriptionEn: 'New users get trial credits, provides GPU cloud services and AI inference infrastructure, supports mainstream open-source model deployment.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent des crédits d\'essai, fournit des services cloud GPU et une infrastructure d\'inférence AI, supporte le déploiement de modèles open-source courants.',
      officialLink: 'https://nebius.com',
      freeCredit: '试用额度',
      aiModels: ['Llama', 'Mistral', 'Qwen', 'DeepSeek'],
      difficultyLevel: 'medium',
    },
  },

  // 6. Novita
  {
    platform: {
      name: 'Novita AI',
      nameEn: 'Novita AI',
      website: 'https://novita.ai',
      description: 'Novita AI API 平台，提供图像生成、LLM、语音等多模态 AI 服务',
      descriptionEn: 'Novita AI API platform, provides image generation, LLM, voice and other multimodal AI services',
    },
    campaign: {
      title: 'Novita AI 新用户试用额度',
      titleEn: 'Novita AI New User Trial Credits',
      titleFr: 'Crédits d\'essai Novita AI pour nouveaux utilisateurs',
      description: '注册新用户可获得试用额度，支持图像生成（Stable Diffusion、FLUX）、LLM（Qwen、Llama）、语音合成等多模态服务。',
      descriptionEn: 'New users get trial credits, supports image generation (Stable Diffusion, FLUX), LLM (Qwen, Llama), voice synthesis and other multimodal services.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent des crédits d\'essai, supporte la génération d\'images (Stable Diffusion, FLUX), LLM (Qwen, Llama), synthèse vocale et autres services multimodaux.',
      officialLink: 'https://novita.ai',
      freeCredit: '试用额度',
      aiModels: ['Stable-Diffusion', 'FLUX', 'Qwen', 'Llama', 'Whisper'],
      difficultyLevel: 'easy',
    },
  },

  // 7. AI21
  {
    platform: {
      name: 'AI21 Labs',
      nameEn: 'AI21 Labs',
      website: 'https://www.ai21.com',
      description: 'AI21 Labs 提供 Jamba 系列混合架构模型，结合 Transformer 和 SSM 技术',
      descriptionEn: 'AI21 Labs provides Jamba series hybrid architecture models, combining Transformer and SSM technology',
    },
    campaign: {
      title: 'AI21 Labs 试用额度',
      titleEn: 'AI21 Labs Trial Credits',
      titleFr: 'Crédits d\'essai AI21 Labs',
      description: '注册新用户可获得试用额度，支持 Jamba 系列模型（Jamba 1.5、Jamba-Instruct）。Jamba 采用混合架构，结合 Transformer 和 SSM，上下文窗口达 256K。',
      descriptionEn: 'New users get trial credits, supports Jamba series models (Jamba 1.5, Jamba-Instruct). Jamba uses hybrid architecture combining Transformer and SSM, context window up to 256K.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent des crédits d\'essai, supporte les modèles de la série Jamba (Jamba 1.5, Jamba-Instruct). Jamba utilise une architecture hybride combinant Transformer et SSM, fenêtre de contexte jusqu\'à 256K.',
      officialLink: 'https://www.ai21.com',
      freeCredit: '试用额度',
      aiModels: ['Jamba-1.5-Large', 'Jamba-1.5-Mini', 'Jamba-Instruct'],
      difficultyLevel: 'easy',
    },
  },

  // 8. Upstage
  {
    platform: {
      name: 'Upstage',
      nameEn: 'Upstage',
      website: 'https://www.upstage.ai',
      description: 'Upstage AI 平台，提供 Solar 系列模型和文档 AI 解决方案',
      descriptionEn: 'Upstage AI platform, provides Solar series models and document AI solutions',
    },
    campaign: {
      title: 'Upstage 试用额度',
      titleEn: 'Upstage Trial Credits',
      titleFr: 'Crédits d\'essai Upstage',
      description: '注册新用户可获得试用额度，支持 Solar 系列模型（Solar-Pro、Solar-Mini）和文档 AI 服务，专注于韩语和多语言处理。',
      descriptionEn: 'New users get trial credits, supports Solar series models (Solar-Pro, Solar-Mini) and document AI services, focused on Korean and multilingual processing.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent des crédits d\'essai, supporte les modèles de la série Solar (Solar-Pro, Solar-Mini) et les services AI de documents, axés sur le traitement coréen et multilingue.',
      officialLink: 'https://www.upstage.ai',
      freeCredit: '试用额度',
      aiModels: ['Solar-Pro', 'Solar-Mini', 'Document-AI'],
      difficultyLevel: 'easy',
    },
  },

  // 9. NLP Cloud
  {
    platform: {
      name: 'NLP Cloud',
      nameEn: 'NLP Cloud',
      website: 'https://nlpcloud.com',
      description: 'NLP Cloud 多模型 API 平台，提供 NLP、生成式 AI 和语音服务',
      descriptionEn: 'NLP Cloud multi-model API platform, provides NLP, generative AI and voice services',
    },
    campaign: {
      title: 'NLP Cloud 试用额度',
      titleEn: 'NLP Cloud Trial Credits',
      titleFr: 'Crédits d\'essai NLP Cloud',
      description: '注册新用户可获得试用额度，支持多种 NLP 任务（文本生成、摘要、翻译、情感分析等）和主流开源模型。',
      descriptionEn: 'New users get trial credits, supports various NLP tasks (text generation, summarization, translation, sentiment analysis, etc.) and mainstream open-source models.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent des crédits d\'essai, supporte diverses tâches NLP (génération de texte, résumé, traduction, analyse de sentiment, etc.) et modèles open-source courants.',
      officialLink: 'https://nlpcloud.com',
      freeCredit: '试用额度',
      aiModels: ['GPT-J', 'Llama', 'Mistral', 'Flan-T5'],
      difficultyLevel: 'easy',
    },
  },

  // 10. Modal
  {
    platform: {
      name: 'Modal',
      nameEn: 'Modal',
      website: 'https://modal.com',
      description: 'Modal serverless GPU 平台，提供按需 GPU 计算和模型部署服务',
      descriptionEn: 'Modal serverless GPU platform, provides on-demand GPU computing and model deployment services',
    },
    campaign: {
      title: 'Modal 每月 $30 免费额度',
      titleEn: 'Modal $30/month Free Credits',
      titleFr: 'Modal 30$/mois de crédits gratuits',
      description: '每月 $30 免费额度，支持 serverless GPU 计算和 AI 模型部署。按需付费，无需管理基础设施，适合快速原型开发和小规模生产。',
      descriptionEn: '$30/month free credits, supports serverless GPU computing and AI model deployment. Pay-as-you-go, no infrastructure management needed, ideal for rapid prototyping and small-scale production.',
      descriptionFr: '30$/mois de crédits gratuits, supporte le calcul GPU serverless et le déploiement de modèles AI. Paiement à l\'usage, pas de gestion d\'infrastructure nécessaire, idéal pour le prototypage rapide et la production à petite échelle.',
      officialLink: 'https://modal.com',
      freeCredit: '$30/月',
      aiModels: ['自定义模型部署'],
      difficultyLevel: 'easy',
    },
  },

  // 11. Inference.net
  {
    platform: {
      name: 'Inference.net',
      nameEn: 'Inference.net',
      website: 'https://inference.net',
      description: 'Inference.net 分布式推理平台，提供去中心化 AI 推理服务',
      descriptionEn: 'Inference.net distributed inference platform, provides decentralized AI inference services',
    },
    campaign: {
      title: 'Inference.net 试用额度',
      titleEn: 'Inference.net Trial Credits',
      titleFr: 'Crédits d\'essai Inference.net',
      description: '注册新用户可获得试用额度，基于分布式网络提供 AI 推理服务，支持主流开源模型。',
      descriptionEn: 'New users get trial credits, provides AI inference services based on distributed network, supports mainstream open-source models.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent des crédits d\'essai, fournit des services d\'inférence AI basés sur un réseau distribué, supporte les modèles open-source courants.',
      officialLink: 'https://inference.net',
      freeCredit: '试用额度',
      aiModels: ['Llama', 'Mistral', 'Stable-Diffusion'],
      difficultyLevel: 'medium',
    },
  },

  // 12. Hyperbolic
  {
    platform: {
      name: 'Hyperbolic',
      nameEn: 'Hyperbolic',
      website: 'https://hyperbolic.xyz',
      description: 'Hyperbolic AI 推理平台，提供高性能 GPU 推理和模型部署服务',
      descriptionEn: 'Hyperbolic AI inference platform, provides high-performance GPU inference and model deployment services',
    },
    campaign: {
      title: 'Hyperbolic 试用额度',
      titleEn: 'Hyperbolic Trial Credits',
      titleFr: 'Crédits d\'essai Hyperbolic',
      description: '注册新用户可获得试用额度，提供高性能 GPU 推理服务，支持 Llama、Qwen、DeepSeek 等主流模型。',
      descriptionEn: 'New users get trial credits, provides high-performance GPU inference services, supports Llama, Qwen, DeepSeek and other mainstream models.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent des crédits d\'essai, fournit des services d\'inférence GPU haute performance, supporte Llama, Qwen, DeepSeek et d\'autres modèles courants.',
      officialLink: 'https://hyperbolic.xyz',
      freeCredit: '试用额度',
      aiModels: ['Llama-3.3-70B', 'Qwen3-235B', 'DeepSeek-V3'],
      difficultyLevel: 'easy',
    },
  },

  // 13. Scaleway
  {
    platform: {
      name: 'Scaleway Generative APIs',
      nameEn: 'Scaleway Generative APIs',
      website: 'https://www.scaleway.com/en/generative-apis/',
      description: 'Scaleway 生成式 AI API 服务，欧洲云服务商提供的 AI 模型 API',
      descriptionEn: 'Scaleway Generative AI API services, AI model APIs provided by European cloud provider',
    },
    campaign: {
      title: 'Scaleway 免费 Generative APIs',
      titleEn: 'Scaleway Free Generative APIs',
      titleFr: 'APIs génératives gratuites Scaleway',
      description: '注册即可使用免费 Generative APIs，支持 Llama、Mistral 等开源模型，数据存储在欧洲，符合 GDPR 合规要求。',
      descriptionEn: 'Register to use free Generative APIs, supports Llama, Mistral and other open-source models, data stored in Europe, GDPR compliant.',
      descriptionFr: 'Inscrivez-vous pour utiliser les APIs génératives gratuites, supporte Llama, Mistral et d\'autres modèles open-source, données stockées en Europe, conforme au RGPD.',
      officialLink: 'https://www.scaleway.com/en/generative-apis/',
      freeCredit: '免费层级',
      aiModels: ['Llama-3.1', 'Mistral-7B', 'Mixtral-8x7B'],
      difficultyLevel: 'easy',
    },
  },

  // 14. Alibaba Cloud International Model Studio
  {
    platform: {
      name: 'Alibaba Cloud Model Studio',
      nameEn: 'Alibaba Cloud Model Studio',
      website: 'https://www.alibabacloud.com/en/product/model-studio',
      description: 'Alibaba Cloud 国际版模型工作室，提供通义千问国际版和多种 AI 模型服务',
      descriptionEn: 'Alibaba Cloud International Model Studio, provides Qwen international version and various AI model services',
    },
    campaign: {
      title: 'Alibaba Cloud Model Studio 试用额度',
      titleEn: 'Alibaba Cloud Model Studio Trial Credits',
      titleFr: 'Crédits d\'essai Alibaba Cloud Model Studio',
      description: '注册新用户可获得试用额度，提供通义千问国际版（Qwen）和多种开源模型。与国内百炼平台不同，面向国际市场，支持英文和多语言服务。',
      descriptionEn: 'New users get trial credits, provides Qwen international version and various open-source models. Different from domestic Bailian platform, targets international market, supports English and multilingual services.',
      descriptionFr: 'Les nouveaux utilisateurs reçoivent des crédits d\'essai, fournit la version internationale de Qwen et divers modèles open-source. Différent de la plateforme Bailian domestique, cible le marché international, supporte l\'anglais et les services multilingues.',
      officialLink: 'https://www.alibabacloud.com/en/product/model-studio',
      freeCredit: '试用额度',
      aiModels: ['Qwen-Max', 'Qwen-Plus', 'Qwen-Turbo', 'Llama', 'Mistral'],
      difficultyLevel: 'medium',
    },
  },
];

async function main() {
  console.log('开始导入 14 个新平台...\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL 环境变量未设置');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  try {
    const platformMap = new Map<string, string>();
    let platformSuccess = 0;
    let campaignSuccess = 0;

    // 导入平台和活动
    for (const data of newPlatformsData) {
      const slug = generateSlug(data.platform.nameEn);

      // 检查平台是否已存在
      const existing = await db
        .select()
        .from(platforms)
        .where(eq(platforms.slug, slug))
        .limit(1);

      let platformId: string;

      if (existing.length > 0) {
        platformId = existing[0]!.id;
        console.log(`✓ 平台已存在: ${data.platform.name} (${slug})`);
      } else {
        const [newPlatform] = await db
          .insert(platforms)
          .values({
            name: data.platform.name,
            slug,
            website: data.platform.website,
            description: data.platform.description,
            status: 'active',
          })
          .returning();

        platformId = newPlatform!.id;
        platformSuccess++;
        console.log(`✓ 创建平台: ${data.platform.name} (${slug})`);
      }

      platformMap.set(data.platform.name, platformId);

      // 创建活动
      const campaignSlug = generateSlug(`${data.platform.nameEn}-${data.campaign.titleEn}`);

      const existingCampaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.slug, campaignSlug))
        .limit(1);

      if (existingCampaign.length > 0) {
        console.log(`  ⏭ 活动已存在，跳过: ${data.campaign.title}`);
        continue;
      }

      try {
        const [newCampaign] = await db
          .insert(campaigns)
          .values({
            platformId,
            slug: campaignSlug,
            status: 'published',
            freeCredit: data.campaign.freeCredit,
            officialLink: data.campaign.officialLink,
            aiModels: data.campaign.aiModels,
            difficultyLevel: data.campaign.difficultyLevel as 'easy' | 'medium' | 'hard',
            isFeatured: false,
            needsVerification: false,
          })
          .returning();

        await db.insert(campaignTranslations).values([
          {
            campaignId: newCampaign!.id,
            locale: 'zh',
            title: data.campaign.title,
            description: data.campaign.description,
            isAiGenerated: false,
          },
          {
            campaignId: newCampaign!.id,
            locale: 'en',
            title: data.campaign.titleEn,
            description: data.campaign.descriptionEn,
            isAiGenerated: false,
          },
          {
            campaignId: newCampaign!.id,
            locale: 'fr',
            title: data.campaign.titleFr,
            description: data.campaign.descriptionFr,
            isAiGenerated: false,
          },
        ]);

        campaignSuccess++;
        console.log(`  ✓ 创建活动: ${data.campaign.title}`);
      } catch (error) {
        console.error(`  ✗ 创建活动失败: ${data.campaign.title}`, error);
      }
    }

    console.log(`\n=== 导入完成 ===`);
    console.log(`新增平台: ${platformSuccess} 个`);
    console.log(`新增活动: ${campaignSuccess} 个`);
    console.log(`总计处理: ${newPlatformsData.length} 个平台\n`);
  } catch (error) {
    console.error('❌ 导入失败:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✅ 数据导入成功完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 数据导入失败:', error);
    process.exit(1);
  });
