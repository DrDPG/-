# 爽文生成器 AI - 项目配置指南

## 📋 项目概述

一个基于 AI 的爽文生成器，用户可以选择题材、设定角色，AI 实时生成个性化爽文章节。

- **技术栈**: Next.js 16 + React 19 + TypeScript + Tailwind CSS + Supabase
- **AI 引擎**: DeepSeek API (可切换 Claude/OpenAI)
- **认证**: Supabase Auth
- **数据库**: Supabase PostgreSQL

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd story-forge
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
# Supabase 配置 (必需)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DeepSeek API (推荐，便宜)
DEEPSEEK_API_KEY=your_deepseek_api_key

# 或使用其他 AI (可选)
CLAUDE_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. 获取 API Keys

#### Supabase 配置
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 获取 Project URL 和 anon key
4. 在 SQL Editor 中执行 `supabase/schema.sql` 创建表结构

#### DeepSeek API 配置
1. 访问 [platform.deepseek.com](https://platform.deepseek.com)
2. 注册账号获取 API Key
3. 充值（建议先充值 10 元测试）

### 4. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 🗄️ 数据库设置

在 Supabase SQL Editor 中执行以下步骤：

1. 打开 `supabase/schema.sql` 文件
2. 复制全部内容
3. 粘贴到 Supabase SQL Editor
4. 点击 Run

这将创建以下表：
- `user_profiles` - 用户配置和次数限制
- `stories` - 用户故事
- `chapters` - 章节内容
- `orders` - 订单记录

---

## 📦 部署到 Vercel

### 1. 准备部署

```bash
npm run build
```

### 2. 部署步骤

1. 在 [Vercel](https://vercel.com) 导入 GitHub 仓库
2. 配置环境变量（Settings → Environment Variables）
3. 部署

### 3. 配置自定义域名（可选）

在 Vercel 项目设置中添加自定义域名

---

## 💰 付费配置

### 方式一：收款码（推荐初期）

1. 在 `src/app/pricing/page.tsx` 中替换收款码
2. 设置客服联系方式（微信/邮箱）

### 方式二：虎皮椒（自动支付）

1. 注册 [虎皮椒](https://www.xunhupay.com)
2. 创建支付插件
3. 集成 API（待开发）

---

## 📊 成本分析

### AI 成本 (DeepSeek)
- 生成 1 章 ≈ ¥0.01
- 免费用户每天 3 章 = ¥0.03/天
- 付费用户每天 10 章 ≈ ¥0.1/天 = ¥3/月

### 收入预估
- 月卡 ¥29 - 成本 ¥3 = 利润 ¥26 (89%)
- 年卡 ¥199 - 成本 ¥36 = 利润 ¥163 (82%)

### 免费额度
- Supabase 免费额度: 500MB 数据库 + 50k 用户/月
- Vercel 免费额度: 100GB 带宽/月

---

## 🎯 变现路径

### 阶段 1: 验证期 (0-100 用户)
- 收款方式: 个人微信/支付宝收款码
- 价格: ¥9.9/月
- 流程: 手动开通会员

### 阶段 2: 增长期 (100-1000 用户)
- 收款方式: 虎皮椒（自动支付）
- 价格: ¥29/月，¥199/年

### 阶段 3: 规模化 (1000+ 用户)
- 接入企业支付接口
- 扩展功能: 分享赚次数、邀请奖励

---

## 🛠️ 常见问题

### Q: 如何切换 AI 引擎？
A: 修改 `src/app/api/generate/route.ts` 中的 `API_PROVIDER` 常量

### Q: 如何调整免费次数？
A: 修改 `supabase/schema.sql` 中的 `daily_chapters_limit` 默认值

### Q: 游客模式的作品会保存吗？
A: 不会，游客模式仅用于体验，建议引导用户注册

---

## 📝 后续开发计划

- [ ] 自动支付集成（虎皮椒）
- [ ] 分享赚免费次数功能
- [ ] 邀请奖励系统
- [ ] 更多题材和设定选项
- [ ] 读者社区功能
