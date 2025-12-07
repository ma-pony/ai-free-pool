# 分类系统设置指南

## 问题背景

之前存在的问题：
- 首页硬编码了 6 个分类
- 数据库种子脚本定义了 15 个不同的分类
- 两者的 slug 不匹配，导致筛选功能失效

## 解决方案

现在使用统一的分类配置文件：`src/config/categories.ts`

### 分类配置结构

```typescript
{
  slug: string; // URL 友好的标识符
  icon: string; // Emoji 图标
  nameZh: string; // 中文名称
  nameEn: string; // 英文名称
  order: number; // 排序顺序
  showOnHome: boolean; // 是否在首页显示
}
```

### 当前分类列表

**首页显示的分类（6个）：**
1. API (🔌)
2. 编辑器 (✏️)
3. 聊天 (💬)
4. 图像生成 (🎨)
5. 视频 (🎬)
6. 音频 (🎵)

**其他分类：**
7. 代码助手 (💻)
8. 文本生成 (📝)
9. 翻译 (🌐)
10. 数据分析 (📊)
11. 语音识别 (🎤)
12. 文档处理 (📄)

## 初始化步骤

### 1. 运行种子脚本

首次设置或重置分类数据：

```bash
npx tsx scripts/seed-category-tags.ts
```

这会将 `src/config/categories.ts` 中定义的所有分类写入数据库的 `tags` 表。

### 2. 验证数据

检查数据库中的分类：

```sql
SELECT * FROM tags WHERE type = 'category' ORDER BY name;
```

### 3. 测试筛选功能

运行测试脚本验证分类筛选：

```bash
npx tsx scripts/test-category-filter.ts
```

## 使用方式

### 在首页显示分类

`src/components/CategoryLinks.tsx` 会自动从配置中读取 `showOnHome: true` 的分类。

### 在筛选器中使用

活动列表页会从数据库读取所有 `type='category'` 的标签，并在侧边栏显示。

### 添加新分类

1. 在 `src/config/categories.ts` 中添加新分类
2. 运行种子脚本更新数据库
3. 重启应用

```typescript
{
  slug: 'new-category',
  icon: '🆕',
  nameZh: '新分类',
  nameEn: 'New Category',
  order: 13,
  showOnHome: false,
}
```

## 数据一致性

### 保持同步的关键点：

1. **唯一数据源**：`src/config/categories.ts` 是分类定义的唯一来源
2. **种子脚本**：从配置文件读取并写入数据库
3. **首页组件**：从配置文件读取首页分类
4. **筛选器**：从数据库读取所有分类（已通过种子脚本同步）

### 修改分类时的注意事项：

- ⚠️ **不要直接修改数据库**中的分类数据
- ✅ **始终修改配置文件**，然后运行种子脚本
- ✅ **slug 不要随意更改**，因为可能已有活动关联了该分类
- ✅ **添加新分类**比修改现有分类更安全

## 故障排查

### 问题：首页分类点击后筛选器没有结果

**原因**：数据库中没有对应的分类标签

**解决**：
```bash
npx tsx scripts/seed-category-tags.ts
```

### 问题：筛选器显示"没有分类"

**原因**：
1. 数据库中没有 `type='category'` 的标签
2. 或者标签存在但没有关联任何活动

**解决**：
1. 运行种子脚本初始化分类
2. 确保活动已正确关联分类标签

### 问题：首页和筛选器的分类不一致

**原因**：配置文件和数据库不同步

**解决**：
1. 检查 `src/config/categories.ts`
2. 重新运行种子脚本
3. 清除缓存并重启应用

## 技术实现

### 数据库结构

```sql
-- tags 表
CREATE TABLE tags (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,  -- 'category' | 'ai_model' | 'general'
  created_at TIMESTAMP NOT NULL
);

-- campaign_tags 关联表（多对多）
CREATE TABLE campaign_tags (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  tag_id UUID REFERENCES tags(id),
  created_at TIMESTAMP NOT NULL
);
```

### URL 参数格式

- 单个分类：`/campaigns?categories=api`
- 多个分类：`/campaigns?categories=api,chat,image-generation`

### API 筛选逻辑

```typescript
// 在 CampaignService 中
if (filters?.categoryTags && filters.categoryTags.length > 0) {
  conditions.push(
    sql`EXISTS (
      SELECT 1 FROM campaign_tags
      JOIN tags ON tags.id = campaign_tags.tag_id
      WHERE campaign_tags.campaign_id = campaigns.id
      AND tags.type = 'category'
      AND tags.slug IN (${filters.categoryTags})
    )`
  );
}
```

## 相关文件

- `src/config/categories.ts` - 分类配置（唯一数据源）
- `scripts/seed-category-tags.ts` - 种子脚本
- `src/components/CategoryLinks.tsx` - 首页分类展示
- `src/components/FilterSidebar.tsx` - 筛选器侧边栏
- `src/services/CampaignService.ts` - 分类筛选逻辑
- `src/services/TagService.ts` - 标签服务
