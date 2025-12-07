# Design Document

## Overview

AI Free Pool 是一个基于 Next.js 16 的全栈 Web 应用，采用 App Router 架构，使用 TypeScript 开发。平台通过 PostgreSQL 数据库存储数据，使用 Clerk 进行用户认证，通过 OpenAI API 实现自动翻译功能。系统采用移动端优先的响应式设计，支持中英文双语，并集成了完善的 SEO 优化和数据分析功能。

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │    Mobile    │  │  Search Bot  │      │
│  │  (Desktop)   │  │   (Safari/   │  │  (Google/    │      │
│  │              │  │    Chrome)   │  │   Bing)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Server Components (SSR/SSG)                         │  │
│  │  - Page Rendering                                    │  │
│  │  - SEO Metadata Generation                           │  │
│  │  - Data Fetching                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Client Components                                   │  │
│  │  - Interactive UI                                    │  │
│  │  - Form Handling                                     │  │
│  │  - Real-time Updates                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes                                          │  │
│  │  - RESTful Endpoints                                 │  │
│  │  - Request Encryption/Decryption                     │  │
│  │  - Rate Limiting                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Platform   │  │   Campaign   │  │     User     │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Translation │  │   Reaction   │  │   Comment    │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Access Layer                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  DrizzleORM (Type-safe ORM)                          │  │
│  │  - Query Builder                                     │  │
│  │  - Schema Validation                                 │  │
│  │  - Migration Management                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │     Clerk    │  │   OpenAI     │      │
│  │   (Neon)     │  │    (Auth)    │  │    (AI)      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Vercel     │  │    Google    │  │  Cloudinary  │      │
│  │  (Hosting)   │  │  Analytics   │  │   (Images)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TypeScript 5.9+
- Tailwind CSS 4
- next-intl (i18n)
- React Hook Form + Zod (Form validation)

**Backend:**
- Next.js API Routes
- DrizzleORM (ORM)
- PostgreSQL (Neon)
- Clerk (Authentication)

**External Services:**
- OpenAI API (Translation)
- Google Analytics (Analytics)
- Cloudinary/Uploadthing (Image hosting)
- Vercel (Deployment)

**Security:**
- crypto-js (Encryption)
- Arcjet (Rate limiting & bot detection)

## Components and Interfaces

### Page Components and UI/UX Design

#### Design Principles

1. **Mobile-First Approach**
   - 优先设计移动端体验
   - 渐进增强到桌面端
   - 触摸友好的交互元素

2. **Visual Hierarchy**
   - 清晰的信息层级
   - 重要信息突出显示
   - 合理的留白和间距

3. **Accessibility**
   - WCAG 2.1 AA 标准
   - 键盘导航支持
   - 屏幕阅读器友好

4. **Performance**
   - 快速加载
   - 流畅动画
   - 优化的图片

#### Color Palette

```css
/* Primary Colors */
--primary-500: #3b82f6; /* 主色调 - 蓝色，代表信任和专业 */
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Secondary Colors */
--secondary-500: #10b981; /* 辅助色 - 绿色，代表有效/成功 */
--secondary-600: #059669;

/* Accent Colors */
--accent-500: #f59e0b; /* 强调色 - 橙色，用于推荐位 */
--accent-600: #d97706;

/* Semantic Colors */
--success: #10b981; /* 成功/有效 */
--warning: #f59e0b; /* 警告/即将过期 */
--error: #ef4444; /* 错误/失效 */
--info: #3b82f6; /* 信息 */

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;

/* Background */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
```

#### Typography

```css
/* Font Family */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### 1. Home Page (`/`)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│           Navigation Bar                 │
├─────────────────────────────────────────┤
│                                          │
│           Hero Section                   │
│   - Catchy headline                      │
│   - Brief description                    │
│   - CTA button (Browse Campaigns)        │
│   - Search bar                           │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Featured Campaigns Carousel         │
│   (3-4 推荐位活动，自动轮播)              │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Category Quick Links                │
│   [API] [编辑器] [聊天] [图像生成]        │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Recent Campaigns                    │
│   (最新的 12 个活动，卡片网格)            │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Statistics Section                  │
│   - Total campaigns                      │
│   - Active platforms                     │
│   - Community contributions              │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Social Media CTA                    │
│   "关注我们获取最新活动"                  │
│                                          │
├─────────────────────────────────────────┤
│              Footer                      │
└─────────────────────────────────────────┘
```

**Hero Section Design:**
- 渐变背景（primary-500 到 primary-700）
- 大标题："发现最新 AI 免费额度"
- 副标题："汇聚全网 AI 薅羊毛活动，让你免费体验最新 AI 工具"
- 搜索框：大尺寸，带搜索图标和占位符
- CTA 按钮：醒目的橙色（accent-500）

**Featured Carousel:**
- 卡片式设计，带阴影和圆角
- 显示：平台 Logo、活动标题、免费额度、剩余时间
- 推荐标签：金色徽章
- 自动轮播，3 秒间隔
- 移动端：单卡显示，可滑动
- 桌面端：3 卡并排显示

**Category Links:**
- 图标 + 文字
- 卡片式，悬停效果
- 4 列网格（移动端 2 列）

#### 2. Campaign List Page (`/campaigns`)

**Layout Structure (Desktop):**
```
┌─────────────────────────────────────────────────────────┐
│                    Navigation Bar                        │
├──────────────┬──────────────────────────────────────────┤
│              │                                           │
│   Filter     │         Campaign Cards Grid              │
│   Sidebar    │                                           │
│              │   ┌──────┐ ┌──────┐ ┌──────┐            │
│  Categories  │   │ Card │ │ Card │ │ Card │            │
│  AI Models   │   └──────┘ └──────┘ └──────┘            │
│  Difficulty  │                                           │
│  Conditions  │   ┌──────┐ ┌──────┐ ┌──────┐            │
│  Status      │   │ Card │ │ Card │ │ Card │            │
│              │   └──────┘ └──────┘ └──────┘            │
│  [Reset]     │                                           │
│              │         [Load More]                       │
│              │                                           │
└──────────────┴──────────────────────────────────────────┘
```

**Layout Structure (Mobile):**
```
┌─────────────────────────────────┐
│       Navigation Bar             │
├─────────────────────────────────┤
│  [🔍 Search] [🎛️ Filter]        │
├─────────────────────────────────┤
│                                  │
│      Campaign Card               │
│                                  │
├─────────────────────────────────┤
│                                  │
│      Campaign Card               │
│                                  │
├─────────────────────────────────┤
│         [Load More]              │
└─────────────────────────────────┘
```

**Filter Sidebar Design:**
- 固定在左侧（桌面端）
- 抽屉式（移动端）
- 分组折叠面板
- 复选框 + 计数
- 应用/重置按钮

**Campaign Card Design:**
```
┌─────────────────────────────────────┐
│ [推荐] (如果是推荐位)                │
│                                      │
│  [Logo]  Platform Name               │
│                                      │
│  Campaign Title (Bold, Large)        │
│                                      │
│  💰 Free Credit: $10 USD             │
│  ⏰ Expires: 2024-12-31              │
│  🏷️ [新用户] [需手机]                │
│                                      │
│  ✅ 85% (123)  ❌ 10% (15)  📝 5%    │
│                                      │
│  [查看详情] [🔖 收藏]                │
└─────────────────────────────────────┘
```

**Card States:**
- 默认：白色背景，灰色边框
- 悬停：轻微上浮，阴影加深
- 推荐位：金色边框，渐变背景
- 即将过期：橙色边框，警告图标

#### 3. Campaign Detail Page (`/campaigns/[slug]`)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│           Navigation Bar                 │
├─────────────────────────────────────────┤
│                                          │
│      Breadcrumb                          │
│   Home > Campaigns > OpenAI Free Credit │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Campaign Header                     │
│   [Logo] Platform Name                   │
│   Campaign Title (H1)                    │
│   [🔖 Bookmark] [🔗 Share]              │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Key Information Card                │
│   💰 Free Credit: $10 USD                │
│   ⏰ Valid Until: 2024-12-31             │
│   📊 Difficulty: Easy                    │
│   🏷️ Conditions: [新用户] [需邮箱]       │
│   🤖 AI Models: GPT-4, GPT-3.5           │
│                                          │
│   [🚀 Get Started] (CTA Button)          │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Description                         │
│   (Rich text, formatted)                 │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Quick Reactions                     │
│   这个活动还有效吗？                      │
│   [✅ 仍然有效 (123)]                    │
│   [❌ 已失效 (15)]                       │
│   [📝 信息有误 (3)]                      │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Comments Section                    │
│   (类似 GitHub 的评论系统)                │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Related Campaigns                   │
│   (同平台或同类别的其他活动)              │
│                                          │
└─────────────────────────────────────────┘
```

**Key Information Card:**
- 卡片式设计，带边框和阴影
- 图标 + 文字，清晰易读
- CTA 按钮：大尺寸，醒目颜色
- 移动端：全宽显示

**Quick Reactions:**
- 大按钮，易于点击
- 显示百分比和数量
- 用户已选择的高亮显示
- 动画反馈

**Comments Section:**
- 用户头像 + 用户名
- 时间戳（相对时间）
- Markdown 支持
- Emoji 反应栏
- 回复嵌套（最多 2 层）
- 管理员标记的"有用"徽章

#### 4. Platform Page (`/platforms/[slug]`)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│           Navigation Bar                 │
├─────────────────────────────────────────┤
│                                          │
│      Platform Header                     │
│   [Large Logo]                           │
│   Platform Name (H1)                     │
│   Description                            │
│   [🌐 Website] [🐦 Twitter] [💬 Discord]│
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Statistics                          │
│   Active Campaigns: 5                    │
│   Total Campaigns: 12                    │
│   User Reactions: 1,234                  │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Active Campaigns                    │
│   (该平台的所有进行中活动)                │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│      Expired Campaigns (Collapsed)       │
│   [▶ Show 7 expired campaigns]           │
│                                          │
└─────────────────────────────────────────┘
```

#### 5. User Profile Page (`/profile`)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│           Navigation Bar                 │
├──────────────┬──────────────────────────┤
│              │                           │
│   Sidebar    │      Main Content         │
│              │                           │
│  [Avatar]    │   ┌─────────────────┐    │
│  Username    │   │  Contribution   │    │
│  Email       │   │  Statistics     │    │
│              │   └─────────────────┘    │
│  Navigation: │                           │
│  - Overview  │   ┌─────────────────┐    │
│  - Bookmarks │   │  Recent         │    │
│  - Submitted │   │  Activity       │    │
│  - Settings  │   └─────────────────┘    │
│              │                           │
└──────────────┴──────────────────────────┘
```

**Tabs:**
1. **Overview:** 统计数据 + 最近活动
2. **Bookmarks:** 收藏的活动列表
3. **Submitted:** 提交的活动及审核状态
4. **Settings:** 编辑个人信息

#### 6. Admin Dashboard (`/admin`)

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│           Admin Navigation               │
├──────────────┬──────────────────────────┤
│              │                           │
│   Sidebar    │      Dashboard           │
│              │                           │
│  - Dashboard │   ┌──────┐ ┌──────┐     │
│  - Pending   │   │ Stat │ │ Stat │     │
│  - Verify    │   └──────┘ └──────┘     │
│  - Campaigns │                           │
│  - Platforms │   ┌─────────────────┐    │
│  - Import    │   │  Quick Actions  │    │
│  - Featured  │   └─────────────────┘    │
│  - Settings  │                           │
│              │   ┌─────────────────┐    │
│              │   │  Recent         │    │
│              │   │  Submissions    │    │
│              │   └─────────────────┘    │
│              │                           │
└──────────────┴──────────────────────────┘
```

**Pending Review Page:**
- 表格视图
- 显示：标题、平台、提交者、提交时间
- 操作：查看、通过、拒绝、编辑
- 批量操作支持

**Bulk Import Interface:**
- 文件上传区（拖拽支持）
- 数据预览表格
- 字段映射
- 验证错误提示
- 导入进度条

#### 7. Mobile Navigation

**Bottom Navigation Bar:**
```
┌─────────────────────────────────────────┐
│                                          │
│           Page Content                   │
│                                          │
├─────────────────────────────────────────┤
│  [🏠 首页] [🔍 发现] [🔖 收藏] [👤 我的] │
└─────────────────────────────────────────┘
```

**Hamburger Menu (Top Right):**
- 分类浏览
- 关于我们
- 提交活动
- 语言切换
- 登录/注册

#### UI Components Library

**Buttons:**
```typescript
// Primary Button
<button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
  Get Started
</button>

// Secondary Button
<button className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors">
  Learn More
</button>

// Outline Button
<button className="border-2 border-primary-500 text-primary-500 hover:bg-primary-50 px-6 py-3 rounded-lg font-medium transition-colors">
  View Details
</button>
```

**Badges:**
```typescript
// Status Badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
  Active
</span>

// Featured Badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
  ⭐ Featured
</span>

// Condition Tag
<span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
  新用户
</span>
```

**Cards:**
```typescript
// Campaign Card
<div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
  {/* Card content */}
</div>

// Featured Card
<div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border-2 border-yellow-400">
  {/* Card content */}
</div>
```

**Loading States:**
- Skeleton screens for cards
- Spinner for buttons
- Progress bar for bulk import

**Empty States:**
- Friendly illustrations
- Clear messaging
- CTA to take action

**Error States:**
- Error icon
- Error message
- Retry button or alternative action

#### Animations and Transitions

**Micro-interactions:**
- Button hover: scale(1.02)
- Card hover: translateY(-4px)
- Icon hover: rotate or bounce
- Loading: pulse or spin

**Page Transitions:**
- Fade in/out
- Slide in from right (mobile)
- Smooth scroll

**Feedback Animations:**
- Success: checkmark animation
- Error: shake animation
- Loading: skeleton pulse

### UI Components

#### CampaignCard
```typescript
type CampaignCardProps = {
  campaign: Campaign;
  locale: 'zh' | 'en';
  showPlatform?: boolean;
  isFeatured?: boolean;
};
```

#### ReactionButtons
```typescript
type ReactionButtonsProps = {
  campaignId: string;
  reactions: {
    stillWorks: number;
    expired: number;
    infoIncorrect: number;
  };
  userReaction?: 'stillWorks' | 'expired' | 'infoIncorrect';
  onReact: (type: string) => Promise<void>;
};
```

#### CommentSection
```typescript
type CommentSectionProps = {
  campaignId: string;
  comments: Comment[];
  onSubmit: (content: string) => Promise<void>;
  onReply: (commentId: string, content: string) => Promise<void>;
  onReaction: (commentId: string, emoji: string) => Promise<void>;
};
```

#### FilterSidebar
```typescript
type FilterSidebarProps = {
  categories: Category[];
  aiModels: string[];
  conditionTags: ConditionTag[];
  onFilterChange: (filters: FilterState) => void;
};
```

### API Endpoints

#### Campaign APIs
- `GET /api/campaigns` - List campaigns with filters
- `GET /api/campaigns/[id]` - Get campaign details
- `POST /api/campaigns` - Create campaign (user submission)
- `PUT /api/campaigns/[id]` - Update campaign (admin)
- `DELETE /api/campaigns/[id]` - Delete campaign (admin)
- `POST /api/campaigns/bulk-import` - Bulk import campaigns (admin)

#### Platform APIs
- `GET /api/platforms` - List platforms
- `GET /api/platforms/[id]` - Get platform details
- `POST /api/platforms` - Create platform (admin)
- `PUT /api/platforms/[id]` - Update platform (admin)

#### Reaction APIs
- `POST /api/reactions` - Add/update reaction
- `DELETE /api/reactions/[id]` - Remove reaction
- `GET /api/reactions/stats/[campaignId]` - Get reaction statistics

#### Comment APIs
- `GET /api/comments/[campaignId]` - Get campaign comments
- `POST /api/comments` - Create comment
- `POST /api/comments/[id]/reply` - Reply to comment
- `POST /api/comments/[id]/reaction` - Add emoji reaction
- `DELETE /api/comments/[id]/reaction` - Remove emoji reaction

#### User APIs
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/bookmarks` - Get user bookmarks
- `POST /api/user/bookmarks` - Add bookmark
- `DELETE /api/user/bookmarks/[id]` - Remove bookmark

#### Translation APIs
- `POST /api/translate` - Translate content (internal)

#### Admin APIs
- `GET /api/admin/pending` - Get pending campaigns
- `GET /api/admin/verification-needed` - Get campaigns needing verification
- `POST /api/admin/campaigns/[id]/approve` - Approve campaign
- `POST /api/admin/campaigns/[id]/reject` - Reject campaign
- `POST /api/admin/featured` - Set featured campaign
- `GET /api/admin/stats` - Get platform statistics

## Data Models

### Database Schema

```typescript
// platforms table
export const platforms = pgTable('platforms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  logo: text('logo'),
  website: text('website'),
  description: text('description'),
  socialLinks: jsonb('social_links').$type<{
    twitter?: string;
    github?: string;
    discord?: string;
  }>(),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active, inactive
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// campaigns table
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  platformId: uuid('platform_id').notNull().references(() => platforms.id),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, published, rejected, expired
  freeCredit: text('free_credit'), // e.g., "$5 USD", "10000 tokens"
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  officialLink: text('official_link').notNull(),
  aiModels: jsonb('ai_models').$type<string[]>(),
  usageLimits: text('usage_limits'),
  difficultyLevel: varchar('difficulty_level', { length: 50 }), // easy, medium, hard
  isFeatured: boolean('is_featured').notNull().default(false),
  featuredUntil: timestamp('featured_until'),
  submittedBy: varchar('submitted_by', { length: 255 }), // Clerk user ID
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// campaign_translations table
export const campaignTranslations = pgTable('campaign_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  locale: varchar('locale', { length: 10 }).notNull(), // 'zh' | 'en'
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  isAiGenerated: boolean('is_ai_generated').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, table => ({
  uniqueCampaignLocale: unique().on(table.campaignId, table.locale),
}));

// condition_tags table
export const conditionTags = pgTable('condition_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // 'requirement' | 'benefit'
  difficultyWeight: integer('difficulty_weight').notNull().default(0), // 0-10, used to calculate difficulty
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// campaign_condition_tags table (many-to-many)
export const campaignConditionTags = pgTable('campaign_condition_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => conditionTags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
  uniqueCampaignTag: unique().on(table.campaignId, table.tagId),
}));

// tags table (for categorization)
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(), // 'category' | 'ai_model' | 'general'
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// campaign_tags table (many-to-many)
export const campaignTags = pgTable('campaign_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
  uniqueCampaignTag: unique().on(table.campaignId, table.tagId),
}));

// reactions table
export const reactions = pgTable('reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
  type: varchar('type', { length: 50 }).notNull(), // 'still_works' | 'expired' | 'info_incorrect'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, table => ({
  uniqueUserCampaign: unique().on(table.userId, table.campaignId),
}));

// comments table
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
  parentId: uuid('parent_id').references(() => comments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isMarkedUseful: boolean('is_marked_useful').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

// comment_reactions table
export const commentReactions = pgTable('comment_reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  commentId: uuid('comment_id').notNull().references(() => comments.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
  emoji: varchar('emoji', { length: 10 }).notNull(), // '👍', '👎', '😄', '🎉', etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
  uniqueUserCommentEmoji: unique().on(table.userId, table.commentId, table.emoji),
}));

// bookmarks table
export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(), // Clerk user ID
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, table => ({
  uniqueUserCampaign: unique().on(table.userId, table.campaignId),
}));
```

### TypeScript Interfaces

```typescript
export type Platform = {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  description?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    discord?: string;
  };
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
};

export type Campaign = {
  id: string;
  platformId: string;
  platform?: Platform;
  slug: string;
  status: 'pending' | 'published' | 'rejected' | 'expired';
  freeCredit?: string;
  startDate?: Date;
  endDate?: Date;
  officialLink: string;
  aiModels?: string[];
  usageLimits?: string;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  isFeatured: boolean;
  featuredUntil?: Date;
  submittedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  translations?: CampaignTranslation[];
  conditionTags?: ConditionTag[];
  tags?: Tag[];
};

export type CampaignTranslation = {
  id: string;
  campaignId: string;
  locale: 'zh' | 'en';
  title: string;
  description?: string;
  isAiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ConditionTag = {
  id: string;
  name: string;
  slug: string;
  type: 'requirement' | 'benefit';
  difficultyWeight: number;
  createdAt: Date;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  type: 'category' | 'ai_model' | 'general';
  createdAt: Date;
};

export type Reaction = {
  id: string;
  campaignId: string;
  userId: string;
  type: 'still_works' | 'expired' | 'info_incorrect';
  createdAt: Date;
  updatedAt: Date;
};

export type Comment = {
  id: string;
  campaignId: string;
  userId: string;
  parentId?: string;
  content: string;
  isMarkedUseful: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  user?: {
    id: string;
    username: string;
    avatar?: string;
  };
  replies?: Comment[];
  reactions?: CommentReaction[];
};

export type CommentReaction = {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
};

export type Bookmark = {
  id: string;
  userId: string;
  campaignId: string;
  campaign?: Campaign;
  createdAt: Date;
};
```

## Error Handling

### Error Types

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, message);
  }
}
```

### Error Handling Middleware

```typescript
export async function errorHandler(
  error: Error,
  req: NextRequest,
): Promise<NextResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          statusCode: error.statusCode,
        },
      },
      { status: error.statusCode },
    );
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Internal server error',
        statusCode: 500,
      },
    },
    { status: 500 },
  );
}
```

## Testing Strategy

### Unit Testing

使用 Vitest 进行单元测试，重点测试：

1. **Service Layer Functions**
   - Campaign CRUD operations
   - Reaction aggregation logic
   - Difficulty level calculation
   - Translation service

2. **Utility Functions**
   - Encryption/Decryption
   - Slug generation
   - Date formatting
   - Validation schemas

3. **Component Logic**
   - Form validation
   - State management
   - Event handlers

### Property-Based Testing

使用 fast-check 库进行属性测试。每个属性测试将运行至少 100 次迭代。

### Integration Testing

使用 Playwright 进行端到端测试：

1. **User Flows**
   - Browse campaigns
   - Submit campaign
   - Add reaction
   - Post comment
   - Bookmark campaign

2. **Admin Flows**
   - Review pending campaigns
   - Bulk import
   - Set featured campaigns

3. **Mobile Testing**
   - Responsive layout
   - Touch interactions
   - Navigation

### Test Data Generation

使用 @faker-js/faker 生成测试数据：

```typescript
import { faker } from '@faker-js/faker';

export function generateCampaign(): Campaign {
  return {
    id: faker.string.uuid(),
    platformId: faker.string.uuid(),
    slug: faker.helpers.slugify(faker.commerce.productName()),
    status: faker.helpers.arrayElement(['pending', 'published', 'rejected', 'expired']),
    freeCredit: `$${faker.number.int({ min: 1, max: 100 })} USD`,
    startDate: faker.date.past(),
    endDate: faker.date.future(),
    officialLink: faker.internet.url(),
    aiModels: faker.helpers.arrayElements(['GPT-4', 'Claude', 'Gemini']),
    difficultyLevel: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
    isFeatured: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Platform Creation Completeness
*For any* valid platform data (name, logo, website, description, social links), when a platform is created, all provided fields should be persisted and retrievable.
**Validates: Requirements 1.1**

### Property 2: Active Platform Filtering
*For any* set of platforms with mixed statuses, when listing platforms, only platforms with status 'active' should be returned.
**Validates: Requirements 1.3**

### Property 3: Platform Update Timestamp
*For any* platform update operation, the updatedAt timestamp should be greater than the previous updatedAt value.
**Validates: Requirements 1.5**

### Property 4: Campaign Expiration Auto-marking
*For any* campaign where endDate is in the past, the system should automatically mark its status as 'expired'.
**Validates: Requirements 2.3**

### Property 5: Expired Campaign Hiding
*For any* campaign list query, campaigns with status 'expired' should not be included in the results.
**Validates: Requirements 2.4**

### Property 6: Difficulty Level Calculation
*For any* campaign with condition tags, the calculated difficulty level should match the sum of tag difficulty weights: 0-3 = easy, 4-7 = medium, 8+ = hard.
**Validates: Requirements 2.8**

### Property 7: Soft Delete Preservation
*For any* campaign deletion operation, the campaign record should remain in the database with deletedAt timestamp set, not physically removed.
**Validates: Requirements 2.6**

### Property 8: User Submission Status
*For any* campaign submitted by a user, the initial status should be 'pending' and submittedBy should contain the user's ID.
**Validates: Requirements 4.3, 4.4**

### Property 9: Reaction Uniqueness
*For any* user and campaign combination, only one reaction should exist at a time (user can change reaction but not have multiple).
**Validates: Requirements 5.3, 5.5, 5.6**

### Property 10: Reaction Statistics Accuracy
*For any* campaign, the sum of all reaction counts should equal the total number of unique users who reacted.
**Validates: Requirements 5.7**

### Property 11: Verification Trigger Threshold
*For any* campaign where 'expired' reactions exceed 'still_works' reactions by more than 50%, the campaign status should be marked as needing verification.
**Validates: Requirements 5.8**

### Property 12: Comment Nesting Integrity
*For any* comment reply, the parentId should reference a valid existing comment in the same campaign.
**Validates: Requirements 6.8**

### Property 13: Emoji Reaction Uniqueness
*For any* user, comment, and emoji combination, only one reaction should exist (user can add/remove but not duplicate).
**Validates: Requirements 6.5, 6.7**

### Property 14: Bookmark Uniqueness
*For any* user and campaign combination, only one bookmark should exist at a time.
**Validates: Requirements 7.2, 7.4**

### Property 15: Translation Locale Uniqueness
*For any* campaign, there should be at most one translation per locale (zh or en).
**Validates: Requirements 8.5**

### Property 16: Translation Round Trip
*For any* campaign content, if translated from language A to language B and then back to language A, the semantic meaning should be preserved (tested with back-translation similarity).
**Validates: Requirements 8.4, 8.5**

### Property 17: Search Result Relevance
*For any* search query, all returned campaigns should contain the search term in either platform name, campaign title, or description.
**Validates: Requirements 9.1**

### Property 18: Multi-Filter Conjunction
*For any* set of applied filters, returned campaigns should satisfy ALL filter conditions simultaneously (AND logic, not OR).
**Validates: Requirements 9.8**

### Property 19: Tag Association Uniqueness
*For any* campaign and tag combination, only one association should exist in the junction table.
**Validates: Requirements 10.1**

### Property 20: Featured Campaign Expiration
*For any* featured campaign where featuredUntil date is in the past, the isFeatured flag should be automatically set to false.
**Validates: Requirements 12.3**

### Property 21: SEO Metadata Completeness
*For any* published campaign, the generated page should include all required SEO metadata: title, description, Open Graph tags, and JSON-LD structured data.
**Validates: Requirements 15.1, 15.2, 15.3**

### Property 22: URL Slug Uniqueness
*For any* two different campaigns or platforms, their slugs should be unique to prevent URL conflicts.
**Validates: Requirements 15.6, 15.7, 15.8**

### Property 23: API Encryption Round Trip
*For any* API request data, encrypting then decrypting should return the original data unchanged.
**Validates: Requirements 18.2, 18.3, 18.4, 18.5**

### Property 24: Rate Limit Enforcement
*For any* client making requests, when the request count exceeds the rate limit threshold within the time window, subsequent requests should be rejected with 429 status.
**Validates: Requirements 18.6**

### Property 25: User Contribution Statistics Accuracy
*For any* user, the displayed contribution statistics (submitted campaigns, reactions, comments) should match the actual count in the database.
**Validates: Requirements 17.7**

## Security Considerations

### API Encryption

**Encryption Algorithm:** AES-256-GCM

```typescript
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.API_ENCRYPTION_KEY!;

export function encryptData(data: any): string {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
}

export function decryptData(encryptedData: string): any {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  const jsonString = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(jsonString);
}
```

### Rate Limiting

使用 Arcjet 实现速率限制：

```typescript
import arcjet, { shield, tokenBucket } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    shield({ mode: 'LIVE' }),
    tokenBucket({
      mode: 'LIVE',
      refillRate: 10, // 10 tokens per interval
      interval: 60, // 60 seconds
      capacity: 100, // Maximum 100 tokens
    }),
  ],
});

export async function rateLimit(req: NextRequest) {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    throw new RateLimitError();
  }
}
```

### Bot Detection

使用 Arcjet 的 bot detection 功能：

```typescript
import { detectBot } from '@arcjet/next';

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [
    detectBot({
      mode: 'LIVE',
      allow: [
        'CATEGORY:SEARCH_ENGINE', // Allow Google, Bing, etc.
      ],
    }),
  ],
});
```

### Code Obfuscation

在生产构建时使用 webpack 插件进行代码混淆：

```typescript
// next.config.ts
import JavaScriptObfuscator from 'webpack-obfuscator';

const config: NextConfig = {
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      config.plugins.push(
        new JavaScriptObfuscator({
          rotateStringArray: true,
          stringArray: true,
          stringArrayThreshold: 0.75,
        }),
      );
    }
    return config;
  },
};
```

## Performance Optimization

### Image Optimization

使用 Next.js Image 组件和 Cloudinary：

```typescript
import Image from 'next/image';

export function PlatformLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={100}
      height={100}
      loading="lazy"
      format="webp"
      quality={80}
    />
  );
}
```

### Data Fetching Strategy

- **Static Generation (SSG):** 用于首页、分类页面
- **Server-Side Rendering (SSR):** 用于活动详情页（需要最新数据）
- **Incremental Static Regeneration (ISR):** 用于活动列表页（每 60 秒重新生成）

```typescript
// app/campaigns/page.tsx
export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  return <CampaignList campaigns={campaigns} />;
}
```

### Database Query Optimization

使用 DrizzleORM 的查询优化：

```typescript
// Eager loading related data
const campaigns = await db.query.campaigns.findMany({
  with: {
    platform: true,
    translations: true,
    conditionTags: {
      with: {
        tag: true,
      },
    },
  },
  where: eq(campaigns.status, 'published'),
  limit: 20,
});

// Use indexes
export const campaigns = pgTable('campaigns', {
  // ... fields
}, table => ({
  statusIdx: index('status_idx').on(table.status),
  endDateIdx: index('end_date_idx').on(table.endDate),
  slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));
```

### Caching Strategy

```typescript
import { unstable_cache } from 'next/cache';

export const getCampaigns = unstable_cache(
  async (filters: FilterOptions) => {
    return await db.query.campaigns.findMany({
      where: buildWhereClause(filters),
    });
  },
  ['campaigns'],
  {
    revalidate: 60,
    tags: ['campaigns'],
  },
);
```

## Internationalization (i18n)

### next-intl Configuration

```typescript
// src/libs/I18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../locales/${locale}.json`)).default,
}));
```

### Translation Workflow

1. **User/Admin submits content** → Detect language (zh or en)
2. **Trigger AI translation** → Call OpenAI API
3. **Save both versions** → Store in campaign_translations table
4. **Admin review** → Can edit AI-generated translation
5. **Display** → Show based on user's locale preference

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function translateContent(
  text: string,
  fromLang: 'zh' | 'en',
  toLang: 'zh' | 'en',
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following text from ${fromLang} to ${toLang}. Maintain the original meaning and tone.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content || text;
}
```

## Deployment

### Vercel Configuration

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY": "@clerk-publishable-key",
    "CLERK_SECRET_KEY": "@clerk-secret-key",
    "OPENAI_API_KEY": "@openai-api-key",
    "ARCJET_KEY": "@arcjet-key",
    "API_ENCRYPTION_KEY": "@api-encryption-key",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID": "@ga-measurement-id"
  }
}
```

### Database Migration

```bash
# Generate migration
pnpm run db:generate

# Apply migration
pnpm run db:migrate
```

### Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://...
DATABASE_URL_DIRECT=postgresql://...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# AI Translation
OPENAI_API_KEY=sk-...

# Security
ARCJET_KEY=ajkey_...
API_ENCRYPTION_KEY=...

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# Image Upload
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Monitoring and Analytics

### Google Analytics Integration

```typescript
// src/libs/Analytics.ts
import ReactGA from 'react-ga4';

export function initGA() {
  ReactGA.initialize(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!);
}

export function trackPageView(path: string) {
  ReactGA.send({ hitType: 'pageview', page: path });
}

export function trackEvent(category: string, action: string, label?: string) {
  ReactGA.event({
    category,
    action,
    label,
  });
}
```

### Key Metrics to Track

1. **User Engagement**
   - Page views
   - Session duration
   - Bounce rate

2. **Campaign Interactions**
   - Campaign views
   - Campaign clicks
   - Reaction submissions
   - Comment submissions
   - Bookmark additions

3. **User Contributions**
   - Campaign submissions
   - Approval rate
   - Average review time

4. **Search Behavior**
   - Search queries
   - Filter usage
   - Result click-through rate

## Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Email Notifications**
   - Notify users when bookmarked campaigns are expiring
   - Notify users when their submissions are approved/rejected
   - Weekly digest of new campaigns

2. **Advanced Search**
   - Full-text search with Algolia or Meilisearch
   - Search suggestions
   - Search history

3. **User Reputation System**
   - Points for contributions
   - Badges and achievements
   - Leaderboard

4. **Campaign Comparison**
   - Side-by-side comparison of multiple campaigns
   - Comparison matrix

5. **API for Third-party Integration**
   - Public API for accessing campaign data
   - Webhooks for campaign updates

6. **Mobile App**
   - Native iOS/Android apps
   - Push notifications

7. **Community Features**
   - User profiles with activity feed
   - Follow other users
   - Direct messaging

8. **Advanced Analytics Dashboard**
   - Campaign performance metrics
   - User behavior insights
   - Revenue tracking

### Admin Dashboard Detailed Design

**Design Philosophy:**
- 效率优先：快速完成审核和管理任务
- 信息密度：在不影响可读性的前提下展示更多信息
- 批量操作：支持批量审核、编辑、删除
- 数据可视化：用图表展示关键指标

**Color Scheme (Admin):**
```css
/* Admin specific colors */
--admin-primary: #6366f1; /* Indigo - 专业感 */
--admin-sidebar: #1e293b; /* Dark slate - 侧边栏背景 */
--admin-bg: #f8fafc; /* Light gray - 主背景 */
```

**Enhanced Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] AI Free Pool Admin    [🔔 Notifications] [👤 Admin] │
├──────────────┬──────────────────────────────────────────────┤
│              │                                               │
│   Sidebar    │      Main Content Area                        │
│   (Fixed)    │      (Scrollable)                             │
│              │                                               │
│  📊 Dashboard│   ┌─────────────────────────────────────┐    │
│  ⏳ Pending  │   │                                     │    │
│     (5) 🔴   │   │         Page Content                │    │
│  ⚠️  Verify  │   │                                     │    │
│     (3) 🟡   │   │                                     │    │
│  📝 Campaigns│   │                                     │    │
│  🏢 Platforms│   │                                     │    │
│  📥 Import   │   │                                     │    │
│  ⭐ Featured │   │                                     │    │
│  ⚙️  Settings│   │                                     │    │
│              │   └─────────────────────────────────────┘    │
│  [← Back to  │                                               │
│     Site]    │                                               │
│              │                                               │
└──────────────┴──────────────────────────────────────────────┘
```

**Sidebar Design:**
- 深色背景（admin-sidebar）
- 图标 + 文字
- 活动项高亮（左侧蓝色竖条）
- 待处理数量徽章（红色/黄色）
- 固定定位，始终可见
- 可折叠（移动端）

#### 6.1 Dashboard Overview Page

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                    [Date Range ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ 📝 Campaigns │ │ 👥 Users     │ │ 💬 Comments  │        │
│  │              │ │              │ │              │        │
│  │    156       │ │    1,234     │ │    3,456     │        │
│  │  +12 today   │ │  +45 today   │ │  +89 today   │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ ⏳ Pending   │ │ ⚠️  Verify   │ │ 📊 Reactions │        │
│  │              │ │              │ │              │        │
│  │     5        │ │     3        │ │    8,901     │        │
│  │  [Review]    │ │  [Check]     │ │  +234 today  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Quick Actions                                                │
│  ┌──────────────────┐ ┌──────────────────┐                  │
│  │ ➕ New Campaign  │ │ 🏢 New Platform  │                  │
│  └──────────────────┘ └──────────────────┘                  │
│  ┌──────────────────┐ ┌──────────────────┐                  │
│  │ 📥 Bulk Import   │ │ ⭐ Set Featured  │                  │
│  └──────────────────┘ └──────────────────┘                  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Recent Activity                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🟢 User @john submitted "OpenAI Free Credit"        │    │
│  │    2 minutes ago                          [Review]   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 🟡 Campaign "Claude Pro Trial" needs verification   │    │
│  │    15 minutes ago                         [Check]    │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 🔵 You approved "Gemini API Credits"                │    │
│  │    1 hour ago                             [View]     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Campaign Statistics (Last 30 Days)                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │  [Line Chart: Submissions, Approvals, Rejections]    │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Statistics Cards:**
- 大数字显示主要指标
- 小字显示变化趋势（+12 today）
- 图标表示类型
- 可点击跳转到详情页

#### 6.2 Pending Review Page

```
┌─────────────────────────────────────────────────────────────┐
│  Pending Campaigns (5)                    [Search...] [🔍]   │
├─────────────────────────────────────────────────────────────┤
│  [☑ Select All] [✅ Approve Selected] [❌ Reject Selected]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☐ [Logo] OpenAI Free Credit                         │    │
│  │                                                       │    │
│  │   Platform: OpenAI                                   │    │
│  │   Submitted by: @john_doe (john@example.com)         │    │
│  │   Submitted: 2024-01-15 10:30 AM                     │    │
│  │   Free Credit: $5 USD                                │    │
│  │   Valid Until: 2024-12-31                            │    │
│  │   Tags: [新用户] [需邮箱]                             │    │
│  │                                                       │    │
│  │   Description (ZH):                                  │    │
│  │   注册即送 $5 美元额度，可用于 GPT-4 API...          │    │
│  │                                                       │    │
│  │   Description (EN): [AI Generated ✨]                │    │
│  │   Get $5 USD credit upon registration...             │    │
│  │   [Edit Translation]                                 │    │
│  │                                                       │    │
│  │   [👁️ Preview] [✏️ Edit] [✅ Approve] [❌ Reject]   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☐ [Logo] Claude Pro Trial                           │    │
│  │   ...                                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Review Card Features:**
- 复选框用于批量操作
- 展开/折叠详情
- AI 翻译标识
- 编辑翻译按钮
- 快速操作按钮
- 提交者信息（可点击查看用户资料）

**Approve/Reject Modal:**
```
┌─────────────────────────────────────┐
│  Approve Campaign?                   │
├─────────────────────────────────────┤
│                                      │
│  Campaign: OpenAI Free Credit        │
│  Submitted by: @john_doe             │
│                                      │
│  ☐ Send notification to submitter   │
│  ☐ Publish immediately               │
│  ☐ Set as featured                   │
│                                      │
│  [Cancel] [✅ Approve]               │
│                                      │
└─────────────────────────────────────┘
```

#### 6.3 Verification Needed Page

```
┌─────────────────────────────────────────────────────────────┐
│  Campaigns Needing Verification (3)                          │
├─────────────────────────────────────────────────────────────┤
│  These campaigns have been flagged by users as expired or    │
│  having incorrect information.                                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ⚠️  Claude API Free Tier                            │    │
│  │                                                       │    │
│  │   User Feedback:                                     │    │
│  │   ✅ Still Works: 45 (30%)                           │    │
│  │   ❌ Expired: 85 (57%) ⚠️                            │    │
│  │   📝 Info Incorrect: 20 (13%)                        │    │
│  │                                                       │    │
│  │   Recent Comments:                                   │    │
│  │   💬 @user1: "This expired last week"                │    │
│  │   💬 @user2: "Credit amount changed to $3"           │    │
│  │                                                       │    │
│  │   [View Campaign] [Mark as Valid] [Mark as Expired]  │    │
│  │   [Edit Information]                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Verification Features:**
- 用户反馈统计可视化
- 最近评论摘要
- 快速操作按钮
- 警告图标和颜色编码

#### 6.4 Campaigns Management Page

```
┌─────────────────────────────────────────────────────────────┐
│  All Campaigns (156)                  [+ New Campaign]       │
├─────────────────────────────────────────────────────────────┤
│  [Search...] [🔍]  [Filter ▼] [Sort: Latest ▼]             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Title          │ Platform │ Status  │ Expires │ Actions│  │
│  ├─────────────────────────────────────────────────────┤    │
│  │ OpenAI Free    │ OpenAI   │ 🟢 Live │ 30 days │ [⋮]  │  │
│  │ Credit         │          │         │         │      │  │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Claude Pro     │ Anthropic│ 🟡 Verify│ 15 days│ [⋮]  │  │
│  │ Trial          │          │         │         │      │  │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Gemini API     │ Google   │ 🟢 Live │ 60 days │ [⋮]  │  │
│  │ Credits        │          │         │         │      │  │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [← Previous] Page 1 of 8 [Next →]                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Table Features:**
- 可排序列
- 状态颜色编码
- 快速操作菜单（⋮）
- 批量选择和操作
- 分页

**Actions Menu (⋮):**
```
┌──────────────────┐
│ 👁️ View          │
│ ✏️ Edit          │
│ ⭐ Set Featured  │
│ 📊 Statistics    │
│ 🗑️ Delete        │
└──────────────────┘
```

#### 6.5 Bulk Import Page

```
┌─────────────────────────────────────────────────────────────┐
│  Bulk Import Campaigns                                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Step 1: Upload File                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                                                       │    │
│  │         📁 Drag & Drop CSV or JSON file here         │    │
│  │                      or                               │    │
│  │              [Choose File]                            │    │
│  │                                                       │    │
│  │  Supported formats: .csv, .json                       │    │
│  │  Max file size: 10MB                                  │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  [Download Template] [View Format Guide]                     │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Step 2: Preview & Validate (After upload)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ✅ 10 valid campaigns                                │    │
│  │ ⚠️  2 warnings                                        │    │
│  │ ❌ 1 error                                            │    │
│  │                                                       │    │
│  │ [Show Details]                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Preview:                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Row │ Platform │ Title        │ Status │ Issues     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 1   │ OpenAI   │ Free Credit  │ ✅     │ -          │    │
│  │ 2   │ Claude   │ Pro Trial    │ ⚠️     │ Missing    │    │
│  │     │          │              │        │ end date   │    │
│  │ 3   │ Invalid  │ Test         │ ❌     │ Platform   │    │
│  │     │          │              │        │ not found  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Options:                                                     │
│  ☑ Trigger AI translation for all campaigns                  │
│  ☑ Send notification to admin after import                   │
│  ☐ Publish immediately (default: pending review)             │
│                                                               │
│  [Cancel] [Import Valid Campaigns (10)]                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Import Features:**
- 拖拽上传
- 实时验证
- 错误/警告提示
- 预览表格
- 选项配置
- 进度条（导入时）

#### 6.6 Featured Campaigns Management

```
┌─────────────────────────────────────────────────────────────┐
│  Featured Campaigns                      [+ Add Featured]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Active Featured (2/3 slots)                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. OpenAI Free Credit                                │    │
│  │    Featured until: 2024-02-15                        │    │
│  │    Impressions: 12,345 | Clicks: 567 (4.6% CTR)     │    │
│  │    [Edit] [Remove] [Extend]                          │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 2. Claude Pro Trial                                  │    │
│  │    Featured until: 2024-02-20                        │    │
│  │    Impressions: 8,901 | Clicks: 234 (2.6% CTR)      │    │
│  │    [Edit] [Remove] [Extend]                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Available Slot: 1                                            │
│  [+ Add Campaign to Featured]                                │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Featured History                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Campaign        │ Period      │ Total    │ Total    │    │
│  │                 │             │ Impress. │ Clicks   │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ Gemini Credits  │ Jan 1-15    │ 45,678   │ 2,345    │    │
│  │ GPT-4 Trial     │ Dec 15-31   │ 34,567   │ 1,234    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Add Featured Modal:**
```
┌─────────────────────────────────────┐
│  Add Featured Campaign               │
├─────────────────────────────────────┤
│                                      │
│  Select Campaign:                    │
│  [Search campaigns...] [🔍]         │
│                                      │
│  Featured Until:                     │
│  [2024-02-28] [📅]                  │
│                                      │
│  Position:                           │
│  ○ Slot 1 (Top)                     │
│  ○ Slot 2 (Middle)                  │
│  ● Slot 3 (Bottom)                  │
│                                      │
│  [Cancel] [Add Featured]             │
│                                      │
└─────────────────────────────────────┘
```

#### 6.7 Settings Page

```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  General Settings                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Site Name:                                           │    │
│  │ [AI Free Pool]                                       │    │
│  │                                                       │    │
│  │ Site Description:                                    │    │
│  │ [Discover free AI credits and trials...]            │    │
│  │                                                       │    │
│  │ Contact Email:                                       │    │
│  │ [admin@aifreepool.com]                               │    │
│  │                                                       │    │
│  │ [Save Changes]                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Social Media Links                                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Twitter: [https://twitter.com/...]                  │    │
│  │ Telegram: [https://t.me/...]                         │    │
│  │ WeChat QR Code: [Upload Image]                       │    │
│  │ Email Newsletter: [newsletter@...]                   │    │
│  │                                                       │    │
│  │ [Save Changes]                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Condition Tags Management                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ [+ Add New Tag]                                      │    │
│  │                                                       │    │
│  │ Tag Name      │ Type        │ Difficulty │ Actions  │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ 新用户        │ Requirement │ 0          │ [Edit]   │    │
│  │ 需实名认证    │ Requirement │ 5          │ [Edit]   │    │
│  │ 需信用卡      │ Requirement │ 8          │ [Edit]   │    │
│  │ 需手机号      │ Requirement │ 3          │ [Edit]   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Security Settings                                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ API Encryption: ✅ Enabled                           │    │
│  │ Rate Limiting: ✅ Enabled (100 req/min)              │    │
│  │ Bot Detection: ✅ Enabled                            │    │
│  │                                                       │    │
│  │ [Configure Security]                                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Admin Mobile View:**
- 汉堡菜单替代侧边栏
- 简化的卡片布局
- 底部固定操作栏
- 滑动手势支持
