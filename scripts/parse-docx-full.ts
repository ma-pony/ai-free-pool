#!/usr/bin/env tsx

/**
 * 完整解析 Word 文档中的所有平台和活动数据
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import mammoth from 'mammoth';

async function parseDocx() {
  const docxPath = resolve(process.cwd(), 'scripts', 'Free Tokens 薅AI羊毛.docx');
  const buffer = readFileSync(docxPath);

  // 提取纯文本
  const textResult = await mammoth.extractRawText({ buffer });
  const text = textResult.value;

  console.log('=== 完整文档文本内容 ===\n');
  console.log(text);
  console.log('\n=== 文本提取完成 ===\n');

  return text;
}

// 执行解析
parseDocx()
  .then((text) => {
    console.log('文档解析成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('解析失败:', error);
    process.exit(1);
  });
