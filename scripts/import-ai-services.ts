import { db } from '../src/server/db';
import { aiServices } from '../src/server/db/schema';

type AIService = {
  name: string;
  registerUrl: string;
  giftRules: string;
  supportedModels: string;
  category?: string;
};

// 从文档中提取的AI服务数据
const services: AIService[] = [
  {
    name: 'Siliconflow(硅基流动)',
    registerUrl: 'https://cloud.siliconflow.cn/i/ttKDdkVT',
    giftRules: '注册用户赠送20元余额，邀请用户注册赠送10元余额',
    supportedModels: '支持国内外常见的所有模型',
    category: '第三方中转平台',
  },
  {
    name: 'ChatAnyWhere',
    registerUrl: 'https://github.com/chatanywhere/GPT_API_free',
    giftRules: '免费API Key限制200请求/天/IP&Key调用频率。免费版支持gpt-5.1, gpt-5, gpt-4o，gpt-4.1一天5次；支持deepseek-r1, deepseek-v3, deepseek-v3-2-exp一天30次，支持gpt-4o-mini，gpt-3.5-turbo，gpt-4.1-mini，gpt-4.1-nano, gpt-5-mini，gpt-5-nano一天200次',
    supportedModels: '支持 gpt | deepseek | claude | gemini | grok 等排名靠前的常用大模型',
    category: '第三方中转平台',
  },
  {
    name: '302.ai',
    registerUrl: 'https://302.ai/',
    giftRules: '注册用户绑定手机后赠送1美金余额',
    supportedModels: '支持国内外常见的所有模型',
    category: '第三方中转平台',
  },
  {
    name: 'BurnCloud AI API',
    registerUrl: 'https://ai.burncloud.com/register?aff=opK9',
    giftRules: '注册用户找客服领取赠送1美金余额',
    supportedModels: '支持国内外常见的所有模型',
    category: '第三方中转平台',
  },
  {
    name: 'Z.ai (GLM国外版)',
    registerUrl: 'https://z.ai/chat',
    giftRules: 'GLM-4.5-Flash一直免费使用，其他GLM模型限时免费',
    supportedModels: 'GLM系列模型',
    category: 'GLM国外版',
  },
];

async function importServices() {
  try {
    console.log('开始导入AI服务数据...\n');

    for (const service of services) {
      console.log(`正在导入: ${service.name}`);

      // 检查是否已存在
      const existing = await db.query.aiServices.findFirst({
        where: (aiServices, { eq }) => eq(aiServices.name, service.name),
      });

      if (existing) {
        console.log(`  ⚠️  ${service.name} 已存在，跳过`);
        continue;
      }

      // 插入数据
      await db.insert(aiServices).values({
        name: service.name,
        registerUrl: service.registerUrl,
        giftRules: service.giftRules,
        supportedModels: service.supportedModels,
        category: service.category || '其他',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`  ✅ ${service.name} 导入成功`);
    }

    console.log('\n所有数据导入完成！');

    // 查询并显示导入的数据
    const allServices = await db.query.aiServices.findMany();
    console.log(`\n数据库中共有 ${allServices.length} 条记录`);
  } catch (error) {
    console.error('导入数据时出错:', error);
    throw error;
  }
}

// 执行导入
importServices()
  .then(() => {
    console.log('✅ 导入任务完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 导入任务失败:', error);
    process.exit(1);
  });
