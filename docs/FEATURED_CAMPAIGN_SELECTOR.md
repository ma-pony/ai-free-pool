# 推荐位管理 - 活动选择器

## 功能概述

管理后台的推荐位管理功能已升级，现在可以通过搜索和选择的方式设置推荐位，而不需要手动输入活动ID。

## 主要改进

### 1. 活动选择器组件 (CampaignSelector)

新增的 `CampaignSelector` 组件提供了以下功能：

- **搜索功能**: 实时搜索活动标题和平台名称
- **下拉选择**: 可视化的活动列表，包含平台Logo和活动信息
- **已选显示**: 清晰显示已选择的活动，支持一键清除
- **自动加载**: 打开下拉框时自动加载已发布的活动列表

### 2. 用户体验优化

- **可视化选择**: 显示平台Logo、活动标题和平台名称
- **搜索过滤**: 支持按活动标题或平台名称搜索
- **点击外部关闭**: 点击下拉框外部自动关闭
- **加载状态**: 显示加载动画，提升用户体验

## 技术实现

### 组件位置

- `src/components/admin/CampaignSelector.tsx` - 活动选择器组件
- `src/components/admin/FeaturedCampaignList.tsx` - 推荐位管理页面（已更新）

### API 接口

使用现有的 `/api/campaigns` 接口：

```typescript
GET /api/campaigns?status=published&limit=100
```

### 多语言支持

已添加以下翻译键：

- `select_campaign` - 选择活动
- `search_campaigns` - 搜索活动...
- `search_and_select_campaign` - 搜索并选择活动
- `no_campaigns_found` - 未找到活动

支持语言：中文(zh)、英文(en)、法文(fr)

## 使用方法

### 在管理后台设置推荐位

1. 进入管理后台 → 推荐位管理
2. 点击"设置推荐位"按钮
3. 在弹出的对话框中：
   - 点击"选择活动"输入框
   - 在搜索框中输入活动名称或平台名称
   - 从列表中选择目标活动
   - 设置推荐截止时间
   - 点击"设置推荐"完成

### 组件复用

`CampaignSelector` 组件可以在其他需要选择活动的场景中复用：

```tsx
import CampaignSelector from '@/components/admin/CampaignSelector';

<CampaignSelector
  value={selectedCampaignId}
  onChange={(campaignId, campaign) => {
    // 处理选择逻辑
    setSelectedCampaignId(campaignId);
    setSelectedCampaign(campaign);
  }}
  placeholder="搜索并选择活动"
/>;
```

## 组件属性

### CampaignSelector Props

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| value | string \| null | 是 | 当前选中的活动ID |
| onChange | (campaignId: string, campaign: Campaign) => void | 是 | 选择活动时的回调函数 |
| placeholder | string | 否 | 输入框占位符文本 |

## 未来优化建议

1. **分页加载**: 当活动数量很大时，实现分页或虚拟滚动
2. **高级筛选**: 添加按平台、状态、难度等条件筛选
3. **最近使用**: 显示最近设置过的推荐位活动
4. **批量操作**: 支持批量设置多个推荐位
5. **拖拽排序**: 支持拖拽调整推荐位顺序

## 相关文件

- `src/components/admin/CampaignSelector.tsx`
- `src/components/admin/FeaturedCampaignList.tsx`
- `src/locales/zh.json`
- `src/locales/en.json`
- `src/locales/fr.json`
- `src/app/api/campaigns/route.ts`
