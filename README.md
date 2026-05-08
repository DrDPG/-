# 爽文生成器 AI

一个基于 AI 的互动式爽文生成器，用户可以选择题材、设定角色，AI 实时生成个性化爽文章节。

## ✨ 功能特点

- 🎭 **6 种经典题材**: 重生逆袭、穿越异世、系统文、赘婿翻身、都市修仙、末世求生
- 🤖 **AI 实时生成**: 基于 DeepSeek API，每次生成独一无二的剧情
- 🎮 **互动式剧情**: 每章 3 个选项，用户决定故事走向
- 💾 **云端保存**: 登录用户作品永久保存
- 🎁 **会员系统**: 免费用户每天 3 章，会员无限生成

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 运行开发服务器
npm run dev
```

访问 http://localhost:3000

## 📋 详细配置

请查看 [SETUP.md](./SETUP.md) 获取完整的配置指南。

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS + shadcn/ui
- **认证**: Supabase Auth
- **数据库**: Supabase PostgreSQL
- **AI**: DeepSeek API

## 📄 许可证

MIT
