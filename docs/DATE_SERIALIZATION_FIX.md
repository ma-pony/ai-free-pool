# Date Serialization Fix

## 问题描述

在评论组件中出现错误：
```
comment.updatedAt.getTime is not a function
```

## 根本原因

### 1. API 数据序列化
当数据从 API 返回时，Date 对象被序列化为 ISO 字符串：

```typescript
// 数据库中
createdAt: Date; // Date 对象

// API 响应
createdAt: '2024-12-07T10:30:00.000Z'; // 字符串
```

### 2. 类型定义不匹配
组件的类型定义声明为 `Date`，但实际接收的是字符串：

```typescript
// 类型定义
export type Comment = {
  createdAt: Date; // ❌ 声明为 Date
  updatedAt: Date;
};

// 实际数据
const comment = {
  createdAt: '2024-12-07T10:30:00.000Z', // ✅ 实际是字符串
  updatedAt: '2024-12-07T10:30:00.000Z',
};
```

### 3. 直接调用 Date 方法失败
```typescript
// ❌ 错误：字符串没有 getTime() 方法
comment.updatedAt.getTime();

// ✅ 正确：先转换为 Date 对象
new Date(comment.updatedAt).getTime();
```

## 解决方案

### 1. 更新类型定义
允许日期字段既可以是 Date 对象，也可以是字符串：

```typescript
export type Comment = {
  id: string;
  campaignId: string;
  userId: string;
  parentId?: string | null;
  content: string;
  isMarkedUseful: boolean;
  createdAt: Date | string; // ✅ 支持两种类型
  updatedAt: Date | string; // ✅ 支持两种类型
  deletedAt?: Date | string | null;
  user?: CommentUser;
  replies?: Comment[];
};
```

### 2. 修复日期比较
使用 `new Date()` 包裹日期值：

```typescript
// ❌ 错误
{comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
  <span>(已编辑)</span>
)}

// ✅ 正确
{new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
  <span>(已编辑)</span>
)}
```

### 3. 已有的正确用法
`timeAgo` 计算已经正确使用了 `new Date()`：

```typescript
const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
  addSuffix: true,
  locale: zhCN,
});
```

## 为什么会发生这个问题

### Next.js 数据序列化
Next.js 在 Server Component 和 Client Component 之间传递数据时会序列化：

1. **Server Component** 从数据库获取数据（Date 对象）
2. **序列化** 将 Date 转换为 ISO 字符串
3. **Client Component** 接收字符串数据

### API 响应
从 API 端点获取数据时也会发生序列化：

```typescript
// API 路由返回
return NextResponse.json({
  data: comments, // Date 对象被自动序列化为字符串
});

// 客户端接收
const data = await response.json(); // 日期是字符串
```

## 最佳实践

### 1. 类型定义
对于可能被序列化的数据，使用联合类型：

```typescript
type SerializableDate = Date | string;

type Comment = {
  createdAt: SerializableDate;
  updatedAt: SerializableDate;
};
```

### 2. 日期处理
始终使用 `new Date()` 包裹日期值：

```typescript
// ✅ 安全：适用于 Date 和 string
new Date(dateValue).getTime();
new Date(dateValue).toISOString();
formatDistanceToNow(new Date(dateValue));

// ❌ 不安全：只适用于 Date 对象
dateValue.getTime();
dateValue.toISOString();
```

### 3. 日期转换工具函数
创建工具函数统一处理：

```typescript
export function ensureDate(date: Date | string): Date {
  return date instanceof Date ? date : new Date(date);
}

// 使用
const timestamp = ensureDate(comment.createdAt).getTime();
```

## 影响范围

### 修复的文件
- `src/components/comments/CommentItem.tsx` - 更新类型定义和日期比较

### 相关文件（已正确处理）
- `src/components/comments/CommentSection.tsx` - 从 API 获取数据
- `src/components/comments/CommentList.tsx` - 渲染评论列表

## 测试验证

### 1. 评论显示
- [x] 评论时间正确显示（"3分钟前"）
- [x] 编辑标记正确显示（"已编辑"）
- [x] 没有 JavaScript 错误

### 2. 边界情况
- [x] 新创建的评论（updatedAt === createdAt）
- [x] 编辑过的评论（updatedAt !== createdAt）
- [x] 从 API 获取的评论
- [x] 从 props 传入的评论

## 类似问题检查

需要检查其他可能有日期序列化问题的地方：

### Campaign 数据
```typescript
// src/types/Campaign.ts
export type Campaign = {
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  featuredUntil?: Date | null;
};
```

### Reaction 数据
```typescript
// src/services/ReactionService.ts
export type Reaction = {
  createdAt: Date;
  updatedAt: Date;
};
```

### 建议
对所有可能被序列化的类型，使用 `Date | string` 联合类型。

## 相关文档

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [JSON Serialization](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify)
- [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse)
