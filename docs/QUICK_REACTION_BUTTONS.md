# Quick Reaction Buttons Feature

## 功能概述

当活动卡片没有任何反馈数据时，显示快捷反馈按钮，让用户可以直接在卡片上提供反馈，无需进入详情页。

## 用户体验流程

### 场景 1: 没有反馈数据
```
┌─────────────────────────────────┐
│  活动卡片                        │
│  ─────────────────────────────  │
│  [✅] [❌] [📝]                  │
│  快捷反馈按钮                    │
└─────────────────────────────────┘
```

### 场景 2: 有反馈数据
```
┌─────────────────────────────────┐
│  活动卡片                        │
│  ─────────────────────────────  │
│  ✅ 80% (8)  ❌ 20% (2)         │
│  反馈统计                        │
└─────────────────────────────────┘
```

## 组件结构

### QuickReactionButtons 组件
新创建的独立组件，提供快捷反馈功能。

**Props:**
- `campaignId: string` - 活动 ID
- `onReactionAdded?: () => void` - 反馈提交后的回调
- `compact?: boolean` - 紧凑模式（用于卡片）

**功能:**
- ✅ 仍然有效 - 绿色按钮
- ❌ 已过期 - 红色按钮
- 📝 信息有误 - 黄色按钮

**交互:**
1. 未登录用户点击 → 跳转到登录页
2. 已登录用户点击 → 提交反馈
3. 提交成功 → 刷新统计数据
4. 提交失败 → 显示错误信息

### ReactionStats 组件更新

**逻辑变更:**
```typescript
// 之前：没有数据时返回 null
if (!stats || stats.total === 0) {
  return null;
}

// 现在：没有数据时显示快捷反馈按钮
if (!stats || stats.total === 0) {
  return (
    <QuickReactionButtons
      campaignId={campaignId}
      compact={compact}
      onReactionAdded={refreshStats}
    />
  );
}
```

**新增功能:**
- `refreshStats()` - 刷新统计数据的函数
- 反馈提交后自动刷新，显示最新统计

## 样式设计

### Compact 模式（活动卡片）
```tsx
<button className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs">
  <span>✅</span>
</button>;
```

**特点:**
- 只显示 emoji 图标
- 小尺寸按钮（px-2 py-1）
- 使用 title 属性显示提示文本
- 悬停时背景色加深

### Full 模式（详情页）
```tsx
<button className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm">
  <span className="text-lg">✅</span>
  <span>仍然有效</span>
</button>;
```

**特点:**
- 显示 emoji + 文字标签
- 较大尺寸按钮（px-4 py-2）
- 更明显的视觉效果

## 事件处理

### 防止事件冒泡
```typescript
onClick={(e) => {
  e.preventDefault();
  e.stopPropagation();
  handleReaction('still_works');
}}
```

**原因:**
- 按钮在 Link 组件内部
- 防止点击按钮时触发卡片链接跳转
- 确保只执行反馈提交操作

### 认证检查
```typescript
if (!isSignedIn) {
  router.push('/sign-in');
}
```

**流程:**
1. 检查用户登录状态
2. 未登录 → 跳转登录页
3. 已登录 → 继续提交反馈

### 状态管理
```typescript
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**状态:**
- `submitting` - 提交中状态，禁用按钮
- `error` - 错误信息，显示给用户

## API 交互

### 提交反馈
```typescript
POST /api/reactions
{
  "campaignId": "xxx",
  "type": "still_works" | "expired" | "info_incorrect"
}
```

### 刷新统计
```typescript
GET /api/reactions/[campaignId]
Response: {
  "success": true,
  "data": {
    "stats": { ... },
    "userReaction": { ... }
  }
}
```

## 翻译文案

### 中文 (zh.json)
```json
{
  "Reactions": {
    "stillWorks": "仍然有效",
    "expired": "已过期",
    "infoIncorrect": "信息有误",
    "beFirstToReact": "成为第一个反馈的人"
  }
}
```

### 英文 (en.json)
```json
{
  "Reactions": {
    "stillWorks": "Still Works",
    "expired": "Expired",
    "infoIncorrect": "Info Incorrect",
    "beFirstToReact": "Be the first to react"
  }
}
```

## 用户价值

### 1. 降低反馈门槛
- 无需进入详情页
- 一键快速反馈
- 提高用户参与度

### 2. 提升数据质量
- 更多用户提供反馈
- 更快获得活动状态信息
- 帮助其他用户做决策

### 3. 改善用户体验
- 减少点击次数
- 即时反馈提交
- 自动刷新显示结果

## 测试场景

- [x] 未登录用户点击跳转到登录页
- [x] 已登录用户可以提交反馈
- [x] 提交后自动刷新统计数据
- [x] 提交失败显示错误信息
- [x] 按钮禁用状态正确显示
- [x] 事件不会冒泡到父元素
- [x] Compact 和 Full 模式都正常工作
- [x] 翻译文案正确显示

## 相关文件

- `src/components/QuickReactionButtons.tsx` - 快捷反馈按钮组件（新建）
- `src/components/ReactionStats.tsx` - 反馈统计组件（更新）
- `src/locales/zh.json` - 中文翻译（更新）
- `src/locales/en.json` - 英文翻译（更新）
- `src/services/ReactionService.ts` - 反馈服务
- `src/app/api/reactions/route.ts` - 反馈 API

## 未来优化

1. **动画效果** - 添加按钮点击动画
2. **成功提示** - 显示提交成功的 toast 消息
3. **乐观更新** - 立即更新 UI，后台同步
4. **快捷键支持** - 键盘快捷键提交反馈
5. **批量反馈** - 支持对多个活动快速反馈
