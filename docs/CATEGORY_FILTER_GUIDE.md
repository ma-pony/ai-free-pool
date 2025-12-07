# 活动类别筛选功能指南

## 概述

活动类别筛选功能允许用户根据不同的活动类别来筛选和浏览 AI 免费额度活动。每个用户可以根据自己的需求选择感兴趣的类别，系统会显示相关的活动。

## 功能特性

### 1. 多维度筛选
- **活动类别**：按照活动类型筛选（API 服务、聊天机器人、图像生成等）
- **AI 模型**：按照支持的 AI 模型筛选（GPT-4、Claude、Gemini 等）
- **参与条件**：按照参与要求筛选（需要信用卡、需要验证等）
- **难度等级**：按照获取难度筛选（简单、中等、困难）

### 2. 用户体验优化
- **响应式设计**：桌面端侧边栏 + 移动端抽屉式筛选
- **实时反馈**：显示当前激活的筛选条件数量
- **空状态处理**：当没有可用选项时显示友好提示
- **视觉反馈**：选中项高亮显示，悬停效果

### 3. URL 同步
- 筛选条件自动同步到 URL 参数
- 支持分享带筛选条件的链接
- 浏览器前进/后退按钮支持

## 技术实现

### 数据库结构

```typescript
// tags 表
{
  id: uuid,
  name: string,        // 标签名称（例如："API 服务"）
  slug: string,        // URL 友好的标识符（例如："api-service"）
  type: string,        // 标签类型："category" | "ai_model" | "general"
  createdAt: timestamp
}

// campaign_tags 关联表
{
  id: uuid,
  campaignId: uuid,    // 关联到 campaigns 表
  tagId: uuid,         // 关联到 tags 表
  createdAt: timestamp
}
```

### API 端点

**GET /api/campaigns**

查询参数：
- `categories`: 逗号分隔的类别 slug 列表（例如：`api-service,chatbot`）
- `aiModels`: 逗号分隔的 AI 模型列表
- `conditions`: 逗号分隔的条件标签列表
- `difficultyLevel`: 难度等级（`easy` | `medium` | `hard`）
- `sortBy`: 排序方式（`latest` | `popular` | `expiring_soon` | `highest_credit`）
- `limit`: 每页数量
- `offset`: 分页偏移量

示例：
```
GET /api/campaigns?categories=api-service,chatbot&sortBy=popular&limit=20
```

### 前端组件

#### FilterSidebar（桌面端）
```tsx
<FilterSidebar
  filters={filters}
  onFilterChange={handleFilterChange}
  availableCategories={categoryTags}
  availableAiModels={aiModels}
  availableConditions={conditionTags}
/>;
```

#### FilterDrawer（移动端）
```tsx
<FilterDrawer
  isOpen={isDrawerOpen}
  onClose={() => setIsDrawerOpen(false)}
  filters={filters}
  onFilterChange={handleFilterChange}
  availableCategories={categoryTags}
  availableAiModels={aiModels}
  availableConditions={conditionTags}
/>;
```

## 使用指南

### 管理员：添加类别标签

1. **使用种子脚本添加默认类别**：
```bash
npx tsx scripts/seed-category-tags.ts
```

2. **通过 API 添加自定义类别**：
```typescript
import { createTag } from '@/services/TagService';

await createTag({
  name: '新类别名称',
  slug: 'new-category-slug',
  type: 'category'
});
```

3. **为活动关联类别标签**：
```typescript
import { addTagToCampaign } from '@/services/TagService';

await addTagToCampaign(campaignId, tagId);
```

### 用户：使用筛选功能

#### 桌面端
1. 访问活动列表页面
2. 在左侧边栏找到"活动类别"部分
3. 点击展开/收起按钮
4. 勾选感兴趣的类别
5. 活动列表会自动更新

#### 移动端
1. 访问活动列表页面
2. 点击搜索栏右侧的"筛选"按钮
3. 在弹出的抽屉中选择类别
4. 点击"应用筛选"按钮
5. 活动列表会自动更新

### 开发者：扩展筛选功能

#### 添加新的筛选维度

1. **更新类型定义**（`src/types/Campaign.ts`）：
```typescript
export type CampaignListFilters = {
  // ... 现有字段
  newFilterField?: string[];
};
```

2. **更新服务层**（`src/services/CampaignService.ts`）：
```typescript
// 在 getCampaigns 函数中添加新的筛选逻辑
if (filters?.newFilterField && filters.newFilterField.length > 0) {
  conditions.push(
    // 添加筛选条件
  );
}
```

3. **更新 API 路由**（`src/app/api/campaigns/route.ts`）：
```typescript
const newFilterField = searchParams.get('newFilter')?.split(',').filter(Boolean);
```

4. **更新前端组件**（`src/components/FilterSidebar.tsx`）：
```tsx
{ /* 添加新的筛选部分 */ }
<div className="mb-4 border-b border-gray-200 pb-4">
  {/* 筛选 UI */}
</div>;
```

## 默认类别列表

系统预设了以下类别标签：

| 中文名称 | 英文名称 | Slug |
|---------|---------|------|
| API 服务 | API Service | api-service |
| 聊天机器人 | Chatbot | chatbot |
| 图像生成 | Image Generation | image-generation |
| 视频生成 | Video Generation | video-generation |
| 音频生成 | Audio Generation | audio-generation |
| 代码助手 | Code Assistant | code-assistant |
| 文本生成 | Text Generation | text-generation |
| 翻译服务 | Translation | translation |
| 数据分析 | Data Analysis | data-analysis |
| 语音识别 | Speech Recognition | speech-recognition |
| 文档处理 | Document Processing | document-processing |
| 搜索引擎 | Search Engine | search-engine |
| 内容审核 | Content Moderation | content-moderation |
| 推荐系统 | Recommendation System | recommendation |
| 知识库 | Knowledge Base | knowledge-base |

## 性能优化

### 数据库索引
- `tags.slug` 上有唯一索引
- `tags.type` 上有索引
- `campaign_tags.campaignId` 和 `campaign_tags.tagId` 上有索引

### 查询优化
- 使用 SQL EXISTS 子查询避免 N+1 问题
- 使用 eager loading 一次性加载关联数据
- 实现分页减少数据传输量

### 前端优化
- 筛选条件变化时防抖处理
- 使用 URL 参数避免重复请求
- 骨架屏提升加载体验

## 国际化支持

筛选功能支持多语言：

**中文（zh.json）**：
```json
{
  "Filters": {
    "categories": "活动类别",
    "aiModels": "AI 模型",
    "conditions": "参与条件",
    "noCategories": "暂无分类"
  }
}
```

**英文（en.json）**：
```json
{
  "Filters": {
    "categories": "Campaign Categories",
    "aiModels": "AI Models",
    "conditions": "Participation Conditions",
    "noCategories": "No categories available"
  }
}
```

## 常见问题

### Q: 如何批量为活动添加类别标签？
A: 可以使用 `updateCampaign` 函数的 `tagIds` 参数：
```typescript
await updateCampaign(campaignId, {
  tagIds: [tagId1, tagId2, tagId3]
});
```

### Q: 类别标签可以删除吗？
A: 可以，但如果标签已关联到活动，删除会失败。需要先解除所有关联。

### Q: 如何获取某个类别下的活动数量？
A: 使用 `getTagsWithCounts` 函数：
```typescript
const tagsWithCounts = await getTagsWithCounts({ type: 'category' });
// 返回：[{ id, name, slug, type, campaignCount }]
```

### Q: 筛选条件如何组合？
A: 所有筛选条件使用 AND 逻辑组合。例如，选择"API 服务"和"简单"难度，会返回同时满足两个条件的活动。

## 未来改进

- [ ] 添加标签热度排序
- [ ] 支持标签搜索功能
- [ ] 添加"推荐类别"功能
- [ ] 支持用户自定义标签收藏
- [ ] 添加标签使用统计
- [ ] 支持标签层级结构（父子关系）

## 相关文件

- `src/models/Schema.ts` - 数据库模型定义
- `src/services/TagService.ts` - 标签服务层
- `src/services/CampaignService.ts` - 活动服务层
- `src/components/FilterSidebar.tsx` - 桌面端筛选组件
- `src/components/FilterDrawer.tsx` - 移动端筛选组件
- `src/components/CampaignFilters.tsx` - 筛选容器组件
- `src/app/api/campaigns/route.ts` - API 路由
- `src/locales/zh.json` - 中文翻译
- `src/locales/en.json` - 英文翻译
