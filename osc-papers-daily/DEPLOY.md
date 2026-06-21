# OSC Papers Daily - 部署指南

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
│   ├── globals.css            # 全局样式
│   ├── layout.tsx             # 根布局
│   └── page.tsx               # 首页
├── components/
│   ├── Navbar.tsx             # 导航栏
│   ├── Footer.tsx             # 页脚
│   ├── PaperCard.tsx          # 论文卡片
│   └── TagFilter.tsx          # 标签筛选器
├── lib/
│   ├── fetchers.ts            # 数据抓取逻辑
│   ├── keywords.ts            # 关键词和标签规则
│   ├── kv.ts                  # Vercel KV 操作
│   └── utils.ts               # 工具函数
├── types/
│   └── paper.ts               # 类型定义
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.mjs
└── vercel.json                # Vercel Cron 配置
```

## 二、部署步骤

### 1. 创建 GitHub 仓库

```bash
# 在项目根目录初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: OSC Papers Daily"

# 在 GitHub 创建新仓库，然后推送
git remote add origin https://github.com/YOUR_USERNAME/osc-papers-daily.git
git branch -M main
git push -u origin main
```

### 2. 配置 Vercel KV

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入项目设置 -> Storage -> Connect Store
3. 选择 "KV" 类型，创建新的 KV 数据库
4. 连接 KV 数据库到你的项目

### 3. 配置环境变量

在 Vercel Dashboard -> Project Settings -> Environment Variables 中添加：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `KV_URL` | Vercel KV URL | 自动填充 |
| `KV_REST_API_URL` | Vercel KV REST API URL | 自动填充 |
| `KV_REST_API_TOKEN` | Vercel KV REST API Token | 自动填充 |
| `KV_REST_API_READ_ONLY_TOKEN` | Vercel KV 只读 Token | 自动填充 |
| `CRON_SECRET` | Cron 任务密钥（可选） | 任意随机字符串 |

> 连接 KV 数据库后，前 4 个变量会自动添加到环境变量中。

### 4. 部署到 Vercel

#### 方式一：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

#### 方式二：通过 GitHub 集成

1. 在 Vercel Dashboard 点击 "Add New Project"
2. 选择你的 GitHub 仓库 `osc-papers-daily`
3. 框架预设选择 "Next.js"
4. 点击 "Deploy"

### 5. 验证 Cron 任务

部署完成后，在 Vercel Dashboard -> Project -> Settings -> Cron Jobs 中确认：

- 路径: `/api/fetch-papers`
- 频率: `0 0 * * *` (每日 UTC 0 点)

### 6. 手动触发首次抓取

```bash
# 使用 curl 手动触发（替换为你的域名）
curl https://your-domain.vercel.app/api/fetch-papers

# 如果设置了 CRON_SECRET
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.vercel.app/api/fetch-papers
```

## 三、扩展关键词到全光伏领域

要修改关键词扩展到全光伏领域，只需编辑 `lib/keywords.ts` 文件：

### 修改关键词列表

```typescript
// lib/keywords.ts

export const KEYWORDS = [
  // 有机光伏 (原有)
  "organic solar cell",
  "organic photovoltaics",
  "OSC",
  "OPV",
  "non-fullerene acceptor",
  "bulk heterojunction",
  "polymer solar cell",
  "organic photodetector",

  // 钙钛矿光伏 (新增)
  "perovskite solar cell",
  "perovskite photovoltaics",
  "PSC",
  "tandem perovskite",
  "perovskite stability",

  // 硅基光伏 (新增)
  "silicon solar cell",
  "crystalline silicon",
  "passivated contact",
  "TOPCon",
  "HJT",
  "IBC",

  // 薄膜光伏 (新增)
  "thin film solar cell",
  "CIGS",
  "CdTe",
  "amorphous silicon",

  // 新型光伏 (新增)
  "quantum dot solar cell",
  "dye-sensitized solar cell",
  "DSSC",
  "thermophotovoltaic",
  "space solar cell",
];
```

### 修改标签规则

```typescript
// lib/keywords.ts

export const TAG_RULES: Record<string, string[]> = {
  // 有机光伏 (原有)
  "非富勒烯受体": ["non-fullerene acceptor", "nfa", "acceptor", "y6", "itic"],
  "本体异质结": ["bulk heterojunction", "bhj", "morphology", "blend"],

  // 钙钛矿光伏 (新增)
  "钙钛矿电池": ["perovskite solar", "perovskite photovoltaic", "PSC"],
  "钙钛矿稳定性": ["perovskite stability", "degradation", "encapsulation"],
  "钙钛矿-硅叠层": ["tandem perovskite", "perovskite silicon", "2T", "4T"],

  // 硅基光伏 (新增)
  "晶体硅电池": ["crystalline silicon", "c-Si", "silicon wafer"],
  "钝化接触": ["passivated contact", "TOPCon", "tunnel oxide"],
  "异质结电池": ["HJT", "heterojunction", "amorphous silicon/c-Si"],

  // 薄膜光伏 (新增)
  "CIGS电池": ["CIGS", "CuInGaSe", "chalcopyrite"],
  "CdTe电池": ["CdTe", "cadmium telluride"],

  // 通用标签
  "器件物理": ["charge transport", "recombination", "mobility", "energy level"],
  "新型材料": ["novel material", "synthesis", "design"],
  "稳定性": ["stability", "degradation", "lifetime"],
  "大面积制备": ["large area", "roll-to-roll", "scalable"],
};
```

### 重新部署

修改后提交并重新部署：

```bash
git add lib/keywords.ts
git commit -m "feat: extend keywords to full photovoltaic field"
git push origin main
```

Vercel 会自动重新部署。

## 四、本地开发

```bash
# 安装依赖
npm install

# 配置本地环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 Vercel KV 连接信息

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 本地环境变量示例 (.env.local)

```
KV_URL=redis://default:xxxx@xxxx.kv.vercel-storage.com:xxxx
KV_REST_API_URL=https://xxxx.kv.vercel-storage.com
KV_REST_API_TOKEN=xxxx
KV_REST_API_READ_ONLY_TOKEN=xxxx
CRON_SECRET=your-secret-key
```

## 五、常见问题

### Q: 为什么首次部署后没有数据？
A: 数据需要等待 Cron 任务首次执行，或手动调用 `/api/fetch-papers` 触发。

### Q: 如何测试抓取功能？
A: 在本地运行 `curl http://localhost:3000/api/fetch-papers`，或在浏览器中访问该 URL。

### Q: Vercel KV 免费额度是多少？
A: Vercel KV Hobby 计划每月提供 30,000 次命令执行，对于本项目通常足够使用。

### Q: 如何修改抓取频率？
A: 编辑 `vercel.json` 中的 `schedule` 字段，使用标准 cron 表达式。
