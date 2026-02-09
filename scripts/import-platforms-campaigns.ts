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
  titleFr: string;
  description: string;
  descriptionEn: string;
  descriptionFr: string;
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
  // 14. 腾讯混元
  {
    name: '腾讯混元',
    nameEn: 'Tencent Hunyuan',
    website: 'https://cloud.tencent.com/product/hunyuan',
    description: '腾讯云AI大模型平台，提供混元系列模型，支持文本、图像、视频、3D等多模态能力',
    descriptionEn: 'Tencent Cloud AI LLM platform, provides Hunyuan series models with text, image, video, and 3D multimodal capabilities',
  },
  // 15. 百度千帆
  {
    name: '百度千帆',
    nameEn: 'Baidu Qianfan',
    website: 'https://cloud.baidu.com/product/wenxinworkshop',
    description: '百度智能云AI开发平台，提供文心大模型及丰富的AI组件',
    descriptionEn: 'Baidu AI Cloud development platform, provides ERNIE models and rich AI components',
  },
  // 16. Cloudflare Workers AI
  {
    name: 'Cloudflare Workers AI',
    nameEn: 'Cloudflare Workers AI',
    website: 'https://developers.cloudflare.com/workers-ai/',
    description: '基于Cloudflare全球网络的AI推理平台，提供50+开源模型，Free Plan可用',
    descriptionEn: 'AI inference platform on Cloudflare global network, 50+ open-source models, Free Plan available',
  },
  // 17. Cerebras
  {
    name: 'Cerebras',
    nameEn: 'Cerebras',
    website: 'https://cloud.cerebras.ai',
    description: '全球最快AI推理平台，比OpenAI/Anthropic快20倍，提供免费层级',
    descriptionEn: 'World\'s fastest AI inference platform, 20x faster than OpenAI/Anthropic, free tier available',
  },
  // 18. SambaNova
  {
    name: 'SambaNova',
    nameEn: 'SambaNova',
    website: 'https://cloud.sambanova.ai',
    description: '高性能AI推理云平台，提供免费访问DeepSeek、Llama 4等顶级开源模型',
    descriptionEn: 'High-performance AI inference cloud, free access to DeepSeek, Llama 4 and other top open-source models',
  },
  // 19. HuggingFace Inference API
  {
    name: 'HuggingFace',
    nameEn: 'HuggingFace',
    website: 'https://huggingface.co/inference-api',
    description: '统一AI推理API，一个接口访问18+提供商的数千个模型，零供应商锁定',
    descriptionEn: 'Unified AI inference API, access thousands of models from 18+ providers through one interface, zero vendor lock-in',
  },
  // 20. 讯飞星火
  {
    name: '讯飞星火',
    nameEn: 'iFlytek Spark',
    website: 'https://xinghuo.xfyun.cn',
    description: '科大讯飞AI大模型平台，提供星火系列模型，语音能力突出',
    descriptionEn: 'iFlytek AI LLM platform, provides Spark series models with outstanding voice capabilities',
  },
  // 21. 商汤日日新
  {
    name: '商汤日日新',
    nameEn: 'SenseNova',
    website: 'https://platform.sensenova.cn',
    description: '商汤科技AI大模型平台，多模态能力强，提供SenseChat系列模型',
    descriptionEn: 'SenseTime AI LLM platform with strong multimodal capabilities, provides SenseChat series models',
  },
  // 22. 昆仑万维/天工
  {
    name: '天工AI',
    nameEn: 'Skywork',
    website: 'https://www.tiangong.cn',
    description: '昆仑万维自研AI大模型平台，提供天工系列模型',
    descriptionEn: 'Kunlun Tech self-developed AI LLM platform, provides Skywork series models',
  },
  // 23. 阶跃星辰
  {
    name: '阶跃星辰',
    nameEn: 'StepFun',
    website: 'https://platform.stepfun.com',
    description: '阶跃星辰AI平台，长文本能力突出，支持128K超长上下文',
    descriptionEn: 'StepFun AI platform, outstanding long-text capability, supports 128K ultra-long context',
  },
  // 24. MiniMax
  {
    name: 'MiniMax',
    nameEn: 'MiniMax',
    website: 'https://www.minimaxi.com',
    description: 'MiniMax AI开放平台，提供文本、语音、视频等多模态模型',
    descriptionEn: 'MiniMax AI open platform, provides text, voice, video and other multimodal models',
  },
  // 25. 零一万物
  {
    name: '零一万物',
    nameEn: '01.AI',
    website: 'https://platform.lingyiwanwu.com',
    description: '李开复创立的AI平台，提供Yi系列大模型，免费额度大',
    descriptionEn: 'AI platform founded by Kai-Fu Lee, provides Yi series LLMs with generous free quota',
  },
  // 26. 百川智能
  {
    name: '百川智能',
    nameEn: 'Baichuan AI',
    website: 'https://platform.baichuan-ai.com',
    description: '百川智能AI平台，提供Baichuan系列模型，搜索增强能力强',
    descriptionEn: 'Baichuan AI platform, provides Baichuan series models with strong search-augmented capabilities',
  },
  // 27. OhMyGPT
  {
    name: 'OhMyGPT',
    nameEn: 'OhMyGPT',
    website: 'https://www.ohmygpt.com',
    description: '第三方AI API聚合平台，支持GPT/Claude/Gemini等多种模型',
    descriptionEn: 'Third-party AI API aggregation platform, supports GPT/Claude/Gemini and other models',
  },
  // 28. AiHubMix
  {
    name: 'AiHubMix',
    nameEn: 'AiHubMix',
    website: 'https://aihubmix.com',
    description: '第三方AI模型聚合平台，聚合国内外主流模型，体验金较多',
    descriptionEn: 'Third-party AI model aggregation platform, aggregates mainstream domestic and international models',
  },
];

// 从文档中提取的所有活动数据（共11个）
const campaignsData: CampaignData[] = [
  // 1. 智谱GLM官网
  {
    platformName: '智谱GLM官网',
    title: '智谱GLM免费模型（不限token）',
    titleEn: 'Zhipu GLM Free Models (Unlimited Tokens)',
    titleFr: 'Modèles gratuits Zhipu GLM (tokens illimités)',
    description: '多个模型完全免费（不限token），包括GLM-4.7-Flash、GLM-4-Flash-250414、GLM-Z1-Flash等，支持128K-200K上下文。',
    descriptionEn: 'Multiple models completely free (unlimited tokens), including GLM-4.7-Flash, GLM-4-Flash-250414, GLM-Z1-Flash, supporting 128K-200K context.',
    descriptionFr: 'Plusieurs modèles entièrement gratuits (tokens illimités), dont GLM-4.7-Flash, GLM-4-Flash-250414, GLM-Z1-Flash, prenant en charge un contexte de 128K-200K.',
    officialLink: 'https://www.bigmodel.cn/claude-code?ic=W6STVGJOK7',
    freeCredit: '多个模型完全免费（不限token）',
    aiModels: ['GLM-4.7', 'GLM-4.7-Flash', 'GLM-4-Flash-250414', 'GLM-Z1-Flash', 'GLM-4.6'],
  },
  // 2. 阿里云百炼平台
  {
    platformName: '阿里云百炼平台',
    title: '阿里云百炼新用户7000万tokens',
    titleEn: 'Aliyun Bailian New User 70M Tokens',
    titleFr: 'Aliyun Bailian - 70M tokens pour nouveaux utilisateurs',
    description: '注册用户+实名认证，新用户一次性领取超7000万免费tokens，有效期90天。',
    descriptionEn: 'Register and verify identity, new users get over 70 million free tokens at once, valid for 90 days.',
    descriptionFr: 'Inscrivez-vous et vérifiez votre identité, les nouveaux utilisateurs reçoivent plus de 70 millions de tokens gratuits, valables 90 jours.',
    officialLink: 'https://www.aliyun.com/minisite/goods?userCode=gsjtjf7x',
    freeCredit: '新用户7000万tokens',
    aiModels: ['Qwen3-Max', 'Qwen3-Flash', 'Qwen-Plus', 'Qwen-Turbo', 'DeepSeek', 'Kimi-K2', 'MiniMax'],
  },
  // 3. 火山引擎(豆包)
  {
    platformName: '火山引擎',
    title: '火山引擎新用户免费额度',
    titleEn: 'Volcengine New User Free Quota',
    titleFr: 'Quota gratuit Volcengine pour nouveaux utilisateurs',
    description: '注册用户+实名认证，每个模型免费50万token。',
    descriptionEn: 'Register and verify identity to get 500,000 free tokens per model.',
    descriptionFr: 'Inscrivez-vous et vérifiez votre identité pour obtenir 500 000 tokens gratuits par modèle.',
    officialLink: 'https://console.volcengine.com/auth/signup',
    freeCredit: '每模型50万Token',
    aiModels: ['Doubao', 'DeepSeek', 'Kimi-K2', 'Wan2.1'],
  },
  // 4. 月之暗面（kimi）
  {
    platformName: '月之暗面',
    title: '月之暗面新用户赠送',
    titleEn: 'Moonshot AI New User Gift',
    titleFr: 'Cadeau Moonshot AI pour nouveaux utilisateurs',
    description: '新用户注册赠送15元账户余额。',
    descriptionEn: 'New users get ¥15 account balance upon registration.',
    descriptionFr: 'Inscrivez-vous et vérifiez votre identité pour recevoir 5 millions de tokens gratuits.',
    officialLink: 'https://platform.moonshot.cn',
    freeCredit: '¥15',
    aiModels: ['Kimi', 'Moonshot-v1'],
  },
  // 5. Google AI Studio
  {
    platformName: 'Google AI Studio',
    title: 'Google AI Studio免费额度',
    titleEn: 'Google AI Studio Free Quota',
    titleFr: 'Quota gratuit Google AI Studio',
    description: '注册账号，大部分模型都有免费额度。',
    descriptionEn: 'Register an account, most models have free quota.',
    descriptionFr: 'Connectez-vous avec un compte Google pour utiliser gratuitement les modèles Gemini, avec des limites de requêtes par minute.',
    officialLink: 'https://aistudio.google.com/app/',
    freeCredit: '大部分模型免费',
    aiModels: ['Gemini', 'Veo', 'Nano'],
  },
  // 6. 硅基流动
  {
    platformName: '硅基流动',
    title: '硅基流动新用户2000万Tokens',
    titleEn: 'Siliconflow New User 20M Tokens',
    titleFr: 'Siliconflow - 20M tokens pour nouveaux utilisateurs',
    description: '新用户手机注册即得2000万Tokens。',
    descriptionEn: 'New users get 20 million tokens upon phone registration.',
    descriptionFr: 'Les nouveaux utilisateurs obtiennent 20 millions de tokens lors de l\'inscription par téléphone.',
    officialLink: 'https://cloud.siliconflow.cn/i/oEtN4rtO',
    freeCredit: '新用户2000万tokens',
    aiModels: ['DeepSeek', 'Qwen', 'GLM', 'Kimi', 'MiniMax', 'Hunyuan'],
  },
  // 7. OpenRouter
  {
    platformName: 'OpenRouter',
    title: 'OpenRouter每月免费请求',
    titleEn: 'OpenRouter Monthly Free Requests',
    titleFr: 'Requêtes gratuites mensuelles OpenRouter',
    description: '每月100万次免费请求，同时还有一些免费模型可以使用。',
    descriptionEn: '1 million free requests per month, plus some free models available.',
    descriptionFr: '1 million de requêtes gratuites par mois, plus des modèles gratuits disponibles.',
    officialLink: 'https://openrouter.ai/',
    freeCredit: '每月100万次请求',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  // 8. ChatAnyWhere
  {
    platformName: 'ChatAnyWhere',
    title: 'ChatAnyWhere免费API Key（GPT-5系列）',
    titleEn: 'ChatAnyWhere Free API Key (GPT-5 Series)',
    titleFr: 'Clé API gratuite ChatAnyWhere (série GPT-5)',
    description: '点击官方链接领取免费API Key。免费版支持 gpt-5.2/5.1/5/4o(5次/天), deepseek-r1/v3(30次/天), gpt-4o-mini/3.5-turbo等(200次/天)。',
    descriptionEn: 'Get free API Key from official link. Free version supports gpt-5.2/5.1/5/4o (5 times/day), deepseek-r1/v3 (30 times/day), gpt-4o-mini/3.5-turbo etc. (200 times/day).',
    descriptionFr: 'Obtenez une clé API gratuite via le lien officiel. La version gratuite prend en charge gpt-5.2/5.1/5/4o (5 fois/jour), deepseek-r1/v3 (30 fois/jour), gpt-4o-mini/3.5-turbo etc. (200 fois/jour).',
    officialLink: 'https://github.com/chatanywhere/GPT_API_free',
    freeCredit: '200请求/天',
    aiModels: ['GPT-5.2', 'GPT-5.1', 'GPT-5', 'GPT-4o', 'DeepSeek-R1', 'DeepSeek-V3', 'Claude', 'Gemini', 'Grok'],
  },
  // 9. 302.ai
  {
    platformName: '302.ai',
    title: '302.ai注册绑定手机赠送',
    titleEn: '302.ai Registration Phone Binding Gift',
    titleFr: 'Cadeau d\'inscription 302.ai',
    description: '注册用户绑定手机后赠送1美金余额。',
    descriptionEn: 'Get $1 balance after registration and phone binding.',
    descriptionFr: 'Les utilisateurs inscrits reçoivent 1$ après avoir lié leur téléphone.',
    officialLink: 'https://302.ai/',
    freeCredit: '$1',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  // 10. BurnCloud AI API
  {
    platformName: 'BurnCloud AI API',
    title: 'BurnCloud AI API客服赠送',
    titleEn: 'BurnCloud AI API Customer Service Gift',
    titleFr: 'Cadeau service client BurnCloud AI API',
    description: '注册用户找客服领取赠送1美金余额。',
    descriptionEn: 'Contact customer service after registration to get $1 balance.',
    descriptionFr: 'Les utilisateurs inscrits peuvent obtenir 1$ en contactant le service client.',
    officialLink: 'https://ai.burncloud.com/register?aff=opK9',
    freeCredit: '$1',
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM'],
  },
  // 11. Z.ai (GLM国外版)
  {
    platformName: 'Z.ai',
    title: 'Z.ai GLM模型免费使用',
    titleEn: 'Z.ai GLM Models Free Access',
    titleFr: 'Accès gratuit aux modèles GLM Z.ai',
    description: 'GLM-4.5-Flash一直免费使用，其他GLM模型限时免费。',
    descriptionEn: 'GLM-4.5-Flash is always free, other GLM models are temporarily free.',
    descriptionFr: 'GLM-4.5-Flash est toujours gratuit, les autres modèles GLM sont temporairement gratuits.',
    officialLink: 'https://z.ai/chat',
    freeCredit: 'GLM-4.5-Flash永久免费',
    aiModels: ['GLM-4.5-Flash', 'GLM-4', 'GLM-3'],
  },
  // 12. DeepSeek
  {
    platformName: 'DeepSeek',
    title: 'DeepSeek新用户赠送',
    titleEn: 'DeepSeek New User Gift',
    titleFr: 'Cadeau DeepSeek pour nouveaux utilisateurs',
    description: '新用户注册赠送余额，DeepSeek-V3.2价格极低（$0.28/1M input tokens）。',
    descriptionEn: 'New users get balance upon registration. DeepSeek-V3.2 has extremely low pricing ($0.28/1M input tokens).',
    descriptionFr: 'Les nouveaux utilisateurs reçoivent un solde à l\'inscription. DeepSeek-V3.2 a un prix extrêmement bas (0,28$/1M tokens d\'entrée).',
    officialLink: 'https://platform.deepseek.com',
    freeCredit: '注册赠送余额',
    aiModels: ['DeepSeek-V3.2', 'DeepSeek-R1'],
  },
  // 13. Groq
  {
    platformName: 'Groq',
    title: 'Groq免费API',
    titleEn: 'Groq Free API',
    titleFr: 'API gratuite Groq',
    description: '注册即可获取免费API密钥，基于LPU架构提供超快推理速度。',
    descriptionEn: 'Get free API key upon registration, provides ultra-fast inference speed based on LPU architecture.',
    descriptionFr: 'Inscrivez-vous pour obtenir une clé API gratuite, vitesse d\'inférence ultra-rapide basée sur l\'architecture LPU.',
    officialLink: 'https://console.groq.com/keys',
    freeCredit: '免费API（有速率限制）',
    aiModels: ['LLaMA', 'Mixtral', 'Gemma'],
  },
  // 14. 腾讯混元
  {
    platformName: '腾讯混元',
    title: '腾讯混元新用户免费额度',
    titleEn: 'Tencent Hunyuan New User Free Quota',
    titleFr: 'Quota gratuit Tencent Hunyuan pour nouveaux utilisateurs',
    description: '新用户注册+实名认证，赠送100万token（文本模型共享）+ embedding 100万token + 混元生图50次 + 混元生3D 10次，有效期1年。',
    descriptionEn: 'New users get 1M tokens (shared across text models) + 1M embedding tokens + 50 image generations + 10 3D generations, valid for 1 year.',
    descriptionFr: 'Inscription + vérification d\'identité, 1M tokens (modèles texte partagés) + 1M tokens embedding + 50 générations d\'images + 10 générations 3D, valable 1 an.',
    officialLink: 'https://cloud.tencent.com/product/hunyuan',
    freeCredit: '100万token + 生图50次',
    aiModels: ['Hunyuan-T1', 'Hunyuan-TurboS', 'HY-2.0-Think', 'HY-2.0-Instruct', 'Hunyuan-Vision'],
  },
  // 15. 百度千帆
  {
    platformName: '百度千帆',
    title: '百度千帆免费组件调用',
    titleEn: 'Baidu Qianfan Free Component Calls',
    titleFr: 'Appels gratuits Baidu Qianfan',
    description: '注册+实名认证，百度搜索/智能搜索/百科等组件每天100次免费调用，通用OCR等1QPS免费。支持ERNIE 5.0等最新模型。',
    descriptionEn: 'Register and verify identity, Baidu Search/Smart Search/Baike components 100 free calls/day, OCR 1QPS free. Supports latest ERNIE 5.0 models.',
    descriptionFr: 'Inscription + vérification, composants Baidu Search/Smart Search/Baike 100 appels gratuits/jour, OCR 1QPS gratuit. Supporte les derniers modèles ERNIE 5.0.',
    officialLink: 'https://cloud.baidu.com/product/wenxinworkshop',
    freeCredit: '多组件每天100次免费',
    aiModels: ['ERNIE-5.0-Thinking', 'ERNIE-X1.1', 'ERNIE-4.5-Turbo', 'DeepSeek'],
  },
  // 16. Cloudflare Workers AI
  {
    platformName: 'Cloudflare Workers AI',
    title: 'Cloudflare Workers AI免费计划',
    titleEn: 'Cloudflare Workers AI Free Plan',
    titleFr: 'Plan gratuit Cloudflare Workers AI',
    description: '注册Cloudflare账号即可使用Free Plan，提供50+开源模型免费推理，与Cloudflare全球网络深度集成。',
    descriptionEn: 'Register Cloudflare account to use Free Plan, 50+ open-source models for free inference, deeply integrated with Cloudflare global network.',
    descriptionFr: 'Inscrivez-vous pour utiliser le plan gratuit, plus de 50 modèles open-source pour l\'inférence gratuite, intégré au réseau mondial Cloudflare.',
    officialLink: 'https://developers.cloudflare.com/workers-ai/',
    freeCredit: 'Free Plan（50+模型）',
    aiModels: ['LLaMA', 'Mistral', 'Stable Diffusion', 'Whisper'],
  },
  // 17. Cerebras
  {
    platformName: 'Cerebras',
    title: 'Cerebras免费推理层级',
    titleEn: 'Cerebras Free Inference Tier',
    titleFr: 'Niveau d\'inférence gratuit Cerebras',
    description: '注册即可使用免费层级，全球最快AI推理速度（比OpenAI/Anthropic快20倍），支持多种开源模型。',
    descriptionEn: 'Register to use free tier, world\'s fastest AI inference (20x faster than OpenAI/Anthropic), supports multiple open-source models.',
    descriptionFr: 'Inscrivez-vous pour utiliser le niveau gratuit, inférence AI la plus rapide au monde (20x plus rapide qu\'OpenAI/Anthropic), supporte plusieurs modèles open-source.',
    officialLink: 'https://cloud.cerebras.ai',
    freeCredit: '免费层级（速率限制）',
    aiModels: ['Llama-3.3-70B', 'Llama-3.1-8B', 'Qwen3-32B', 'Qwen3-235B', 'GPT-OSS-120B'],
  },
  // 18. SambaNova
  {
    platformName: 'SambaNova',
    title: 'SambaNova免费API访问',
    titleEn: 'SambaNova Free API Access',
    titleFr: 'Accès API gratuit SambaNova',
    description: '注册即可免费访问DeepSeek-R1、Llama 4、Qwen3等顶级开源模型，OpenAI兼容API。',
    descriptionEn: 'Register for free access to DeepSeek-R1, Llama 4, Qwen3 and other top open-source models, OpenAI-compatible API.',
    descriptionFr: 'Inscrivez-vous pour un accès gratuit à DeepSeek-R1, Llama 4, Qwen3 et d\'autres modèles open-source de premier plan, API compatible OpenAI.',
    officialLink: 'https://cloud.sambanova.ai',
    freeCredit: '免费访问（速率限制）',
    aiModels: ['DeepSeek-R1', 'DeepSeek-V3.2', 'Llama-4-Maverick', 'Llama-3.3-70B', 'Qwen3-235B'],
  },
  // 19. HuggingFace Inference API
  {
    platformName: 'HuggingFace',
    title: 'HuggingFace统一推理API免费额度',
    titleEn: 'HuggingFace Unified Inference API Free Quota',
    titleFr: 'Quota gratuit API d\'inférence unifiée HuggingFace',
    description: '注册即获免费额度，一个API统一访问Cerebras、Groq、SambaNova等18+提供商的数千个模型，零供应商锁定。',
    descriptionEn: 'Register to get free quota, one API to access thousands of models from 18+ providers including Cerebras, Groq, SambaNova, zero vendor lock-in.',
    descriptionFr: 'Inscrivez-vous pour obtenir un quota gratuit, une API pour accéder à des milliers de modèles de plus de 18 fournisseurs, zéro verrouillage fournisseur.',
    officialLink: 'https://huggingface.co/inference-api',
    freeCredit: '免费额度（统一接口）',
    aiModels: ['LLaMA', 'Mistral', 'Qwen', 'DeepSeek', 'Gemma', 'FLUX'],
  },
  // 20. 讯飞星火
  {
    platformName: '讯飞星火',
    title: '讯飞星火新用户免费额度',
    titleEn: 'iFlytek Spark New User Free Quota',
    titleFr: 'Quota gratuit iFlytek Spark pour nouveaux utilisateurs',
    description: '注册+实名认证，新用户赠送200万tokens，支持星火Max/Pro/Lite等多个模型。',
    descriptionEn: 'Register and verify identity, new users get 2 million tokens, supports Spark Max/Pro/Lite models.',
    descriptionFr: 'Inscription + vérification d\'identité, les nouveaux utilisateurs reçoivent 2 millions de tokens, supporte les modèles Spark Max/Pro/Lite.',
    officialLink: 'https://xinghuo.xfyun.cn',
    freeCredit: '200万tokens',
    aiModels: ['Spark-Max', 'Spark-Pro', 'Spark-Lite'],
  },
  // 21. 商汤日日新
  {
    platformName: '商汤日日新',
    title: '商汤日日新新用户免费额度',
    titleEn: 'SenseNova New User Free Quota',
    titleFr: 'Quota gratuit SenseNova pour nouveaux utilisateurs',
    description: '注册+实名认证，新用户赠送500万tokens，多模态能力强。',
    descriptionEn: 'Register and verify identity, new users get 5 million tokens, strong multimodal capabilities.',
    descriptionFr: 'Inscription + vérification d\'identité, les nouveaux utilisateurs reçoivent 5 millions de tokens, fortes capacités multimodales.',
    officialLink: 'https://platform.sensenova.cn',
    freeCredit: '500万tokens',
    aiModels: ['SenseChat-5', 'SenseChat-Turbo', 'SenseChat-Character'],
  },
  // 22. 天工AI
  {
    platformName: '天工AI',
    title: '天工AI新用户免费额度',
    titleEn: 'Skywork New User Free Quota',
    titleFr: 'Quota gratuit Skywork AI pour nouveaux utilisateurs',
    description: '注册新用户赠送100万tokens，昆仑万维自研天工大模型。',
    descriptionEn: 'New users get 1 million tokens, Kunlun Tech self-developed Skywork LLM.',
    descriptionFr: 'Les nouveaux utilisateurs reçoivent 1 million de tokens, modèle Skywork développé par Kunlun Tech.',
    officialLink: 'https://www.tiangong.cn',
    freeCredit: '100万tokens',
    aiModels: ['天工3.0', 'SkyChat'],
  },
  // 23. 阶跃星辰
  {
    platformName: '阶跃星辰',
    title: '阶跃星辰新用户免费额度',
    titleEn: 'StepFun New User Free Quota',
    titleFr: 'Quota gratuit StepFun pour nouveaux utilisateurs',
    description: '注册新用户赠送1000万tokens，支持8K/32K/128K多种上下文长度，长文本能力突出。',
    descriptionEn: 'New users get 10 million tokens, supports 8K/32K/128K context lengths, outstanding long-text capability.',
    descriptionFr: 'Les nouveaux utilisateurs reçoivent 10 millions de tokens, supporte des contextes de 8K/32K/128K, excellente capacité de texte long.',
    officialLink: 'https://platform.stepfun.com',
    freeCredit: '1000万tokens',
    aiModels: ['Step-1-8k', 'Step-1-32k', 'Step-1-128k', 'Step-1V'],
  },
  // 24. MiniMax
  {
    platformName: 'MiniMax',
    title: 'MiniMax新用户代金券',
    titleEn: 'MiniMax New User Voucher',
    titleFr: 'Bon MiniMax pour nouveaux utilisateurs',
    description: '注册+实名认证，新用户赠送100元代金券，支持文本、语音、视频等多模态模型。',
    descriptionEn: 'Register and verify identity, new users get ¥100 voucher, supports text, voice, video multimodal models.',
    descriptionFr: 'Inscription + vérification d\'identité, les nouveaux utilisateurs reçoivent un bon de 100¥, supporte les modèles multimodaux texte, voix et vidéo.',
    officialLink: 'https://www.minimaxi.com',
    freeCredit: '¥100代金券',
    aiModels: ['abab6.5s', 'abab6.5g', 'MiniMax-Text-01'],
  },
  // 25. 零一万物
  {
    platformName: '零一万物',
    title: '零一万物新用户免费额度',
    titleEn: '01.AI New User Free Quota',
    titleFr: 'Quota gratuit 01.AI pour nouveaux utilisateurs',
    description: '注册新用户赠送1500万tokens，李开复创立，Yi系列模型性能优秀。',
    descriptionEn: 'New users get 15 million tokens, founded by Kai-Fu Lee, Yi series models with excellent performance.',
    descriptionFr: 'Les nouveaux utilisateurs reçoivent 15 millions de tokens, fondé par Kai-Fu Lee, modèles Yi avec d\'excellentes performances.',
    officialLink: 'https://platform.lingyiwanwu.com',
    freeCredit: '1500万tokens',
    aiModels: ['Yi-Large', 'Yi-Medium', 'Yi-Vision'],
  },
  // 26. 百川智能
  {
    platformName: '百川智能',
    title: '百川智能新用户免费额度',
    titleEn: 'Baichuan AI New User Free Quota',
    titleFr: 'Quota gratuit Baichuan AI pour nouveaux utilisateurs',
    description: '注册+实名认证，新用户赠送100万tokens，搜索增强能力强。',
    descriptionEn: 'Register and verify identity, new users get 1 million tokens, strong search-augmented capabilities.',
    descriptionFr: 'Inscription + vérification d\'identité, les nouveaux utilisateurs reçoivent 1 million de tokens, fortes capacités de recherche augmentée.',
    officialLink: 'https://platform.baichuan-ai.com',
    freeCredit: '100万tokens',
    aiModels: ['Baichuan2-Turbo', 'Baichuan2-53B'],
  },
  // 27. OhMyGPT
  {
    platformName: 'OhMyGPT',
    title: 'OhMyGPT新用户体验金',
    titleEn: 'OhMyGPT New User Trial Credit',
    titleFr: 'Crédit d\'essai OhMyGPT pour nouveaux utilisateurs',
    description: '注册新用户赠送10元体验金，支持GPT/Claude/Gemini等多种模型，签到送积分。',
    descriptionEn: 'New users get ¥10 trial credit, supports GPT/Claude/Gemini and other models, daily check-in for points.',
    descriptionFr: 'Les nouveaux utilisateurs reçoivent 10¥ de crédit d\'essai, supporte GPT/Claude/Gemini et d\'autres modèles, points de connexion quotidiens.',
    officialLink: 'https://www.ohmygpt.com',
    freeCredit: '¥10体验金',
    aiModels: ['GPT-4', 'GPT-3.5', 'Claude', 'Gemini'],
  },
  // 28. AiHubMix
  {
    platformName: 'AiHubMix',
    title: 'AiHubMix新用户体验金',
    titleEn: 'AiHubMix New User Trial Credit',
    titleFr: 'Crédit d\'essai AiHubMix pour nouveaux utilisateurs',
    description: '注册新用户赠送20元体验金，聚合国内外主流AI模型，每日签到送积分。',
    descriptionEn: 'New users get ¥20 trial credit, aggregates mainstream domestic and international AI models, daily check-in for points.',
    descriptionFr: 'Les nouveaux utilisateurs reçoivent 20¥ de crédit d\'essai, agrège les modèles AI nationaux et internationaux, points de connexion quotidiens.',
    officialLink: 'https://aihubmix.com',
    freeCredit: '¥20体验金',
    aiModels: ['GPT-4', 'Claude-3.5', 'Qwen', 'GLM', 'DeepSeek'],
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
        // 更新已有平台数据
        await db
          .update(platforms)
          .set({
            name: platformData.name,
            website: platformData.website,
            description: platformData.description,
          })
          .where(eq(platforms.slug, slug));
        console.log(`✓ 更新平台: ${platformData.name} (${slug})`);
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
        const existing = existingCampaign[0]!;

        // 检查核心数据是否有变化
        const dataChanged =
          existing.freeCredit !== campaignData.freeCredit ||
          JSON.stringify(existing.aiModels) !== JSON.stringify(campaignData.aiModels);

        if (!dataChanged) {
          console.log(`✓ 活动无变化，跳过: ${campaignData.title} (${slug})`);
          skipCount++;
          continue;
        }

        // 数据有变化：将旧活动标记为 expired
        await db
          .update(campaigns)
          .set({ status: 'expired' })
          .where(eq(campaigns.id, existing.id));
        console.log(`⏰ 旧活动已过期: ${campaignData.title} (${slug})`);

        // 用新 slug 创建新活动（加版本号避免冲突）
        const version = Date.now().toString(36);
        const newSlug = `${slug}-v${version}`;

        try {
          const [newCampaign] = await db
            .insert(campaigns)
            .values({
              platformId,
              slug: newSlug,
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
            {
              campaignId: newCampaign!.id,
              locale: 'fr',
              title: campaignData.titleFr,
              description: campaignData.descriptionFr,
              isAiGenerated: false,
            },
          ]);

          console.log(`✓ 创建新版活动: ${campaignData.title} (${newSlug})`);
          successCount++;
        } catch (error) {
          console.log(`✗ 创建新版活动失败: ${campaignData.title} - ${error}`);
          skipCount++;
        }
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
          {
            campaignId: newCampaign!.id,
            locale: 'fr',
            title: campaignData.titleFr,
            description: campaignData.descriptionFr,
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
