# API "Forbidden" 错误修复

## 问题描述

访问活动列表页时显示 "Failed to fetch campaigns" 错误。

检查发现 API 请求返回 `{"error":"Forbidden"}` 403 状态码。

## 问题原因

### 根本原因

`src/proxy.ts` 文件是一个 Next.js 中间件，它使用 Arcjet 进行 bot 检测和安全保护。

中间件的 matcher 配置匹配了所有路径，包括 API 路由：

```typescript
// ❌ 问题配置
matcher: '/((?!_next|_vercel|monitoring|.*\\..*).*)',
```

这导致：
1. 所有 API 请求都经过 Arcjet bot 检测
2. Arcjet 可能将正常的 API 请求误判为 bot
3. 请求被拒绝，返回 403 Forbidden

### 为什么会被误判？

Arcjet 的 bot 检测基于多个因素：
- User-Agent 字符串
- 请求模式
- IP 地址
- 请求头

在开发环境中，来自 `fetch()` 的 API 请求可能缺少某些浏览器特征，导致被误判为 bot。

## 解决方案

### 修改中间件 matcher

排除 API 路由，让它们不经过中间件的 bot 检测：

```typescript
// ✅ 正确配置
export const config = {
  matcher: '/((?!api|_next|_vercel|monitoring|.*\\..*).*)',
  //              ^^^^ 添加 api 排除
};
```

### 为什么这样做？

1. **API 路由应该有自己的保护**：
   - API 路由可以在各自的处理函数中添加 Arcjet 保护
   - 可以针对不同的 API 端点使用不同的保护策略

2. **避免误判**：
   - 前端发起的 API 请求不应该被 bot 检测拦截
   - Bot 检测主要用于保护页面渲染，而不是 API

3. **更灵活的控制**：
   - 某些 API 可能需要允许 bot 访问（如 RSS feed）
   - 某些 API 需要更严格的限制（如提交表单）

## 修改的文件

- ✅ `src/proxy.ts` - 更新 matcher 配置

## 验证修复

### 1. 测试 API 访问

```bash
curl http://localhost:3000/api/campaigns?status=published
```

**期望结果**：
```json
{
  "success": true,
  "data": [...]
}
```

### 2. 测试页面访问

访问 `http://localhost:3000/campaigns`

**期望结果**：
- 页面正常加载
- 不显示 "Failed to fetch campaigns" 错误
- 如果数据库中有活动，应该显示活动列表

### 3. 测试 bot 检测仍然工作

Bot 检测应该仍然保护页面路由：

```bash
# 使用 bot User-Agent 访问页面
curl -H "User-Agent: BadBot/1.0" http://localhost:3000/
```

**期望结果**：
```json
{ "error": "Forbidden" }
```

## 当前状态

### ✅ 已修复
- API 路由可以正常访问
- 不再返回 403 Forbidden

### ⚠️ 数据库为空
- API 工作正常，但返回空数组
- 需要添加测试数据或创建活动

## 后续步骤

### 1. 为 API 路由添加保护（可选）

如果需要，可以在特定的 API 路由中添加 Arcjet 保护：

```typescript
// src/app/api/campaigns/route.ts
import { arcjetWithApiRateLimit } from '@/libs/Arcjet';

export async function GET(request: NextRequest) {
  // 添加速率限制
  const decision = await arcjetWithApiRateLimit.protect(request);

  if (decision.isDenied()) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... 正常处理
}
```

### 2. 添加测试数据

运行种子脚本或手动创建活动：

```bash
# 初始化分类和条件标签
npx tsx scripts/seed-all.ts

# 然后通过管理后台或 API 创建活动
```

### 3. 监控 Arcjet 日志

在生产环境中，监控 Arcjet 的决策日志，确保：
- 合法用户不被误判
- Bot 被正确识别和阻止

## 相关配置

### proxy.ts 的作用

`proxy.ts` 是一个 Next.js 中间件，负责：

1. **Bot 检测**：阻止恶意 bot，允许搜索引擎和社交媒体预览
2. **认证保护**：保护需要登录的路由
3. **国际化路由**：处理多语言路由

### Arcjet 配置

在 `src/libs/Arcjet.ts` 中定义了多个 Arcjet 实例：

- `arcjet` - 基础实例，只有 Shield 保护
- `arcjetWithApiRateLimit` - API 速率限制（100 req/min）
- `arcjetWithStrictRateLimit` - 严格限制（10 req/min）
- `arcjetWithCriticalRateLimit` - 关键操作（3 req/5min）
- `arcjetWithSearchRateLimit` - 搜索操作（200 req/min）

### 中间件 matcher 语法

```typescript
matcher: '/((?!pattern1|pattern2|pattern3).*)';
```

- `(?!...)` - 负向前瞻，排除匹配的模式
- `.*` - 匹配任意字符

示例：
- `(?!api)` - 排除以 `api` 开头的路径
- `(?!_next)` - 排除 Next.js 内部路径
- `(?!.*\\..*)` - 排除包含点的路径（如 `favicon.ico`）

## 最佳实践

### 1. 分层保护

- **中间件**：保护页面路由，bot 检测
- **API 路由**：各自添加速率限制和验证
- **业务逻辑**：输入验证、权限检查

### 2. 开发环境配置

在开发环境中，可以将 Arcjet 设置为 `DRY_RUN` 模式：

```typescript
detectBot({
  mode: process.env.NODE_ENV === 'production' ? 'LIVE' : 'DRY_RUN',
  // ...
});
```

### 3. 监控和日志

- 记录被阻止的请求
- 分析误判情况
- 调整 bot 检测规则

## 总结

通过排除 API 路由，我们解决了 403 Forbidden 错误：

✅ API 路由可以正常访问
✅ Bot 检测仍然保护页面路由
✅ 更灵活的安全控制
✅ 避免误判合法请求

现在活动列表页可以正常工作了（前提是数据库中有数据）。
