import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import mammoth from 'mammoth';

async function extractDocxContent() {
  try {
    const docxPath = join(process.cwd(), 'scripts', 'Free Tokens 薅AI羊毛.docx');
    const buffer = readFileSync(docxPath);

    // 提取纯文本
    const textResult = await mammoth.extractRawText({ buffer });
    console.log('=== 文档文本内容 ===\n');
    console.log(textResult.value);
    console.log('\n=== 文本提取完成 ===\n');

    // 提取 HTML 以便更好地理解结构
    const htmlResult = await mammoth.convertToHtml({ buffer });
    console.log('=== 文档 HTML 结构 ===\n');
    console.log(htmlResult.value);
    console.log('\n=== HTML 提取完成 ===\n');

    return {
      text: textResult.value,
      html: htmlResult.value,
    };
  } catch (error) {
    console.error('提取文档内容失败:', error);
    throw error;
  }
}

// 执行提取
extractDocxContent()
  .then(() => {
    console.log('文档内容提取成功');
    process.exit(0);
  })
  .catch((error) => {
    console.error('执行失败:', error);
    process.exit(1);
  });
