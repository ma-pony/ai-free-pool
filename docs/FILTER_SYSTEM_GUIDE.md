# 筛选系统完整指南

## 概述

活动列表页的筛选系统包含三个主要维度：

1. **分类（Categories）** - 活动类型（API、聊天、图像生成等）
2. **AI 模型（AI Models）** - 支持的 AI 模型（GPT-4、Claude、Gemini 等）
3. **参与条件（Conditions）** - 参与要求和优势（邮箱验证、无需信用卡等）

## 🎯 设计原则

### 统一配置管理

所有筛选选项都采用**配置文件 + 数据库**的双层架构：

```
配置文件（唯一数据源）
    ↓
种子脚本
    ↓
数据库
    ↓
筛选器组件
```

### 为什么这样设计？

1. **易于维护**：修改配置文件即可，无需改代码
2. **数据一致性**：配置文件是唯一数据源
3. **灵活扩展**：添加新选项只需修改配置
4. **多对多关系**：每个活动可以有多个分类、模型、条件

## 📁 核心文件

### 配置文件

| 文件 | 内容 | 数量 |
|------|------|------|
| `src/config/categories.ts` | 分类定义 | 12 个 |
| `src/config/aiModels.ts` | AI 模型定义 | 16 个 |
| `src/config/conditionTags.ts` | 参与条件定义 | 20 个 |

### 种子脚本

| 文件 | 作用 |
|------|------|
| `scripts/seed-categories-simple.ts` | 初始化分类 |
| `scripts/seed-condition-tags.ts` | 初始化参与条件 |
| `scripts/seed-all.ts` | 一键初始化所有数据 |

### 数据库表

| 表名 | 用途 |
|------|------|
| `tags` | 存储分类（type='category'） |
| `condition_tags` | 存储参与条件 |
| `campaign_tags` | 活动-分类关联（多对多） |
| `campaign_condition_tags` | 活动-条件关联（多对多） |
| `campaigns.aiModels` | AI 模型（JSONB 数组） |

## 🚀 快速开始

### 初始化所有数据

```bash
npx tsx scripts/seed-all.ts
```

这会初始化：
- 12 个分类标签
- 20 个参与条件标签

### 单独初始化

```bash
# 只初始化分类
npx tsx scripts/seed-categories-simple.ts

# 只初始化参与条件
npx tsx scripts/seed-condition-tags.ts
```

## 📂 1. 分类系统

### 当前分类（12个）

**首页显示（6个）：**
- 🔌 API
- ✏️ 编辑器
- 💬 聊天
- 🎨 图像生成
- 🎬 视频
- 🎵 音频

**其他分类（6个）：**
- 💻 代码助手
- 📝 文本生成
- 🌐 翻译
- 📊 数据分析
- 🎤 语音识别
- 📄 文档处理

### 添加新分类

编辑 `src/config/categories.ts`：

```typescript
{
  slug: 'new-category',
  icon: '🆕',
  nameZh: '新分类',
  nameEn: 'New Category',
  order: 13,
  showOnHome: false,  // 是否在首页显示
}
```

然后运行：
```bash
npx tsx scripts/seed-categories-simple.ts
```

### 为活动添加分类

```typescript
import { db } from '@/libs/DB';
import { campaignTags } from '@/models/Schema';

await db.insert(campaignTags).values({
  campaignId: 'campaign-uuid',
  tagId: 'category-tag-uuid',
});
```

## 🤖 2. AI 模型系统

### 当前模型（16个）

**OpenAI 系列：**
- GPT-4
- GPT-4 Turbo
- GPT-3.5 Turbo
- DALL-E 3
- Whisper

**Anthropic Claude 系列：**
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku

**Google Gemini 系列：**
- Gemini Pro
- Gemini Ultra

**其他：**
- Llama 3, Llama 2
- Midjourney
- Stable Diffusion
- GitHub Copilot
- Codex

### 数据结构

AI 模型存储在 `campaigns.aiModels` 字段（JSONB 数组）：

```json
{
  "aiModels": ["gpt-4", "claude-3-opus", "gemini-pro"]
}
```

### 添加新模型

编辑 `src/config/aiModels.ts`：

```typescript
{
  id: 'new-model',
  name: 'New Model',
  provider: 'Provider Name',
  category: 'text',  // text, image, audio, code
  order: 17,
  isPopular: false,
}
```

**注意**：AI 模型不需要运行种子脚本，因为它们直接存储在活动的 JSONB 字段中。

### 为活动添加 AI 模型

```typescript
import { db } from '@/libs/DB';
import { campaigns } from '@/models/Schema';

await db.update(campaigns)
  .set({
    aiModels: ['gpt-4', 'claude-3-opus'],
  })
  .where(eq(campaigns.id, campaignId));
```

## 🏷️ 3. 参与条件系统

### 当前条件（20个）

**要求类（10个）：**
- 📧 邮箱验证
- 📱 手机验证
- 💳 信用卡绑定
- 🆔 身份验证
- 🎓 学生认证
- 👨‍💻 开发者认证
- 🐙 GitHub 账号
- 📢 社交媒体分享
- 📋 问卷调查
- 🎟️ 推荐码

**优势类（10个）：**
- 🚫💳 无需信用卡
- ⚡ 即时访问
- ♾️ 永久有效
- 🔌 API 访问
- 💼 商业使用
- 🔓 开源项目
- 🎓 教育优惠
- ∞ 无限请求
- 🎯 优先支持
- 🆓 免费试用

### 难度权重系统

每个条件都有 `difficultyWeight` 属性：

- **要求类**：正数（1-10），越高越难
- **优势类**：负数或0，降低难度

系统会根据条件自动计算活动难度：

```typescript
import { calculateDifficulty } from '@/config/conditionTags';

const difficulty = calculateDifficulty([
  'email-verification', // +1
  'phone-verification', // +2
  'no-credit-card', // -3
]);
// 结果: 'easy' (总权重 = 0)
```

### 添加新条件

编辑 `src/config/conditionTags.ts`：

```typescript
{
  slug: 'new-condition',
  nameZh: '新条件',
  nameEn: 'New Condition',
  type: 'requirement',  // 或 'benefit'
  difficultyWeight: 3,
  order: 21,
  icon: '🆕',
  description: {
    zh: '中文描述',
    en: 'English description',
  },
}
```

然后运行：
```bash
npx tsx scripts/seed-condition-tags.ts
```

### 为活动添加条件

```typescript
import { db } from '@/libs/DB';
import { campaignConditionTags } from '@/models/Schema';

await db.insert(campaignConditionTags).values({
  campaignId: 'campaign-uuid',
  tagId: 'condition-tag-uuid',
});
```

## 🔍 筛选器 UI

### 桌面端

- 左侧固定侧边栏
- 可折叠的筛选区块
- 显示已选数量徽章
- 支持多选

### 移动端

- 抽屉式筛选器
- 点击"筛选"按钮打开
- 相同的筛选功能

### 筛选逻辑

```typescript
// URL 格式
/campaigns?categories=api,chat&aiModels=gpt-4&conditions=no-credit-card

// 筛选条件
{
  categoryTags: ['api', 'chat'],
  aiModels: ['gpt-4'],
  conditionTags: ['no-credit-card'],
}
```

## 📊 数据关系

### 分类（多对多）

```
campaigns ←→ campaign_tags ←→ tags (type='category')
```

### AI 模型（数组）

```
campaigns.aiModels: ['gpt-4', 'claude-3-opus']
```

### 参与条件（多对多）

```
campaigns ←→ campaign_condition_tags ←→ condition_tags
```

## 🛠️ 开发指南

### 修改筛选选项的流程

1. **修改配置文件**
   - 分类：`src/config/categories.ts`
   - AI 模型：`src/config/aiModels.ts`
   - 参与条件：`src/config/conditionTags.ts`

2. **运行种子脚本**（仅分类和条件需要）
   ```bash
   npx tsx scripts/seed-all.ts
   ```

3. **重启开发服务器**
   ```bash
   npm run dev
   ```

4. **验证更改**
   - 访问活动列表页
   - 检查筛选器是否显示新选项

### 为活动批量添加标签

```typescript
import { eq, like } from 'drizzle-orm';
// 示例：为所有 OpenAI 相关活动添加 API 分类
import { db } from '@/libs/DB';
import { campaigns, campaignTags, tags } from '@/models/Schema';

// 1. 获取 API 分类的 ID
const apiCategory = await db
  .select()
  .from(tags)
  .where(eq(tags.slug, 'api'))
  .limit(1);

// 2. 获取所有 OpenAI 相关活动
const openaiCampaigns = await db
  .select()
  .from(campaigns)
  .where(like(campaigns.platformId, '%openai%'));

// 3. 批量关联
for (const campaign of openaiCampaigns) {
  await db.insert(campaignTags).values({
    campaignId: campaign.id,
    tagId: apiCategory[0].id,
  }).onConflictDoNothing();
}
```

## ⚠️ 注意事项

### 分类和条件

- ✅ 修改配置文件
- ✅ 运行种子脚本
- ❌ 不要直接修改数据库
- ❌ 不要随意更改 slug

### AI 模型

- ✅ 修改配置文件
- ✅ 直接在活动中使用新模型 ID
- ❌ 不需要运行种子脚本
- ⚠️ 确保模型 ID 与配置一致

### 数据一致性

- 配置文件是唯一数据源
- 种子脚本负责同步到数据库
- 组件从数据库读取数据
- 保持三者同步

## 🐛 故障排查

### 问题：筛选器显示"没有分类"

**解决**：
```bash
npx tsx scripts/seed-categories-simple.ts
```

### 问题：筛选器显示"没有条件"

**解决**：
```bash
npx tsx scripts/seed-condition-tags.ts
```

### 问题：AI 模型列表为空

**原因**：活动数据中没有 AI 模型

**解决**：为活动添加 AI 模型数据

### 问题：筛选后没有结果

**原因**：活动没有关联标签

**解决**：为活动添加相应的分类、条件标签

## 📚 相关文档

- [分类系统设置指南](./CATEGORY_SETUP.md)
- [分类快速参考](./CATEGORY_QUICK_REFERENCE.md)
- [修复总结](./CATEGORY_FIX_SUMMARY.md)

## 💡 最佳实践

1. **语义化命名**：slug 应该清晰表达含义
2. **合理分组**：按类型、提供商等分组展示
3. **权重设计**：合理设置难度权重
4. **图标选择**：使用相关的 emoji 增强识别
5. **保持同步**：修改配置后立即运行种子脚本
6. **测试验证**：修改后测试筛选功能
7. **文档更新**：添加新选项时更新文档

## 🔄 完整工作流

```
1. 需求：添加新的筛选选项
   ↓
2. 修改配置文件
   ↓
3. 运行种子脚本（分类/条件）
   ↓
4. 重启开发服务器
   ↓
5. 测试筛选器
   ↓
6. 为活动添加标签
   ↓
7. 验证筛选结果
   ↓
8. 更新文档
```
