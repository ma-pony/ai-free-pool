# 语言支持修复文档

## 问题描述

翻译按钮缺少法语（Français）选项，虽然已经创建了法语翻译文件 `src/locales/fr.json`，但语言切换器中没有显示法语选项。

## 根本原因

`src/utils/AppConfig.ts` 中的 `locales` 配置数组只包含了 `['en', 'zh']`，缺少 `'fr'`，导致：
1. 路由系统不识别法语路径
2. 语言切换器不显示法语选项
3. Clerk 认证系统缺少法语本地化支持

## 修复方案

### 1. 更新 AppConfig.ts

**修改前**:
```typescript
import { enUS, zhCN } from '@clerk/localizations';

export const AppConfig = {
  locales: ['en', 'zh'],
  // ...
};

const supportedLocales = {
  en: enUS,
  zh: zhCN,
};
```

**修改后**:
```typescript
import { enUS, frFR, zhCN } from '@clerk/localizations';

export const AppConfig = {
  locales: ['en', 'zh', 'fr'],
  // ...
};

const supportedLocales = {
  en: enUS,
  zh: zhCN,
  fr: frFR,
};
```

### 2. 语言切换器配置

`src/components/LocaleSwitcher.tsx` 已经正确配置了语言显示名称：

```typescript
const localeNames: Record<string, string> = {
  en: 'English',
  zh: '中文',
  fr: 'Français',
};
```

该组件会自动从 `routing.locales` 读取可用语言列表，因此更新 AppConfig 后会自动显示法语选项。

## 验证步骤

1. **检查语言切换器**：
   - 打开应用
   - 点击语言切换下拉菜单
   - 应该看到三个选项：English、中文、Français

2. **测试法语路由**：
   - 访问 `/fr` 路径
   - 应该正确加载法语版本的页面

3. **验证翻译**：
   - 切换到法语
   - 检查页面上的文本是否正确显示为法语

## 相关文件

- `src/utils/AppConfig.ts` - 应用配置（已修复）
- `src/components/LocaleSwitcher.tsx` - 语言切换器组件
- `src/locales/fr.json` - 法语翻译文件
- `src/libs/I18nRouting.ts` - 路由配置
- `src/libs/I18n.ts` - 国际化配置

## 支持的语言

| 语言代码 | 语言名称 | Clerk 本地化 | 翻译文件 |
|---------|---------|-------------|---------|
| en | English | ✅ enUS | ✅ en.json |
| zh | 中文 | ✅ zhCN | ✅ zh.json |
| fr | Français | ✅ frFR | ✅ fr.json |

## 注意事项

1. **Clerk 本地化**：确保从 `@clerk/localizations` 导入对应的语言包
2. **翻译文件**：每种语言都需要对应的 JSON 翻译文件
3. **路由配置**：`AppConfig.locales` 数组决定了哪些语言可用
4. **默认语言**：`AppConfig.defaultLocale` 设置为 `'en'`

## 修复完成时间

2024-12-05

## 修复版本

v2.2
