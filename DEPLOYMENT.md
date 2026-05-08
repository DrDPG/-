# 爽文生成器 AI - 部署上线指南

## 📋 部署前检查清单

- [ ] 已注册 GitHub 账号
- [ ] 代码已推送到 GitHub
- [ ] 已注册 Vercel 账号
- [ ] 已购买域名（可选）

---

## 🚀 部署步骤

### 1. 推送代码到 GitHub

```bash
cd "c:/Users/Administrator.DESKTOP-QRU8O8Q/Desktop/make money/story-forge"
git init
git add .
git commit -m "Initial commit"
```

然后在 GitHub 创建新仓库，按照提示推送代码。

### 2. 部署到 Vercel

1. 访问 https://vercel.com
2. 用 GitHub 账号登录
3. 点击 "Add New Project"
4. 导入你的 GitHub 仓库
5. 配置项目：
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. 配置环境变量（Settings → Environment Variables）：
   
```bash
DEEPSEEK_API_KEY=sk-a06db53891fa47298760bcecf916efd7
NEXT_PUBLIC_SUPABASE_URL=你的supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase_key
```

7. 点击 "Deploy"

### 3. 绑定自定义域名（可选）

1. 在 Vercel 项目中，点击 Settings → Domains
2. 添加你的域名
3. Vercel 会给你 DNS 配置：
   ```
   A    @    76.76.21.21
   CNAME www    cname.vercel-dns.com
   ```
4. 在域名注册商的 DNS 设置中添加以上记录
5. 等待 DNS 生效（通常 10-30 分钟）

---

## 💰 设置收款方式

### 方式一：收款码（推荐初期）

#### 微信收款
1. 打开微信 → 我 → 服务 → 收款码
2. 保存收款码图片
3. 在 `src/app/pricing/page.tsx` 中替换

#### 支付宝收款
1. 打开支付宝 → 首页搜索"收款码"
2. 保存收款码图片
3. 在 `src/app/pricing/page.tsx` 中替换

修改方法：
```tsx
// 在 pricing/page.tsx 中找到这部分：
<div className="w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
  <span className="text-gray-400 text-sm">微信收款码</span>
</div>

// 替换为：
<div className="w-40 h-40 rounded-lg overflow-hidden">
  <img src="/wechat-qr.jpg" alt="微信收款码" className="w-full h-full object-cover" />
</div>
```

### 方式二：虎皮椒（自动支付）

1. 注册 https://www.xunhupay.com
2. 创建支付插件
3. 获取支付链接
4. 集成到项目中

---

## 📊 成本预估

| 项目 | 月成本 | 年成本 |
|------|--------|--------|
| Vercel 部署 | ¥0 | ¥0 |
| 域名 | - | ¥50-100 |
| DeepSeek API | ¥0.01/章 | 按量计费 |
| Supabase | ¥0 | ¥0 |
| **总计** | **按量** | **¥50-100** |

---

## 🔐 安全建议

1. **不要提交 API Key 到公开仓库**
   ```bash
   # 确保 .env.local 在 .gitignore 中
   echo ".env.local" >> .gitignore
   ```

2. **限制 API 使用量**
   - 在 DeepSeek 控制台设置每日限额
   - 监控使用量，避免异常消耗

3. **添加使用统计**
   - 记录每日生成次数
   - 追踪付费用户

---

## 📈 推广建议

### 初期（0-100用户）
- 小红书/抖音分享使用体验
- 知乎相关话题回答
- 微信群/朋友圈分享

### 增长期（100-1000用户）
- 写软文推广
- 与相关账号合作
- SEO 优化

### 规模化（1000+用户）
- 付费广告投放
- 社交媒体运营
- 用户推荐奖励

---

## 🆘 常见问题

### Q: 如何查看部署日志？
A: 在 Vercel 项目 → Deployments → 点击具体部署

### Q: 如何回滚版本？
A: 在 Vercel 项目 → Deployments → 找到之前的版本 → 点击 "Promote to Production"

### Q: 如何设置自定义错误页面？
A: 在 `src/app/not-found.tsx` 和 `src/app/error.tsx` 中自定义

### Q: 支付如何自动开通？
A: 需要接入支付平台（虎皮椒/Stripe）的 Webhook
