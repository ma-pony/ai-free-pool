# 翻译文案更新

## 更新内容

为筛选器的参与条件分组添加了翻译文案。

### 新增翻译键

在 `Filters` 命名空间中添加了两个新的翻译键：

| 键名 | 中文 (zh) | 英文 (en) |
|------|-----------|-----------|
| `requirements` | 参与要求 | Requirements |
| `benefits` | 活动优势 | Benefits |

### 使用位置

这些翻译用于 `FilterSidebar.tsx` 组件中，将参与条件按类型分组显示：

```typescript
// 要求类条件
<div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
  {t('requirements') || '参与要求'}
</div>

// 优势类条件
<div className="mb-1 text-xs font-semibold text-gray-500 uppercase">
  {t('benefits') || '活动优势'}
</div>
```

### 更新的文件

- ✅ `src/locales/zh.json` - 添加中文翻译
- ✅ `src/locales/en.json` - 添加英文翻译

### 验证

两个翻译文件的 JSON 格式都已验证通过：
- ✅ zh.json is valid
- ✅ en.json is valid

## 效果

现在筛选器中的参与条件会按类型分组显示：

**参与要求** (Requirements)
- 📧 邮箱验证
- 📱 手机验证
- 💳 信用卡绑定
- ...

**活动优势** (Benefits)
- 🚫💳 无需信用卡
- ⚡ 即时访问
- ♾️ 永久有效
- ...

这样用户可以更清楚地了解活动的参与门槛和优势。
