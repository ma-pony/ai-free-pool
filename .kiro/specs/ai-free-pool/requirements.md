# Requirements Document

## Introduction

AI Free Pool 是一个专注于分享 AI 免费资源的平台，帮助用户发现和追踪各种 AI 工具的免费额度活动（"薅羊毛"）。平台支持中英文双语，采用移动端优先的设计理念，通过用户协作维护内容的时效性和准确性。

## Glossary

- **Platform（平台）**: AI 工具或服务的提供商，如 OpenAI、Anthropic 等
- **Campaign（活动）**: 平台提供的具体免费额度活动，具有时效性
- **Reaction（快速反馈）**: 用户对活动状态的快速投票（有效/失效/信息有误）
- **Comment（评论）**: 用户对活动的详细文字反馈
- **Featured（推荐位）**: 付费的活动展示位置，获得更高曝光
- **Contributor（贡献者）**: 提交活动的用户
- **Admin（管理员）**: 平台管理员，负责审核和管理内容
- **Translation（翻译）**: 活动内容的多语言版本
- **AI Translation Service（AI 翻译服务）**: 自动将内容翻译为其他语言的服务
- **Condition Tag（条件标签）**: 标识活动参与条件的标签，如新用户、需实名认证、需手机号、需信用卡等
- **Difficulty Level（难度等级）**: 根据活动条件标签自动计算的注册难度（简单、中等、困难）
- **User Profile（用户个人中心）**: 用户管理个人信息、收藏和贡献的页面
- **API Encryption（API 加密）**: 前后端接口调用的数据加密机制

## Requirements

### Requirement 1: 平台管理

**User Story:** 作为管理员，我希望能够管理 AI 工具平台信息，以便用户了解不同的 AI 服务提供商。

#### Acceptance Criteria

1. WHEN 管理员创建平台时，THE System SHALL 保存平台名称、Logo、官网链接、描述和社交媒体链接
2. WHEN 管理员上传平台 Logo 时，THE System SHALL 支持常见图片格式并优化存储
3. WHEN 用户浏览平台列表时，THE System SHALL 显示所有活跃平台及其基本信息
4. WHEN 用户点击平台时，THE System SHALL 显示该平台的详细信息和所有关联的活动
5. WHEN 管理员更新平台信息时，THE System SHALL 保存更改并更新显示时间

### Requirement 2: 活动管理

**User Story:** 作为管理员，我希望能够管理薅羊毛活动信息，以便用户获取最新的免费额度信息。

#### Acceptance Criteria

1. WHEN 管理员创建活动时，THE System SHALL 要求输入活动标题、描述、免费额度详情、有效期、官网链接和关联平台
2. WHEN 管理员设置活动有效期时，THE System SHALL 接受开始时间和结束时间
3. WHEN 活动结束时间已过时，THE System SHALL 自动将活动状态标记为已过期
4. WHEN 活动状态为已过期时，THE System SHALL 在前端列表中隐藏该活动
5. WHEN 管理员编辑活动时，THE System SHALL 保存所有字段的更改并记录更新时间
6. WHEN 管理员删除活动时，THE System SHALL 软删除活动记录而非物理删除
7. WHEN 管理员创建活动时，THE System SHALL 允许添加活动条件标签（新用户、需实名认证、需手机号、需信用卡等）
8. WHEN 活动包含多个条件标签时，THE System SHALL 根据标签自动计算注册难度等级（简单、中等、困难）
9. WHEN 活动支持特定 AI 模型时，THE System SHALL 保存 AI 模型列表
10. WHEN 活动有使用限制时，THE System SHALL 保存限制条件描述
11. WHEN 用户浏览活动时，THE System SHALL 显示所有活动条件标签
12. WHEN 用户筛选活动时，THE System SHALL 支持按条件标签筛选

### Requirement 3: 用户认证

**User Story:** 作为用户，我希望能够通过社交账号快速登录，以便使用平台的互动功能。

#### Acceptance Criteria

1. WHEN 用户点击登录按钮时，THE System SHALL 提供 Google 和 GitHub 社交登录选项
2. WHEN 用户通过社交账号登录时，THE System SHALL 创建或关联用户账户
3. WHEN 用户首次登录时，THE System SHALL 保存用户的基本信息（用户名、邮箱、头像）
4. WHEN 用户已登录时，THE System SHALL 在页面显示用户头像和用户名
5. WHEN 用户点击登出时，THE System SHALL 清除会话并返回未登录状态

### Requirement 4: 用户提交活动

**User Story:** 作为用户，我希望能够提交新的薅羊毛活动，以便分享我发现的免费资源。

#### Acceptance Criteria

1. WHEN 用户提交新活动时，THE System SHALL 要求用户已登录
2. WHEN 用户填写活动表单时，THE System SHALL 要求必填字段包括平台名称、活动标题、活动链接和有效期
3. WHEN 用户提交活动时，THE System SHALL 将活动状态设置为待审核
4. WHEN 用户提交活动时，THE System SHALL 记录提交者的用户 ID
5. WHEN 管理员审核通过活动时，THE System SHALL 将活动状态更改为已发布并显示在前端
6. WHEN 管理员拒绝活动时，THE System SHALL 将活动状态更改为已拒绝
7. WHEN 活动被发布时，THE System SHALL 在活动详情页显示贡献者的用户名和头像

### Requirement 5: 快速反馈系统

**User Story:** 作为用户，我希望能够快速反馈活动的状态，以便帮助其他用户了解活动是否仍然有效。

#### Acceptance Criteria

1. WHEN 用户查看活动时，THE System SHALL 显示三种快速反馈选项：仍然有效、已失效、信息有误
2. WHEN 用户点击反馈选项时，THE System SHALL 要求用户已登录
3. WHEN 已登录用户点击反馈时，THE System SHALL 记录用户的反馈并更新统计数据
4. WHEN 用户已对某活动反馈时，THE System SHALL 高亮显示用户的选择
5. WHEN 用户再次点击已选择的反馈时，THE System SHALL 取消该反馈
6. WHEN 用户点击不同的反馈选项时，THE System SHALL 更新用户的反馈为新选项
7. WHEN 活动收到反馈时，THE System SHALL 显示每种反馈的数量统计
8. WHEN 已失效反馈数量超过有效反馈数量的 50% 时，THE System SHALL 将活动标记为待验证状态
9. WHEN 活动被标记为待验证时，THE System SHALL 在管理员后台显示提醒

### Requirement 6: 评论系统

**User Story:** 作为用户，我希望能够对活动发表详细评论，以便分享使用经验和注意事项。

#### Acceptance Criteria

1. WHEN 用户查看活动详情时，THE System SHALL 显示该活动的所有评论
2. WHEN 用户发表评论时，THE System SHALL 要求用户已登录
3. WHEN 用户提交评论时，THE System SHALL 保存评论内容、用户 ID 和时间戳
4. WHEN 用户查看评论时，THE System SHALL 显示评论者的用户名、头像和发表时间
5. WHEN 用户对评论添加 emoji 反应时，THE System SHALL 记录反应类型和用户 ID
6. WHEN 评论收到 emoji 反应时，THE System SHALL 显示每种 emoji 的数量
7. WHEN 用户点击已添加的 emoji 时，THE System SHALL 取消该反应
8. WHEN 用户回复评论时，THE System SHALL 创建嵌套的回复并关联到父评论
9. WHEN 管理员标记评论为有用时，THE System SHALL 在评论上显示特殊标识

### Requirement 7: 收藏功能

**User Story:** 作为用户，我希望能够收藏感兴趣的活动，以便稍后查看。

#### Acceptance Criteria

1. WHEN 用户点击收藏按钮时，THE System SHALL 要求用户已登录
2. WHEN 已登录用户收藏活动时，THE System SHALL 保存用户 ID 和活动 ID 的关联
3. WHEN 用户已收藏某活动时，THE System SHALL 高亮显示收藏按钮
4. WHEN 用户再次点击已收藏的活动时，THE System SHALL 取消收藏
5. WHEN 用户访问个人收藏页面时，THE System SHALL 显示所有已收藏的活动
6. WHEN 收藏的活动过期时，THE System SHALL 在收藏列表中标记该活动为已过期

### Requirement 8: 多语言支持

**User Story:** 作为用户，我希望能够使用中文或英文浏览网站，以便更好地理解内容。

#### Acceptance Criteria

1. WHEN 用户访问网站时，THE System SHALL 根据浏览器语言设置自动选择中文或英文
2. WHEN 用户切换语言时，THE System SHALL 更新所有界面文本和活动内容
3. WHEN 用户或管理员提交活动时，THE System SHALL 检测输入语言
4. WHEN 活动内容为单一语言时，THE System SHALL 调用 AI Translation Service 生成另一语言版本
5. WHEN AI 翻译完成时，THE System SHALL 保存翻译结果到数据库
6. WHEN 管理员审核活动时，THE System SHALL 显示两种语言版本并允许编辑
7. WHEN 管理员修改翻译时，THE System SHALL 保存人工修改的版本
8. WHEN 用户查看活动时，THE System SHALL 根据当前语言设置显示对应版本

### Requirement 9: 搜索和筛选

**User Story:** 作为用户，我希望能够搜索和筛选活动，以便快速找到感兴趣的内容。

#### Acceptance Criteria

1. WHEN 用户输入搜索关键词时，THE System SHALL 在平台名称、活动标题和描述中搜索匹配内容
2. WHEN 用户选择分类筛选时，THE System SHALL 只显示该分类的活动
3. WHEN 用户选择 AI 模型筛选时，THE System SHALL 只显示支持该模型的活动
4. WHEN 用户选择注册难度筛选时，THE System SHALL 只显示符合条件的活动
5. WHEN 用户选择是否需要信用卡筛选时，THE System SHALL 只显示符合条件的活动
6. WHEN 用户选择活动状态筛选时，THE System SHALL 只显示对应状态的活动
7. WHEN 用户选择排序方式时，THE System SHALL 按最新、最热门、即将过期或额度最高排序
8. WHEN 用户应用多个筛选条件时，THE System SHALL 显示同时满足所有条件的活动

### Requirement 10: 标签系统

**User Story:** 作为管理员，我希望能够为活动添加标签，以便用户更好地分类和查找活动。

#### Acceptance Criteria

1. WHEN 管理员创建或编辑活动时，THE System SHALL 允许添加多个标签
2. WHEN 管理员输入标签时，THE System SHALL 提供已存在标签的自动补全建议
3. WHEN 用户点击标签时，THE System SHALL 显示所有包含该标签的活动
4. WHEN 用户浏览标签页面时，THE System SHALL 显示所有标签及其活动数量
5. WHEN 标签没有关联任何活动时，THE System SHALL 在管理后台显示但不在前端显示

### Requirement 11: 管理员后台

**User Story:** 作为管理员，我希望有一个专门的后台界面，以便高效管理平台内容。

#### Acceptance Criteria

1. WHEN 管理员访问后台时，THE System SHALL 验证管理员权限
2. WHEN 管理员登录后台时，THE System SHALL 显示待审核活动数量
3. WHEN 管理员查看待审核列表时，THE System SHALL 显示所有待审核的活动
4. WHEN 管理员查看待验证列表时，THE System SHALL 显示所有被用户反馈为失效的活动
5. WHEN 管理员审核活动时，THE System SHALL 提供通过、拒绝和编辑选项
6. WHEN 管理员批量导入活动时，THE System SHALL 支持 CSV 和 JSON 格式
7. WHEN 管理员上传导入文件时，THE System SHALL 解析文件并显示预览
8. WHEN 管理员确认导入时，THE System SHALL 批量创建活动并触发 AI 翻译
9. WHEN 管理员查看统计数据时，THE System SHALL 显示活动总数、用户总数、反馈总数等关键指标

### Requirement 12: 推荐位管理

**User Story:** 作为管理员，我希望能够设置推荐位活动，以便实现平台盈利。

#### Acceptance Criteria

1. WHEN 管理员设置推荐位时，THE System SHALL 允许选择活动和展示时间段
2. WHEN 推荐位活动展示时，THE System SHALL 在列表顶部显示并带有推荐标识
3. WHEN 推荐位时间到期时，THE System SHALL 自动取消推荐状态
4. WHEN 用户点击推荐位活动时，THE System SHALL 记录点击数据
5. WHEN 管理员查看推荐位统计时，THE System SHALL 显示展示次数和点击次数

### Requirement 13: 社交媒体引导

**User Story:** 作为平台运营者，我希望能够引导用户关注社交媒体，以便建立用户社区和推送更新。

#### Acceptance Criteria

1. WHEN 用户首次访问网站时，THE System SHALL 显示欢迎弹窗介绍平台并引导关注
2. WHEN 用户关闭欢迎弹窗时，THE System SHALL 在 7 天内不再显示
3. WHEN 用户收藏第 3 个活动时，THE System SHALL 显示关注引导提示
4. WHEN 用户查看已过期活动时，THE System SHALL 在底部显示关注提示
5. WHEN 用户浏览任何页面时，THE System SHALL 在 Header 和 Footer 显示社交媒体图标
6. WHEN 用户点击社交媒体图标时，THE System SHALL 显示详细的关注信息（二维码、链接等）
7. WHEN 用户在移动端浏览时，THE System SHALL 在底部导航栏提供关注入口

### Requirement 14: 移动端优化

**User Story:** 作为移动端用户，我希望网站在手机上有良好的体验，以便随时随地浏览活动。

#### Acceptance Criteria

1. WHEN 用户在移动设备访问时，THE System SHALL 使用响应式布局适配屏幕尺寸
2. WHEN 用户在移动端浏览列表时，THE System SHALL 使用卡片式布局便于滑动
3. WHEN 用户在移动端操作时，THE System SHALL 提供大尺寸的可点击区域
4. WHEN 用户在移动端浏览时，THE System SHALL 在底部显示导航栏（首页、分类、收藏、我的）
5. WHEN 用户在移动端下拉页面时，THE System SHALL 支持下拉刷新功能
6. WHEN 用户在移动端查看筛选器时，THE System SHALL 使用抽屉式侧边栏
7. WHEN 用户在移动端分享活动时，THE System SHALL 调用原生分享 API

### Requirement 15: SEO 优化

**User Story:** 作为平台运营者，我希望网站有良好的 SEO，以便吸引更多用户通过搜索引擎访问。

#### Acceptance Criteria

1. WHEN 搜索引擎爬取活动页面时，THE System SHALL 提供完整的 meta 标签（标题、描述、关键词）
2. WHEN 搜索引擎爬取活动页面时，THE System SHALL 提供 Open Graph 标签用于社交媒体分享
3. WHEN 搜索引擎爬取活动页面时，THE System SHALL 提供 JSON-LD 结构化数据
4. WHEN 搜索引擎爬取网站时，THE System SHALL 提供 sitemap.xml 文件
5. WHEN 搜索引擎爬取网站时，THE System SHALL 提供 robots.txt 文件
6. WHEN 用户访问活动时，THE System SHALL 使用语义化的 URL（如 /deals/openai-free-credit）
7. WHEN 用户访问平台页面时，THE System SHALL 使用语义化的 URL（如 /platforms/openai）
8. WHEN 用户访问分类页面时，THE System SHALL 使用语义化的 URL（如 /category/api）

### Requirement 16: 数据分析

**User Story:** 作为平台运营者，我希望能够追踪用户行为，以便优化平台功能和内容。

#### Acceptance Criteria

1. WHEN 用户访问任何页面时，THE System SHALL 向 Google Analytics 发送页面浏览事件
2. WHEN 用户点击活动链接时，THE System SHALL 向 Google Analytics 发送点击事件
3. WHEN 用户提交反馈时，THE System SHALL 向 Google Analytics 发送反馈事件
4. WHEN 用户收藏活动时，THE System SHALL 向 Google Analytics 发送收藏事件
5. WHEN 用户提交活动时，THE System SHALL 向 Google Analytics 发送提交事件
6. WHEN 用户搜索时，THE System SHALL 向 Google Analytics 发送搜索事件及关键词

### Requirement 17: 用户个人中心

**User Story:** 作为用户，我希望有一个个人中心页面，以便管理我的账户信息和收藏内容。

#### Acceptance Criteria

1. WHEN 用户访问个人中心时，THE System SHALL 要求用户已登录
2. WHEN 用户查看个人中心时，THE System SHALL 显示用户名、头像、邮箱和注册时间
3. WHEN 用户编辑个人信息时，THE System SHALL 允许修改用户名和头像
4. WHEN 用户查看收藏列表时，THE System SHALL 显示所有已收藏的活动
5. WHEN 用户查看提交历史时，THE System SHALL 显示用户提交的所有活动及其审核状态
6. WHEN 用户查看反馈历史时，THE System SHALL 显示用户的所有快速反馈和评论
7. WHEN 用户查看贡献统计时，THE System SHALL 显示提交活动数、反馈数和评论数
8. WHEN 用户删除账户时，THE System SHALL 软删除用户数据并保留贡献记录

### Requirement 18: 数据安全和防爬虫

**User Story:** 作为平台运营者，我希望系统具有数据保护机制，以便防止数据被恶意抓取和泄露。

#### Acceptance Criteria

1. WHEN 系统构建生产版本时，THE System SHALL 对 JavaScript 代码进行混淆处理
2. WHEN 前端调用后端 API 时，THE System SHALL 使用加密算法对请求数据进行加密
3. WHEN 后端接收 API 请求时，THE System SHALL 验证并解密请求数据
4. WHEN 后端返回响应时，THE System SHALL 对响应数据进行加密
5. WHEN 前端接收响应时，THE System SHALL 解密响应数据
6. WHEN 系统检测到高频请求时，THE System SHALL 实施速率限制
7. WHEN 系统检测到爬虫行为时，THE System SHALL 返回错误响应或限制访问
8. WHEN API 被调用时，THE System SHALL 验证请求来源和签名
9. WHEN 系统传输数据时，THE System SHALL 强制使用 HTTPS 协议
10. WHEN 用户访问敏感接口时，THE System SHALL 要求有效的认证令牌

### Requirement 19: 性能优化

**User Story:** 作为用户，我希望网站加载速度快，以便快速浏览内容。

#### Acceptance Criteria

1. WHEN 用户访问页面时，THE System SHALL 使用图片懒加载技术
2. WHEN 用户浏览活动列表时，THE System SHALL 使用分页或无限滚动加载
3. WHEN 系统存储 Logo 图片时，THE System SHALL 转换为 WebP 格式
4. WHEN 用户访问页面时，THE System SHALL 优先加载关键内容
5. WHEN 用户访问相同页面时，THE System SHALL 使用浏览器缓存
6. WHEN 系统渲染页面时，THE System SHALL 使用 Next.js 的服务端渲染或静态生成
