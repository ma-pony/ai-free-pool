# Reaction Stats Display Fix

## 问题描述

活动卡片下方显示 `✅NaN%()❌NaN%()` 的奇怪内容。

## 根本原因

### 1. API 响应结构不匹配
- **API 返回**: `{ success: true, data: { stats, userReaction } }`
- **组件期望**: 直接的 `stats` 对象
- **实际问题**: 组件使用 `data.data` 而不是 `data.data.stats`

### 2. 空数据处理不当
- 当 `stats` 为 `null` 或 `undefined` 时，`getPercentage()` 函数仍然尝试访问 `stats.total`
- 导致计算结果为 `NaN`

### 3. 零反馈显示问题
- 即使活动没有任何反馈（total = 0），组件仍然显示 `0%` 的统计信息
- 应该在没有反馈时完全隐藏统计区域

## Reaction Stats 数据结构

```typescript
export type ReactionStats = {
  stillWorks: number; // ✅ "仍然有效" 的反馈数
  expired: number; // ❌ "已失效" 的反馈数
  infoIncorrect: number; // 📝 "信息有误" 的反馈数
  total: number; // 总反馈数
};
```

## 修复方案

### 1. 修复 API 响应解析
```typescript
// 修复前
const data = await response.json();
setStats(data.data); // 错误：data.data 是 { stats, userReaction }

// 修复后
const result = await response.json();
if (result.success && result.data?.stats) {
  setStats(result.data.stats); // 正确：提取 stats 对象
}
```

### 2. 改进空数据处理
```typescript
// 不渲染没有反馈的统计
if (!stats || stats.total === 0) {
  return null;
}
```

### 3. 增强 getPercentage 安全性
```typescript
const getPercentage = (count: number) => {
  if (!stats || stats.total === 0) {
    return 0;
  }
  return Math.round((count / stats.total) * 100);
};
```

## 显示逻辑

### Compact 模式（活动卡片）
```
✅ 80% (8)  ❌ 20% (2)  📝 0% (0)
```

- 显示百分比和具体数量
- 如果 `infoIncorrect > 0` 才显示信息有误
- 如果 `total === 0` 则完全隐藏

### Full 模式（活动详情页）
```
✅ 仍然有效    80%  [8]
❌ 已失效      20%  [2]
📝 信息有误     0%  [0]
─────────────────────
总反馈数: 10
```

## 用户反馈类型

1. **✅ Still Works (仍然有效)**
   - 用户确认活动仍然可用
   - 可以成功获取免费额度

2. **❌ Expired (已失效)**
   - 活动已经过期或不可用
   - 无法获取免费额度

3. **📝 Info Incorrect (信息有误)**
   - 活动信息不准确
   - 需要更新或修正

## 自动验证机制

当 `expired` 反馈数超过 `stillWorks` 的 1.5 倍时：
- 自动标记活动为 `needsVerification = true`
- 管理员会收到通知需要验证
- 在活动详情页显示警告标识

## 测试场景

- [x] 没有任何反馈时不显示统计区域
- [x] 有反馈时正确显示百分比和数量
- [x] API 响应正确解析
- [x] 加载状态正确显示
- [x] 错误情况优雅处理
- [x] Compact 和 Full 模式都正常工作

## 相关文件

- `src/components/ReactionStats.tsx` - 反馈统计显示组件
- `src/services/ReactionService.ts` - 反馈数据服务
- `src/app/api/reactions/[campaignId]/route.ts` - 反馈 API 路由
- `src/components/CampaignCard.tsx` - 活动卡片组件
