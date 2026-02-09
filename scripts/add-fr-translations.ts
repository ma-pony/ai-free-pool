/**
 * 为所有缺少法语翻译的活动补充 fr 翻译
 * 基于英文翻译生成法语版本
 */

import { eq, and } from 'drizzle-orm';
import { db } from '../src/libs/DB';
import { campaigns, campaignTranslations } from '../src/models/Schema';

// 英文 → 法语翻译映射（活动相关的常用词汇）
const frTranslations: Record<string, { title: string; description: string }> = {
  'zhipu-glm-zhipu-glm-free-models-unlimited-tokens': {
    title: 'Modèles gratuits Zhipu GLM (tokens illimités)',
    description: 'Plusieurs modèles entièrement gratuits (tokens illimités), dont GLM-4.7-Flash, GLM-4-Flash-250414, GLM-Z1-Flash, prenant en charge un contexte de 128K-200K.',
  },
  'aliyun-bailian-aliyun-bailian-new-user-70m-tokens': {
    title: 'Aliyun Bailian - 70M tokens pour nouveaux utilisateurs',
    description: 'Inscrivez-vous et vérifiez votre identité, les nouveaux utilisateurs reçoivent plus de 70 millions de tokens gratuits, valables 90 jours.',
  },
  'siliconflow-siliconflow-new-user-20m-tokens': {
    title: 'Siliconflow - 20M tokens pour nouveaux utilisateurs',
    description: 'Les nouveaux utilisateurs obtiennent 20 millions de tokens lors de l\'inscription par téléphone.',
  },
  'chatanywhere-chatanywhere-free-api-key-gpt-5-series': {
    title: 'Clé API gratuite ChatAnyWhere (série GPT-5)',
    description: 'Obtenez une clé API gratuite via le lien officiel. La version gratuite prend en charge gpt-5.2/5.1/5/4o (5 fois/jour), deepseek-r1/v3 (30 fois/jour), gpt-4o-mini/3.5-turbo etc. (200 fois/jour).',
  },
  'volcengine-new-user-free-quota': {
    title: 'Quota gratuit Volcengine pour nouveaux utilisateurs',
    description: 'Inscrivez-vous et vérifiez votre identité pour obtenir 500 000 tokens gratuits par modèle.',
  },
  'moonshot-ai-new-user-gift': {
    title: 'Cadeau Moonshot AI pour nouveaux utilisateurs',
    description: 'Inscrivez-vous et vérifiez votre identité pour recevoir 5 millions de tokens gratuits.',
  },
  'google-ai-studio-google-ai-studio-free-quota': {
    title: 'Quota gratuit Google AI Studio',
    description: 'Connectez-vous avec un compte Google pour utiliser gratuitement les modèles Gemini, avec des limites de requêtes par minute.',
  },
  'openrouter-openrouter-monthly-free-requests': {
    title: 'Requêtes gratuites mensuelles OpenRouter',
    description: '1 million de requêtes gratuites par mois, plus des modèles gratuits disponibles.',
  },
  '302ai-302ai-registration-phone-binding-gift': {
    title: 'Cadeau d\'inscription 302.ai',
    description: 'Les utilisateurs inscrits reçoivent 1$ après avoir lié leur téléphone.',
  },
  'burncloud-ai-api-burncloud-ai-api-customer-service-gift': {
    title: 'Cadeau service client BurnCloud AI API',
    description: 'Les utilisateurs inscrits peuvent obtenir 1$ en contactant le service client.',
  },
  'zai-zai-glm-models-free-access': {
    title: 'Accès gratuit aux modèles GLM Z.ai',
    description: 'GLM-4.5-Flash est toujours gratuit, les autres modèles GLM sont temporairement gratuits.',
  },
  'deepseek-deepseek-new-user-gift': {
    title: 'Cadeau DeepSeek pour nouveaux utilisateurs',
    description: 'Les nouveaux utilisateurs reçoivent un solde à l\'inscription. DeepSeek-V3.2 a un prix extrêmement bas (0,28$/1M tokens d\'entrée).',
  },
  'groq-groq-free-api': {
    title: 'API gratuite Groq',
    description: 'Inscrivez-vous pour obtenir une clé API gratuite, vitesse d\'inférence ultra-rapide basée sur l\'architecture LPU.',
  },
  'tencent-hunyuan-new-user-free-quota': {
    title: 'Quota gratuit Tencent Hunyuan pour nouveaux utilisateurs',
    description: 'Inscription + vérification d\'identité, 1M tokens (modèles texte partagés) + 1M tokens embedding + 50 générations d\'images + 10 générations 3D, valable 1 an.',
  },
  'baidu-qianfan-free-component-calls': {
    title: 'Appels gratuits Baidu Qianfan',
    description: 'Inscription + vérification, composants Baidu Search/Smart Search/Baike 100 appels gratuits/jour, OCR 1QPS gratuit. Supporte les derniers modèles ERNIE 5.0.',
  },
  'cloudflare-workers-ai-cloudflare-workers-ai-free-plan': {
    title: 'Plan gratuit Cloudflare Workers AI',
    description: 'Inscrivez-vous pour utiliser le plan gratuit, plus de 50 modèles open-source pour l\'inférence gratuite, intégré au réseau mondial Cloudflare.',
  },
  'cerebras-cerebras-free-inference-tier': {
    title: 'Niveau d\'inférence gratuit Cerebras',
    description: 'Inscrivez-vous pour utiliser le niveau gratuit, inférence AI la plus rapide au monde (20x plus rapide qu\'OpenAI/Anthropic), supporte plusieurs modèles open-source.',
  },
  'sambanova-sambanova-free-api-access': {
    title: 'Accès API gratuit SambaNova',
    description: 'Inscrivez-vous pour un accès gratuit à DeepSeek-R1, Llama 4, Qwen3 et d\'autres modèles open-source de premier plan, API compatible OpenAI.',
  },
  'huggingface-huggingface-unified-inference-api-free-quota': {
    title: 'Quota gratuit API d\'inférence unifiée HuggingFace',
    description: 'Inscrivez-vous pour obtenir un quota gratuit, une API pour accéder à des milliers de modèles de plus de 18 fournisseurs, zéro verrouillage fournisseur.',
  },
  'iflytek-spark-new-user-free-quota': {
    title: 'Quota gratuit iFlytek Spark pour nouveaux utilisateurs',
    description: 'Inscription + vérification d\'identité, les nouveaux utilisateurs reçoivent 2 millions de tokens, supporte les modèles Spark Max/Pro/Lite.',
  },
  'sensenova-new-user-free-quota': {
    title: 'Quota gratuit SenseNova pour nouveaux utilisateurs',
    description: 'Inscription + vérification d\'identité, les nouveaux utilisateurs reçoivent 5 millions de tokens, fortes capacités multimodales.',
  },
  'ai-skywork-new-user-free-quota': {
    title: 'Quota gratuit Skywork AI pour nouveaux utilisateurs',
    description: 'Les nouveaux utilisateurs reçoivent 1 million de tokens, modèle Skywork développé par Kunlun Tech.',
  },
  'stepfun-new-user-free-quota': {
    title: 'Quota gratuit StepFun pour nouveaux utilisateurs',
    description: 'Les nouveaux utilisateurs reçoivent 10 millions de tokens, supporte des contextes de 8K/32K/128K, excellente capacité de texte long.',
  },
  'minimax-minimax-new-user-voucher': {
    title: 'Bon MiniMax pour nouveaux utilisateurs',
    description: 'Inscription + vérification d\'identité, les nouveaux utilisateurs reçoivent un bon de 100¥, supporte les modèles multimodaux texte, voix et vidéo.',
  },
  '01ai-new-user-free-quota': {
    title: 'Quota gratuit 01.AI pour nouveaux utilisateurs',
    description: 'Les nouveaux utilisateurs reçoivent 15 millions de tokens, fondé par Kai-Fu Lee, modèles Yi avec d\'excellentes performances.',
  },
  'baichuan-ai-new-user-free-quota': {
    title: 'Quota gratuit Baichuan AI pour nouveaux utilisateurs',
    description: 'Inscription + vérification d\'identité, les nouveaux utilisateurs reçoivent 1 million de tokens, fortes capacités de recherche augmentée.',
  },
  'ohmygpt-ohmygpt-new-user-trial-credit': {
    title: 'Crédit d\'essai OhMyGPT pour nouveaux utilisateurs',
    description: 'Les nouveaux utilisateurs reçoivent 10¥ de crédit d\'essai, supporte GPT/Claude/Gemini et d\'autres modèles, points de connexion quotidiens.',
  },
  'aihubmix-aihubmix-new-user-trial-credit': {
    title: 'Crédit d\'essai AiHubMix pour nouveaux utilisateurs',
    description: 'Les nouveaux utilisateurs reçoivent 20¥ de crédit d\'essai, agrège les modèles AI nationaux et internationaux, points de connexion quotidiens.',
  },
};

async function main() {
  console.log('=== 补充法语翻译 ===\n');

  const allCampaigns = await db.select().from(campaigns).where(eq(campaigns.status, 'published'));
  let added = 0;
  let skipped = 0;

  for (const c of allCampaigns) {
    // 检查是否已有法语翻译
    const existingFr = await db
      .select()
      .from(campaignTranslations)
      .where(and(
        eq(campaignTranslations.campaignId, c.id),
        eq(campaignTranslations.locale, 'fr'),
      ))
      .limit(1);

    if (existingFr.length > 0) {
      skipped++;
      continue;
    }

    const frData = frTranslations[c.slug];
    if (!frData) {
      // 没有预设翻译，用英文翻译的数据作为 fallback
      const enTrans = await db
        .select()
        .from(campaignTranslations)
        .where(and(
          eq(campaignTranslations.campaignId, c.id),
          eq(campaignTranslations.locale, 'en'),
        ))
        .limit(1);

      if (enTrans.length > 0) {
        await db.insert(campaignTranslations).values({
          campaignId: c.id,
          locale: 'fr',
          title: enTrans[0]!.title,
          description: enTrans[0]!.description,
          isAiGenerated: true,
        });
        console.log(`⚠️ 用英文fallback: ${c.slug}`);
        added++;
      }
      continue;
    }

    await db.insert(campaignTranslations).values({
      campaignId: c.id,
      locale: 'fr',
      title: frData.title,
      description: frData.description,
      isAiGenerated: false,
    });
    console.log(`✓ 添加法语翻译: ${c.slug}`);
    added++;
  }

  console.log(`\n✅ 完成: 添加 ${added} 个, 跳过 ${skipped} 个`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
