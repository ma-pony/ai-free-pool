# 分类系统快速参考

## 🎯 核心概念

**分类（Category）** = 活动的类型标签，用于组织和筛选活动

## 📁 关键文件

| 文件 | 作用 | 何时修改 |
|------|------|----------|
| `src/config/categories.ts` | 分类定义（唯一数据源） | 添加/修改分类时 |
| `scripts/seed-categories-simple.ts` | 初始化数据库 | 很少需要修改 |
| `src/components/CategoryLinks.tsx` | 首页分类展示 | 很少需要修改 |

## 🚀 常用命令

### 初始化分类数据
```bash
npx tsx scripts/seed-categories-simple.ts
```

### 测试分类筛选
```bash
npx tsx scripts/test-category-filter.ts
```

## ➕ 添加新分类

### 步骤 1：修改配置文件

编辑 `src/config/categories.ts`：

```typescript
{
  slug: 'new-category',        // URL 标识符
  icon: '🆕',                  // Emoji 图标
  nameZh: '新分类',            // 中文名称
  nameEn: 'New Category',      // 英文名称
  order: 13,                   // 排序（数字越小越靠前）
  showOnHome: false,           // 是否在首页显示
}
```

### 步骤 2：同步到数据库

```bash
npx tsx scripts/seed-categories-simple.ts
```

### 步骤 3：重启应用

```bash
# 如果开发服务器正在运行，重启它
npm run dev
```

## 🏠 首页分类

### 当前显示的分类（6个）

1. 🔌 API
2. ✏️ 编辑器
3. 💬 聊天
4. 🎨 图像生成
5. 🎬 视频
6. 🎵 音频

### 如何控制首页显示

在配置文件中设置 `showOnHome: true`

## 🔍 筛选器分类

### 当前所有分类（12个）

包括首页的 6 个 + 以下 6 个：

7. 💻 代码助手
8. 📝 文本生成
9. 🌐 翻译
10. 📊 数据分析
11. 🎤 语音识别
12. 📄 文档处理

### 筛选器自动显示

所有 `type='category'` 的标签都会在筛选器中显示

## 🔗 URL 格式

### 单个分类
```
/campaigns?categories=api
```

### 多个分类
```
/campaigns?categories=api,chat,image-generation
```

## 🏷️ 为活动添加分类

### 在代码中

```typescript
import { db } from '@/libs/DB';
import { campaignTags } from '@/models/Schema';

// 关联分类到活动
await db.insert(campaignTags).values({
  campaignId: 'campaign-uuid',
  tagId: 'category-tag-uuid',
});
```

### 通过管理后台

在活动编辑表单中选择分类（需要实现）

## ⚠️ 注意事项

### ✅ 应该做的

- 在配置文件中添加新分类
- 运行种子脚本同步到数据库
- 使用有意义的 slug（小写、连字符分隔）
- 为新分类选择合适的 emoji

### ❌ 不应该做的

- 直接在数据库中修改分类
- 随意更改现有分类的 slug
- 硬编码分类列表
- 跳过种子脚本直接修改数据库

## 🐛 故障排查

### 问题：首页不显示分类

**检查**：
1. 配置文件中 `showOnHome: true`
2. 应用已重启

### 问题：筛选器显示"没有分类"

**解决**：
```bash
npx tsx scripts/seed-categories-simple.ts
```

### 问题：点击分类没有结果

**原因**：活动没有关联分类标签

**解决**：为活动添加分类（通过管理后台或数据库）

### 问题：分类名称显示错误

**检查**：
1. 配置文件中的 `nameZh` 和 `nameEn`
2. 语言切换是否正常工作

## 📚 相关文档

- [详细设置指南](./CATEGORY_SETUP.md)
- [修复总结](./CATEGORY_FIX_SUMMARY.md)

## 💡 最佳实践

1. **语义化命名**：slug 应该清晰表达分类含义
2. **图标选择**：使用相关的 emoji，便于识别
3. **排序规则**：常用分类 order 值更小
4. **首页精选**：只在首页显示最重要的 6-8 个分类
5. **保持同步**：修改配置后立即运行种子脚本

## 🔄 数据流

```
配置文件 (categories.ts)
    ↓
种子脚本 (seed-categories-simple.ts)
    ↓
数据库 (tags 表)
    ↓
    ├─→ 首页组件 (CategoryLinks.tsx)
    └─→ 筛选器 (FilterSidebar.tsx)
```
