# React Hydration 错误修复

## 问题描述

控制台出现 React hydration 错误：

```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```

这个错误表示服务端渲染的 HTML 与客户端渲染的内容不匹配。

## 问题原因

### 1. FeaturedCarousel.tsx

**问题代码**：
```typescript
const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);
```

**原因**：
- `Date.now()` 和 `Math.random()` 在服务端和客户端会生成不同的值
- 服务端渲染时生成一个值
- 客户端 hydration 时生成另一个值
- 导致 HTML 属性不匹配

### 2. CampaignCard.tsx

**问题代码**：
```typescript
const isExpired = campaign.endDate && new Date(campaign.endDate) < new Date();
const isExpiringSoon = campaign.endDate
  && new Date(campaign.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
```

**原因**：
- 每次渲染时都会创建新的 `Date()` 对象
- 服务端和客户端的时间可能有微小差异
- 计算结果可能不同，导致显示的内容不匹配

## 解决方案

### 1. 修复 FeaturedCarousel.tsx

**修改前**：
```typescript
const [sessionId] = useState(() => `session-${Date.now()}-${Math.random()}`);

useEffect(() => {
  fetchFeaturedCampaigns();
}, []);
```

**修改后**：
```typescript
const [sessionId, setSessionId] = useState<string>('');

// Generate sessionId only on client side to avoid hydration mismatch
useEffect(() => {
  setSessionId(`session-${Date.now()}-${Math.random()}`);
}, []);

useEffect(() => {
  fetchFeaturedCampaigns();
}, []);
```

**原理**：
- 初始状态设为空字符串
- 在 `useEffect` 中生成 sessionId（只在客户端执行）
- 服务端和客户端的初始渲染都使用空字符串
- 客户端 hydration 后再更新为实际的 sessionId

### 2. 修复 CampaignCard.tsx

**修改前**：
```typescript
const isExpired = campaign.endDate && new Date(campaign.endDate) < new Date();
const isExpiringSoon = campaign.endDate
  && new Date(campaign.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
```

**修改后**：
```typescript
import React from 'react';

const { isExpired, isExpiringSoon, daysUntilExpiry } = React.useMemo(() => {
  if (!campaign.endDate) {
    return { isExpired: false, isExpiringSoon: false, daysUntilExpiry: null };
  }

  const now = new Date();
  const endDate = new Date(campaign.endDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isExpired: diffTime < 0,
    isExpiringSoon: diffDays > 0 && diffDays <= 7,
    daysUntilExpiry: diffDays > 0 ? diffDays : null,
  };
}, [campaign.endDate]);
```

**原理**：
- 使用 `useMemo` 缓存计算结果
- 只在 `campaign.endDate` 变化时重新计算
- 减少不必要的重新计算
- 提高性能并避免 hydration 问题

**显示逻辑更新**：
```typescript
// 修改前
`${Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}天后过期`

// 修改后
`${daysUntilExpiry}天后过期`;
```

## 修改的文件

- ✅ `src/components/FeaturedCarousel.tsx` - 修复 sessionId 生成
- ✅ `src/components/CampaignCard.tsx` - 修复日期计算

## 常见的 Hydration 错误原因

### 1. 时间相关

❌ **错误**：
```typescript
<div>{new Date().toLocaleString()}</div>
<div>{Date.now()}</div>
```

✅ **正确**：
```typescript
const [currentTime, setCurrentTime] = useState('');

useEffect(() => {
  setCurrentTime(new Date().toLocaleString());
}, []);

return <div>{currentTime}</div>;
```

### 2. 随机数

❌ **错误**：
```typescript
<div id={`item-${Math.random()}`}>...</div>
```

✅ **正确**：
```typescript
const [id, setId] = useState('');

useEffect(() => {
  setId(`item-${Math.random()}`);
}, []);

return <div id={id}>...</div>;
```

### 3. 浏览器 API

❌ **错误**：
```typescript
const isMobile = window.innerWidth < 768;
```

✅ **正确**：
```typescript
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);
```

### 4. 条件渲染

❌ **错误**：
```typescript
{typeof window !== 'undefined' && <ClientComponent />}
```

✅ **正确**：
```typescript
const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

return isClient && <ClientComponent />;
```

### 5. 本地化日期

❌ **错误**：
```typescript
<div>{new Date().toLocaleDateString()}</div>
```

✅ **正确**：
- 使用固定的日期格式
- 或者在客户端渲染后再显示本地化日期

## 最佳实践

### 1. 使用 useEffect 处理客户端特定逻辑

```typescript
const [clientValue, setClientValue] = useState(defaultValue);

useEffect(() => {
  // 只在客户端执行
  setClientValue(calculateClientValue());
}, []);
```

### 2. 使用 useMemo 缓存计算结果

```typescript
const result = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### 3. 避免在渲染时使用不稳定的值

- ❌ `Date.now()`
- ❌ `Math.random()`
- ❌ `window.innerWidth`
- ❌ `localStorage.getItem()`

### 4. 使用 suppressHydrationWarning（谨慎使用）

如果确实需要服务端和客户端显示不同的内容：

```typescript
<div suppressHydrationWarning>
  {typeof window !== 'undefined' ? clientContent : serverContent}
</div>
```

**注意**：这只是抑制警告，不解决根本问题。

### 5. 使用动态导入

对于纯客户端组件：

```typescript
import dynamic from 'next/dynamic';

const ClientOnlyComponent = dynamic(
  () => import('./ClientOnlyComponent'),
  { ssr: false }
);
```

## 验证修复

### 1. 检查控制台

打开浏览器控制台，确认没有 hydration 警告。

### 2. 测试页面

访问以下页面：
- 首页（FeaturedCarousel）
- 活动列表页（CampaignCard）

### 3. 检查行为

- ✅ 页面正常加载
- ✅ 没有闪烁或内容跳动
- ✅ 交互功能正常
- ✅ 控制台没有错误

## 相关资源

- [Next.js Hydration Error 文档](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration 概念](https://react.dev/reference/react-dom/client/hydrateRoot)
- [常见 Hydration 问题](https://nextjs.org/docs/messages/react-hydration-error#common-causes)

## 总结

Hydration 错误通常由以下原因引起：

1. ✅ 时间相关的值（`Date.now()`, `new Date()`）
2. ✅ 随机数（`Math.random()`）
3. ✅ 浏览器 API（`window`, `localStorage`）
4. ✅ 条件渲染基于客户端环境

解决方案：

1. ✅ 使用 `useEffect` 在客户端设置值
2. ✅ 使用 `useMemo` 缓存计算结果
3. ✅ 避免在渲染时使用不稳定的值
4. ✅ 使用动态导入处理纯客户端组件

修复后，页面应该没有 hydration 警告，用户体验更流畅！
