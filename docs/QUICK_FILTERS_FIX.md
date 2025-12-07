# 快捷筛选功能修复

## 问题描述

活动列表页的快捷筛选按钮（全部、新用户专享、即将过期、高额度、最热门）点击后没有生效。

## 问题原因

### 1. 类型不匹配

快捷筛选传递的 filter 对象包含了不存在的属性：

```typescript
// ❌ 错误的实现
filter: {
  sortBy: 'expiring_soon',
  isExpiringSoon: true,  // 这个属性不存在于 CampaignListFilters 类型
}
```

`CampaignListFilters` 类型中没有 `isExpiringSoon` 和 `hasHighCredit` 属性。

### 2. 筛选条件被覆盖

点击快捷筛选时，使用了 `...filters` 展开运算符，这会保留之前的 `sortBy` 和 `difficultyLevel`，导致新的筛选条件可能被旧值覆盖。

## 解决方案

### 1. 修复类型定义

更新 `QuickFilters.tsx` 中的类型定义：

```typescript
// ✅ 正确的类型定义
type QuickFilter = {
  id: string;
  label: string;
  icon: string;
  filter: {
    sortBy?: 'latest' | 'popular' | 'expiring_soon' | 'highest_credit';
    difficultyLevel?: 'easy' | 'medium' | 'hard';
  };
};
```

### 2. 移除无效属性

更新快捷筛选配置：

```typescript
// ✅ 正确的配置
const quickFilters: QuickFilter[] = [
  {
    id: 'all',
    label: t('quickFilter_all'),
    icon: '🌟',
    filter: { sortBy: 'latest' },
  },
  {
    id: 'new_user',
    label: t('quickFilter_new_user'),
    icon: '🎁',
    filter: { difficultyLevel: 'easy', sortBy: 'latest' },
  },
  {
    id: 'expiring_soon',
    label: t('quickFilter_expiring_soon'),
    icon: '⏰',
    filter: { sortBy: 'expiring_soon' }, // 移除 isExpiringSoon
  },
  {
    id: 'high_credit',
    label: t('quickFilter_high_credit'),
    icon: '💰',
    filter: { sortBy: 'highest_credit' }, // 移除 hasHighCredit
  },
  {
    id: 'popular',
    label: t('quickFilter_popular'),
    icon: '🔥',
    filter: { sortBy: 'popular' },
  },
];
```

### 3. 改进筛选逻辑

更新 `CampaignListClient.tsx` 中的快捷筛选处理：

```typescript
// ✅ 正确的处理逻辑
<QuickFilters
  activeFilter={activeQuickFilter}
  onFilterChange={(filterId, filter) => {
    setActiveQuickFilter(filterId);
    // 快捷筛选时，保留基础筛选条件，但应用新的快捷筛选
    const newFilters: CampaignListFilters = {
      status: 'published',
      includeExpired: false,
      includeDeleted: false,
      // 保留搜索、分类、AI模型、条件标签
      search: filters.search,
      categoryTags: filters.categoryTags,
      aiModels: filters.aiModels,
      conditionTags: filters.conditionTags,
      // 应用快捷筛选
      ...filter,
    };
    handleFilterChange(newFilters);
  }}
/>
```

## 快捷筛选功能说明

### 1. 全部 (🌟)
- **排序**：最新
- **效果**：显示所有活动，按创建时间倒序

### 2. 新用户专享 (🎁)
- **难度**：简单
- **排序**：最新
- **效果**：只显示难度为"简单"的活动，适合新用户

### 3. 即将过期 (⏰)
- **排序**：即将过期
- **效果**：按结束日期升序排列，最快过期的排在前面

### 4. 高额度 (💰)
- **排序**：最高额度
- **效果**：按免费额度降序排列（字母序）

### 5. 最热门 (🔥)
- **排序**：最热门
- **效果**：按用户反馈数量降序排列

## 后端支持

后端 API 已经支持所有排序选项：

### CampaignService.ts 排序实现

```typescript
switch (filters?.sortBy) {
  case 'popular':
    // 按反馈数量排序
    orderByClause = sql`(
      SELECT COUNT(*) FROM reactions
      WHERE reactions.campaign_id = campaigns.id
    ) DESC`;
    break;

  case 'expiring_soon':
    // 按结束日期排序（最快过期的在前）
    orderByClause = sql`campaigns.end_date ASC NULLS LAST`;
    break;

  case 'highest_credit':
    // 按免费额度排序
    orderByClause = sql`campaigns.free_credit DESC NULLS LAST`;
    break;

  case 'latest':
  default:
    // 按创建时间排序（最新的在前）
    orderByClause = sql`campaigns.created_at DESC`;
    break;
}
```

## 测试验证

### 手动测试步骤

1. **访问活动列表页**
   ```
   http://localhost:3000/campaigns
   ```

2. **测试"全部"筛选**
   - 点击"🌟 全部"按钮
   - 验证：显示所有活动，按创建时间倒序
   - URL 应该是：`/campaigns?sortBy=latest`

3. **测试"新用户专享"筛选**
   - 点击"🎁 新用户专享"按钮
   - 验证：只显示难度为"简单"的活动
   - URL 应该是：`/campaigns?difficulty=easy&sortBy=latest`

4. **测试"即将过期"筛选**
   - 点击"⏰ 即将过期"按钮
   - 验证：活动按结束日期升序排列
   - URL 应该是：`/campaigns?sortBy=expiring_soon`

5. **测试"高额度"筛选**
   - 点击"💰 高额度"按钮
   - 验证：活动按免费额度降序排列
   - URL 应该是：`/campaigns?sortBy=highest_credit`

6. **测试"最热门"筛选**
   - 点击"🔥 最热门"按钮
   - 验证：活动按反馈数量降序排列
   - URL 应该是：`/campaigns?sortBy=popular`

7. **测试组合筛选**
   - 先选择一个分类（如"API"）
   - 再点击快捷筛选（如"新用户专享"）
   - 验证：分类筛选保留，同时应用快捷筛选
   - URL 应该是：`/campaigns?categories=api&difficulty=easy&sortBy=latest`

## 修改的文件

- ✅ `src/components/QuickFilters.tsx` - 修复类型和配置
- ✅ `src/app/[locale]/(marketing)/campaigns/CampaignListClient.tsx` - 改进筛选逻辑

## 注意事项

1. **保留其他筛选条件**：点击快捷筛选时，会保留搜索、分类、AI模型、条件标签等筛选条件

2. **URL 同步**：快捷筛选会更新 URL 参数，支持分享和书签

3. **视觉反馈**：当前激活的快捷筛选按钮会高亮显示

4. **移动端优化**：快捷筛选按钮支持横向滚动，适配小屏幕

## 后续优化建议

### 1. 改进"高额度"排序

当前按字母序排序，建议解析额度数值：

```typescript
// 解析 "$5 USD" -> 5
// 解析 "10000 tokens" -> 10000
// 解析 "100 API calls" -> 100
```

### 2. 添加筛选组合

可以考虑添加更多有用的组合：

- "新手友好 + 高额度"
- "即将过期 + 热门"
- "无需信用卡"

### 3. 记住用户偏好

使用 localStorage 记住用户最后使用的快捷筛选。

### 4. 添加筛选统计

显示每个快捷筛选对应的活动数量：

```
🎁 新用户专享 (23)
⏰ 即将过期 (8)
💰 高额度 (15)
```

## 总结

快捷筛选功能现在已经正常工作：

✅ 类型定义正确
✅ 移除无效属性
✅ 筛选逻辑优化
✅ 保留其他筛选条件
✅ URL 参数同步
✅ 后端支持完整

用户现在可以通过快捷筛选按钮快速找到感兴趣的活动！
