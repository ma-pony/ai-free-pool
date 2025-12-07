# Troubleshooting: Event Handlers in Client Components

## 错误信息
```
Event handlers cannot be passed to Client Component props.
<button onClick={function onClick} ...>
```

## 问题分析

这个错误通常发生在以下情况：
1. Client Component 在 Server Component 中使用
2. Next.js Turbopack 缓存问题
3. 组件边界不清晰

## 当前状态

### CampaignCard 组件
- ✅ 已标记为 `'use client'`
- ✅ 所有事件处理器都在组件内部定义
- ✅ 按钮已从 Link 组件中移出

### 使用位置
- `src/app/[locale]/(marketing)/page.tsx` - Server Component
- `src/app/[locale]/(marketing)/campaigns/CampaignListClient.tsx` - Client Component
- `src/app/[locale]/(marketing)/category/[slug]/page.tsx` - Server Component
- `src/app/[locale]/(marketing)/platforms/[slug]/page.tsx` - Server Component

## 解决方案

### 方案 1: 清除缓存（已执行）
```bash
rm -rf .next/cache
```

### 方案 2: 重启开发服务器
```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### 方案 3: 完全清理并重建
```bash
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### 方案 4: 检查 Next.js 版本
确保使用的是稳定版本的 Next.js 16。如果问题持续，可能需要降级到 Next.js 15。

```json
{
  "dependencies": {
    "next": "^15.0.0" // 或最新稳定版
  }
}
```

## 验证步骤

1. **检查组件标记**
   ```tsx
   // CampaignCard.tsx
   'use client'; // ✅ 第一行

   export default function CampaignCard() {
     // ...
   }
   ```

2. **检查事件处理器位置**
   ```tsx
   // ✅ 正确：在组件内部定义
   const handleClick = () => { ... };

   // ❌ 错误：作为 prop 传递
   <Component onClick={handleClick} />
   ```

3. **检查组件层次**
   ```tsx
   // Server Component (page.tsx)
   export default async function Page() {
     return (
       <CampaignCard /> // ✅ Client Component 可以在这里使用
     );
   }
   ```

## 当前实现

### CampaignCard 结构
```tsx
'use client';

export default function CampaignCard({ campaign, locale }) {
  // ✅ 事件处理器在组件内部
  const handleExternalLinkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(campaign.officialLink, '_blank');
  };

  return (
    <div>
      {/* ✅ Link 区域 - 只包含静态内容 */}
      <Link href={`/campaigns/${campaign.slug}`}>
        {/* 活动信息 */}
      </Link>

      {/* ✅ 按钮区域 - 独立的 div */}
      <div>
        <button onClick={handleExternalLinkClick}>
          前往活动
        </button>
      </div>
    </div>
  );
}
```

## 如果问题持续

### 1. 检查浏览器控制台
查看是否有其他相关错误信息

### 2. 检查 Network 标签
确认组件是否正确加载为 Client Component

### 3. 临时禁用功能
注释掉"前往活动"按钮，看是否还有其他错误：

```tsx
{ /* 临时注释
<button onClick={handleExternalLinkClick}>
  前往活动
</button>
*/ }
```

### 4. 检查其他 Client Components
确认 BookmarkButton 和 ReactionStats 也正常工作

## Next.js 16 + Turbopack 已知问题

Next.js 16 with Turbopack 在某些情况下可能会有缓存问题：

1. **热重载问题** - 修改文件后可能需要手动刷新
2. **Client Component 边界** - 嵌套的 Client Components 可能需要额外的边界标记
3. **缓存失效** - 有时需要完全清除缓存

## 建议

如果错误持续出现：

1. **重启开发服务器** - 最简单的解决方案
2. **清除所有缓存** - 包括 .next 和 node_modules/.cache
3. **检查 Next.js 版本** - 确保使用稳定版本
4. **报告问题** - 如果是 Next.js 16 的 bug，向 Vercel 报告

## 相关文件

- `src/components/CampaignCard.tsx` - 主要组件
- `src/components/BookmarkButton.tsx` - 收藏按钮
- `src/components/ReactionStats.tsx` - 反馈统计
- `src/components/QuickReactionButtons.tsx` - 快捷反馈按钮
