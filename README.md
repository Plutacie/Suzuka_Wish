# 心愿站（xuyuan）

Next.js 心愿收集页：姓名 + 两个心愿 → 烟花 → 黑底红字「那么代价是什么？」→ 可继续填写；管理端查看全部记录。

## 本地开发

```bash
npm install
npm run dev
```

未配置 Redis 时，数据会写入项目目录下的 `.data/submissions.json`（已加入 `.gitignore`），便于本地试用。

## 部署到 Vercel（Git）

1. 在 Git 托管（GitHub / GitLab 等）创建仓库，将本目录推上去。
2. 打开 [Vercel](https://vercel.com)，Import 该仓库，框架选 Next.js。
3. 在 Vercel 项目 **Storage / Marketplace** 中为项目添加 **Upstash Redis**（或同类 Redis 集成），确保环境变量中存在：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. 在 Vercel **Environment Variables** 中新增：
   - `ADMIN_SECRET`：一串足够长的随机字符串，用于管理后台鉴权。
5. 重新 Deploy。

## 使用说明

- 访客首页：`/`
- 代价页：提交心愿后自动跳转 `/cost?id=...`
- 管理页：`/admin`（页面上**没有公开链接**）  
  - **入口**：在首页 **2.5 秒内连点标题「心愿」五次**，会跳转到管理页。  
  - 进入后须输入 `ADMIN_SECRET`；也可直接访问 `/admin?key=你的密钥` 自动拉取（勿把含密钥的链接发给他人）。

## 环境变量摘要

参见仓库根目录 `.env.example`。
