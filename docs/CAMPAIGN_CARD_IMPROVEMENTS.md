# Campaign Card Improvements

## 功能概述

对活动卡片进行了重大改进，添加了快捷收藏和直接跳转到第三方活动链接的功能，提升用户体验。

## 新增功能

### 1. 快捷收藏按钮（右上角）
- **位置**: 卡片右上角，与推荐徽章并列
- **功能**: 一键收藏/取消收藏活动
- **样式**: 带阴影的圆形按钮，视觉突出
- **交互**: 点击不会触发卡片链接跳转

### 2. 前往活动按钮（卡片内）
- **位置**: 活动信息下方，反馈区域上方
- **功能**: 直接在新标签页打开第三方活动链接
- **样式**: 蓝色渐变按钮，带火箭图标和外部链接图标
- **交互**: 点击打开 `campaign.officialLink`，不跳转到详情页

### 3. 简化底部区域
- **移除**: 底部的收藏按钮（已移至右上角）
- **保留**: 反馈统计/快捷反馈按钮
- **优化**: 更简洁的布局，减少视觉干扰

## 布局变化

### 之前的布局
```
┌─────────────────────────────────┐
│  ⭐推荐                    [右上] │
│                                 │
│  [平台 Logo] 平台名称            │
│  活动标题                        │
│  活动描述                        │
│  💰 免费额度                     │
│  ⏰ 过期时间  🏷️ 标签            │
│                                 │
├─────────────────────────────────┤
│  ✅80%(8) ❌20%(2)    [收藏]    │
└─────────────────────────────────┘
```

### 现在的布局
```
┌─────────────────────────────────┐
│  ⭐推荐  [收藏]           [右上] │
│                                 │
│  [平台 Logo] 平台名称            │
│  活动标题                        │
│  活动描述                        │
│  💰 免费额度                     │
│  ⏰ 过期时间  🏷️ 标签            │
│                                 │
│  [🚀 前往活动 ↗]  <-- 新增      │
├─────────────────────────────────┤
│  ✅80%(8) ❌20%(2)              │
└─────────────────────────────────┘
```

## 实现细节

### 1. 右上角快捷收藏
```tsx
<div className="absolute top-2 right-2 z-10 flex items-center gap-2">
  {/* Featured Badge */}
  {(isFeatured || campaign.isFeatured) && (
    <div className="...">⭐ 推荐</div>
  )}

  {/* Quick Bookmark */}
  {showBookmark && (
    <BookmarkButton campaignId={campaign.id} compact={true} className="shadow-md" />
  )}
</div>;
```

**特点:**
- 使用 `absolute` 定位在右上角
- 与推荐徽章并列显示
- 添加阴影增强视觉效果
- 响应式间距（mobile: 8px, desktop: 16px）

### 2. 前往活动按钮
```tsx
<button
  onClick={handleExternalLinkClick}
  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg active:scale-[0.98]"
>
  <span>🚀</span>
  <span>前往活动</span>
  <svg>外部链接图标</svg>
</button>;
```

**特点:**
- 全宽按钮，视觉突出
- 蓝色渐变背景
- 火箭 emoji + 文字 + 外部链接图标
- 悬停时颜色加深、阴影增强
- 点击时缩放动画（scale-[0.98]）

### 3. 事件处理
```typescript
const handleExternalLinkClick = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();

  // Track click
  trackCampaignClick(campaign.id, title, platform);

  // Open in new tab
  window.open(campaign.officialLink, '_blank', 'noopener,noreferrer');
};
```

**安全性:**
- 使用 `noopener` 防止新页面访问 `window.opener`
- 使用 `noreferrer` 不发送 referrer 信息
- 阻止事件冒泡，不触发卡片链接

## 用户体验改进

### 1. 减少点击次数
**之前**: 首页 → 详情页 → 第三方网站（3步）
**现在**: 首页 → 第三方网站（2步）

### 2. 更直观的操作
- 收藏按钮在右上角，符合用户习惯
- 前往活动按钮醒目，一目了然
- 减少底部区域的视觉干扰

### 3. 更好的视觉层次
```
重要性排序:
1. 活动标题和描述（主要信息）
2. 免费额度（核心价值）
3. 前往活动按钮（主要操作）
4. 反馈统计（辅助信息）
5. 收藏按钮（次要操作）
```

## 响应式设计

### Mobile (< 640px)
- 右上角间距: `right-2 top-2` (8px)
- 按钮间距: `gap-2` (8px)
- 按钮内边距: `px-4 py-2.5`
- 前往活动按钮: `mt-3` (12px)

### Desktop (≥ 640px)
- 右上角间距: `right-4 top-4` (16px)
- 按钮间距: `gap-2` (8px)
- 按钮内边距: `px-4 py-2.5`
- 前往活动按钮: `mt-4` (16px)

## 翻译文案

### 中文 (zh.json)
```json
{
  "Index": {
    "goToCampaign": "前往活动"
  }
}
```

### 英文 (en.json)
```json
{
  "Index": {
    "goToCampaign": "Go to Campaign"
  }
}
```

## 分析追踪

两个操作都会触发分析事件：

### 1. 点击卡片（查看详情）
```typescript
trackCampaignClick(campaignId, title, platform);
// 跳转到: /campaigns/[slug]
```

### 2. 点击前往活动按钮
```typescript
trackCampaignClick(campaignId, title, platform);
// 打开: campaign.officialLink (新标签页)
```

## 性能优化

### 1. 事件处理优化
- 使用 `e.preventDefault()` 和 `e.stopPropagation()` 防止冒泡
- 避免不必要的页面跳转

### 2. 渲染优化
- 条件渲染收藏按钮（`showBookmark`）
- 条件渲染反馈区域（`showReactions`）
- 使用 `React.useMemo` 缓存日期计算

## 可访问性

### 1. 语义化 HTML
- 使用 `<button>` 元素而非 `<div>`
- 提供清晰的文本标签

### 2. 键盘导航
- 所有按钮都可以通过 Tab 键访问
- 支持 Enter 和 Space 键触发

### 3. 视觉反馈
- 悬停状态变化
- 点击动画效果
- 禁用状态样式

## 测试场景

- [x] 右上角收藏按钮正常工作
- [x] 收藏按钮不触发卡片链接
- [x] 前往活动按钮打开新标签页
- [x] 前往活动按钮不触发卡片链接
- [x] 外部链接使用 noopener 和 noreferrer
- [x] 分析事件正确追踪
- [x] 响应式布局正常
- [x] 翻译文案正确显示
- [x] 推荐徽章和收藏按钮并列显示
- [x] 底部只显示反馈区域

## 相关文件

- `src/components/CampaignCard.tsx` - 活动卡片组件（更新）
- `src/components/BookmarkButton.tsx` - 收藏按钮组件
- `src/locales/zh.json` - 中文翻译（更新）
- `src/locales/en.json` - 英文翻译（更新）
- `src/libs/Analytics.ts` - 分析追踪

## 未来优化

1. **动画效果** - 添加收藏按钮的心跳动画
2. **加载状态** - 前往活动按钮的加载指示器
3. **成功提示** - 收藏成功的 toast 消息
4. **快捷键** - 键盘快捷键支持（如 B 键收藏）
5. **批量操作** - 支持批量收藏多个活动
