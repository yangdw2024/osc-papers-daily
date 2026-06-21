# OSC Papers Daily - 部署指南（国内可用版）

> 使用 Supabase 替代 Vercel KV，国内可直接访问，无需翻墙。

## 一、项目目录结构

```
osc-papers-daily/
├── app/
│   ├── api/
│   │   ├── fetch-papers/      # 每日抓取任务 API
│   │   │   └── route.ts
│   │   ├── get-papers/        # 获取论文列表 API
│   │   │   └── route.ts
│   │   ├── get-tags/          # 获取标签列表 API
│   │   │   └── route.ts
│   │   └── health/            # 健康检查 API
│   │       └── route.ts
│   ├── about/                 # 关于页面
│   │   └── page.tsx
│   ├── papers/                # 文献列表页面
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # 首页
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── PaperCard.tsx
│   └── TagFilter.tsx
├── lib/
│   ├── db.ts                  # Supabase 数据库操作（替代 kv.ts）
│   ├── fetchers.ts            # 数据抓取逻辑
│   ├── keywords.ts            # 关键词和标签规则
│   └── utils.ts               # 工具函数
├── types/
│   └── paper.ts
├── supabase-init.sql          # 数据库初始化 SQL（重要！）
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.mjs
├── vercel.json                # Vercel Cron 配置
├── .env.example               # 环境变量模板
└── DEPLOY.md                  # 本文件
```

## 二、部署步骤（共4步）

### 第1步：注册 Supabase（免费，国内可访问）

1. 打开 [https://supabase.com](https://supabase.com)，点击 **Start your project**
2. 用 GitHub 账号登录
3. 点击 **New Project**，填写：
   - Name: `osc-papers`
   - Database Password: 自己设一个密码（记住它）
   - Region: 选 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**（离中国近，速度快）
4. 点击 **Create new project**，等待创建完成（约2分钟）

### 第2步：初始化数据库表

1. 在 Supabase 项目页面，点击左侧 **SQL Editor**
2. 点击 **New query**
3. 把 `supabase-init.sql` 文件的全部内容复制粘贴进去
4. 点击 **Run** 执行
5. 看到 "Success" 就说明表创建成功了

### 第3步：获取 API 密钥

1. 在 Supabase 项目页面，点击左侧 **Settings**（齿轮图标）
2. 点击 **API**
3. 记下以下3个值：
   - **Project URL**（类似 `https://xxxxx.supabase.co`）
   - **anon public**（anon 公钥，很长的一串）
   - **service_role**（service_role 私钥，点击 Reveal 显示）

### 第4步：部署到 Vercel

#### 4.1 上传代码到 GitHub

1. 在 GitHub 创建新仓库 `osc-papers-daily`
2. 把项目所有文件上传到仓库

#### 4.2 在 Vercel 部署

1. 打开 [https://vercel.com](https://vercel.com)，用 GitHub 登录
2. 点击 **Add New Project**，选择 `osc-papers-daily` 仓库
3. 框架选 **Next.js**，点击 **Deploy**

#### 4.3 配置环境变量

部署完成后，在 Vercel 项目中：

1. 进入 **Settings** -> **Environment Variables**
2. 添加以下3个变量：

| 变量名 | 值 | 从哪里来 |
|--------|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Settings -> API -> Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase Settings -> API -> anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase Settings -> API -> service_role |

3. 添加后点击 **Save**
4. 进入 **Deployments** 标签，点击 **Redeploy** 让环境变量生效

### 第5步：验证

1. 打开你的 Vercel 域名（类似 `osc-papers-daily.vercel.app`）
2. 应该能看到首页（暂无数据）
3. 在浏览器访问 `https://你的域名/api/fetch-papers` 触发首次抓取
4. 等待约30秒后刷新首页，应该能看到论文了

## 三、定时任务

项目已配置 Vercel Cron，每天 UTC 0 点（北京时间早8点）自动抓取。

在 Vercel Dashboard -> **Cron Jobs** 中可以查看执行记录。

## 四、本地开发

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量模板
cp .env.example .env.local

# 3. 编辑 .env.local，填入 Supabase 的3个密钥

# 4. 启动开发服务器
npm run dev

# 5. 打开 http://localhost:3000
```

## 五、扩展关键词到全光伏领域

编辑 `lib/keywords.ts`，在 `KEYWORDS` 数组中添加新关键词即可：

```typescript
export const KEYWORDS = [
  // 有机光伏（原有）
  "organic solar cell",
  "organic photovoltaics",
  "OPV",
  "non-fullerene acceptor",
  "bulk heterojunction",
  "polymer solar cell",
  "organic photodetector",

  // 钙钛矿光伏（新增）
  "perovskite solar cell",
  "perovskite photovoltaics",
  "tandem perovskite",

  // 硅基光伏（新增）
  "silicon solar cell",
  "TOPCon",
  "HJT solar cell",

  // 其他...
];
```

同时在 `TAG_RULES` 中添加对应标签规则。修改后重新部署即可。

## 六、常见问题

### Q: Supabase 免费额度够用吗？
A: 免费计划提供 500MB 数据库 + 5GB 带宽，对于每日抓取论文完全够用。

### Q: Vercel 访问不了怎么办？
A: Vercel 在国内偶尔不稳定，但部署后网站域名通常可以正常访问。如果完全不行，可以考虑用 Cloudflare Pages 替代部署。

### Q: 首次抓取没有数据？
A: arXiv API 和 Semantic Scholar API 需要从国外服务器访问。Vercel 的服务器在国外，所以 API 调用没问题。如果手动触发后仍无数据，检查 Vercel 函数日志看是否有报错。

### Q: 如何修改抓取频率？
A: 编辑 `vercel.json` 中的 cron 表达式。例如改为每12小时：`"0 */12 * * *"`
