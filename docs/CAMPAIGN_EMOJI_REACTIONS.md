# Campaign Emoji Reactions Feature

## 功能概述

在活动卡片上添加表情反应功能，允许用户对活动进行快速的情感反馈。

## 实现内容

### 1. 新建组件
**文件**: `src/components/CampaignEmojiReactions.tsx`

**功能**:
- 显示活动的表情反应统计
- 支持添加/删除表情反应
- 两种显示模式：compact（卡片）和 full（详情页）
- 未登录用户点击跳转到登录页

**支持的表情**:
- 👍 赞
- ❤️ 喜欢
- 🔥 火热
- 🎉 庆祝
- 😍 超爱
- 🚀 牛逼

### 2. API 路由

#### GET /api/campaigns/[id]/emoji-reactions
**文件**: `src/app/api/campaigns/[id]/emoji-reactions/route.ts`

**功能**: 获取活动的所有表情反应统计

**返回**:
```json
{
  "success": true,
  "data": [
    {
      "emoji": "👍",
      "count": 10,
      "userReacted": true
    }
  ]
}
```

#### POST /api/campaigns/[id]/emoji-reactions/[emoji]
**文件**: `src/app/api/campaigns/[id]/emoji-reactions/[emoji]/route.ts`

**功能**: 添加表情反应

**要求**: 需要登录

**限制**: 每个用户对每个活动的每个表情只能反应一次

#### DELETE /api/campaigns/[id]/emoji-reactions/[emoji]
**文件**: `src/app/api/campaigns/[id]/emoji-reactions/[emoji]/route.ts`

**功能**: 删除表情反应

**要求**: 需要登录

### 3. 数据库 Schema

**表名**: `campaign_emoji_reactions`

**字段**:
```typescript
{
  id: uuid (primary key)
  campaignId: uuid (foreign key -> campaigns.id)
  userId: varchar(255) (Clerk user ID)
  emoji: varchar(10)
  createdAt: timestamp
}
```

**索引**:
- `campaign_emoji_reactions_campaign_id_idx` - 按活动查询
- `campaign_emoji_reactions_user_id_idx` - 按用户查询

**唯一约束**:
- `campaign_emoji_reactions_user_campaign_emoji_unique` - 防止重复反应

### 4. 更新 CampaignCard

**文件**: `src/components/CampaignCard.tsx`

**变更**:
- 导入 `CampaignEmojiReactions` 组件
- 在 Footer 区域添加表情反应显示
- 与 ReactionStats 一起显示

## 使用方式

### 在活动卡片中
```tsx
<CampaignCard
  campaign={campaign}
  locale={locale}
  showReactions={true} // 启用反应功能
/>;
```

### 在活动详情页
```tsx
<CampaignEmojiReactions
  campaignId={campaign.id}
  compact={false} // 完整显示模式
/>;
```

## 显示效果

### Compact 模式（活动卡片）
```
┌─────────────────────────────────┐
│  活动卡片内容                    │
├─────────────────────────────────┤
│  ✅80%(8) ❌20%(2)              │
│  👍 10  ❤️ 5  🔥 3  😊 +       │
└─────────────────────────────────┘
```

### Full 模式（详情页）
```
┌─────────────────────────────────┐
│  [👍 10]  [❤️ 5]  [🔥 3]       │
│  [😊 Add Reaction]              │
│                                 │
│  点击展开表情选择器：            │
│  👍 ❤️ 🔥 🎉 😍 🚀            │
└─────────────────────────────────┘
```

## 交互流程

### 1. 添加反应
```
用户点击表情 → 检查登录 → 调用 API → 刷新统计
```

### 2. 删除反应
```
用户点击已反应的表情 → 调用 API → 刷新统计
```

### 3. 展开表情选择器
```
用户点击 "😊 +" → 显示下拉菜单 → 选择表情 → 添加反应
```

## 事件处理

### 防止冒泡
所有按钮点击都使用 `e.preventDefault()` 和 `e.stopPropagation()` 防止触发卡片链接。

```typescript
const handleReaction = async (emoji: string, e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  // ...
};
```

## 数据库迁移

### 生成迁移
```bash
npm run db:generate
```

### 应用迁移
```bash
npm run db:migrate
```

或者重启 Next.js 服务器，迁移会自动应用。

## 与现有功能的区别

### ReactionStats (活动状态反馈)
- ✅ 仍然有效
- ❌ 已失效
- 📝 信息有误
- 用于反馈活动的实际状态

### CampaignEmojiReactions (情感反应)
- 👍 ❤️ 🔥 🎉 😍 🚀
- 用于表达对活动的情感态度
- 更轻量级的互动方式

## 性能优化

### 1. 懒加载
只在需要时获取反应数据

### 2. 批量查询
使用 SQL GROUP BY 聚合统计

### 3. 索引优化
- campaignId 索引用于快速查询
- userId 索引用于用户反应查询
- 唯一约束防止重复数据

## 安全性

### 1. 认证检查
所有写操作都需要登录

### 2. 数据验证
- 验证活动存在
- 验证 emoji 格式
- 防止重复反应

### 3. SQL 注入防护
使用 Drizzle ORM 参数化查询

## 实施状态

✅ **已完成** - 2024年12月7日

### 数据库迁移
- ✅ 生成迁移文件: `migrations/0004_mixed_storm.sql`
- ✅ 应用迁移: `campaign_emoji_reactions` 表已创建
- ✅ 索引和约束已正确设置

### 代码实现
- ✅ `CampaignEmojiReactions` 组件已创建
- ✅ API 路由已实现（GET, POST, DELETE）
- ✅ `CampaignCard` 已集成表情反应功能
- ✅ Schema 已更新
- ✅ 无 TypeScript 错误

## 测试场景

- [ ] 未登录用户点击跳转到登录页
- [ ] 已登录用户可以添加反应
- [ ] 已登录用户可以删除自己的反应
- [ ] 不能重复添加相同的反应
- [ ] 反应统计正确显示
- [ ] 用户反应状态正确标记（高亮）
- [ ] 表情选择器正确显示/隐藏
- [ ] 点击反应不触发卡片链接
- [ ] Compact 和 Full 模式都正常工作

## 相关文件

- `src/components/CampaignEmojiReactions.tsx` - 主组件
- `src/components/CampaignCard.tsx` - 活动卡片（更新）
- `src/app/api/campaigns/[id]/emoji-reactions/route.ts` - GET API
- `src/app/api/campaigns/[id]/emoji-reactions/[emoji]/route.ts` - POST/DELETE API
- `src/models/Schema.ts` - 数据库 schema（更新）

## 未来优化

1. **自定义表情** - 允许用户选择更多表情
2. **反应排行** - 显示最受欢迎的活动
3. **反应通知** - 活动创建者收到反应通知
4. **反应趋势** - 显示反应随时间的变化
5. **批量操作** - 一次对多个活动反应
