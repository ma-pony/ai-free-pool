#!/usr/bin/env tsx
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { platforms, campaigns, campaignTranslations } from '../src/models/Schema';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema: { platforms, campaigns, campaignTranslations } });

  // 1. Update Groq — models expanded significantly
  console.log('Updating Groq...');
  await db.update(campaigns).set({
    aiModels: ['LLaMA 4 Scout', 'LLaMA 4 Maverick', 'LLaMA 3.3 70B', 'GPT OSS 120B', 'GPT OSS 20B', 'Kimi K2', 'Qwen3-32B', 'Whisper', 'Orpheus TTS'],
    freeCredit: '免费API（30RPM，支持文本/视觉/语音/TTS，200万+用户）',
  }).where(eq(campaigns.id, '6a9e2ba1-a2fa-40e1-9e44-8b2b9122a2b5'));

  await db.update(campaignTranslations).set({
    description: '注册即获免费API，基于LPU架构超快推理。支持LLaMA 4、GPT OSS、Kimi K2、Qwen3等主流模型，含语音识别(Whisper)和语音合成(Orpheus)。免费层30RPM。',
  }).where(eq(campaignTranslations.id, '8d367e4f-5fa0-4f83-bc01-d6e6bee75cef')); // zh

  await db.update(campaignTranslations).set({
    description: 'Free API key with ultra-fast LPU inference. Supports LLaMA 4, GPT OSS, Kimi K2, Qwen3 and more, including speech-to-text (Whisper) and TTS (Orpheus). Free tier at 30 RPM.',
  }).where(eq(campaignTranslations.id, '9b5f511b-c6a6-4b18-b5ab-0bbe300d5d0b')); // en

  await db.update(campaignTranslations).set({
    description: "Clé API gratuite avec inférence ultra-rapide LPU. Supporte LLaMA 4, GPT OSS, Kimi K2, Qwen3 et plus, y compris reconnaissance vocale (Whisper) et synthèse vocale (Orpheus). Niveau gratuit à 30 RPM.",
  }).where(eq(campaignTranslations.id, '2c3af3d0-a7e2-44b5-ba85-e2c61a42b931')); // fr

  console.log('✅ Groq updated');

  // 2. Update Google AI Studio — Gemini 3.x series
  console.log('Updating Google AI Studio...');
  await db.update(campaigns).set({
    aiModels: ['Gemini 2.5 Flash', 'Gemini 2.5 Flash-Lite', 'Gemini 2.0 Flash', 'Gemma 3', 'Gemma 3n', 'Gemini Embedding'],
    freeCredit: '大部分模型免费（Gemini 3.x Pro/Imagen 4/Veo 3仅付费）',
  }).where(eq(campaigns.id, '39c2bc27-860d-45a6-ab2f-859671d49d2e'));

  await db.update(campaignTranslations).set({
    description: '免费使用Gemini 2.5 Flash/Flash-Lite、Gemini 2.0 Flash、Gemma 3/3n等模型。含Google搜索(500RPD)、代码执行等免费工具。最新Gemini 3.1 Pro预览版仅付费。',
  }).where(eq(campaignTranslations.id, 'fae23033-e534-4002-9763-20fea023a011')); // zh

  await db.update(campaignTranslations).set({
    description: 'Free access to Gemini 2.5 Flash/Flash-Lite, Gemini 2.0 Flash, Gemma 3/3n models. Includes free tools: Google Search (500 RPD), code execution, URL context. Latest Gemini 3.1 Pro preview is paid-only.',
  }).where(eq(campaignTranslations.id, 'caab393a-c4ae-4da1-a014-5f3cb1ac152a')); // en

  await db.update(campaignTranslations).set({
    description: "Accès gratuit aux modèles Gemini 2.5 Flash/Flash-Lite, Gemini 2.0 Flash, Gemma 3/3n. Outils gratuits inclus : recherche Google (500 RPD), exécution de code. Gemini 3.1 Pro en aperçu payant uniquement.",
  }).where(eq(campaignTranslations.id, 'aa26ddcc-ece1-4cab-9317-bbf61a146536')); // fr

  console.log('✅ Google AI Studio updated');

  // 3. Update OpenRouter — mention free models explicitly
  console.log('Updating OpenRouter...');
  await db.update(campaigns).set({
    aiModels: ['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Qwen', 'GLM', 'LLaMA', 'Mistral'],
    freeCredit: '24+免费模型（Google/Meta/Mistral/NVIDIA等），无需信用卡',
  }).where(eq(campaigns.id, '1fbf2788-39a6-4b3a-b6dd-a48855284fdb'));

  console.log('✅ OpenRouter updated');
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
