# ============================================
# 📖 学习点：多阶段 Docker 构建（Multi-stage Build）
# ============================================
# 分为两个阶段：
#   1. build 阶段：安装全部依赖
#   2. production 阶段：只安装生产依赖 + 复制源码
# 这样最终镜像更小、更安全

# ---------- 第一阶段：构建 ----------
FROM node:22-alpine AS build

WORKDIR /app

# 📖 学习点：先复制 package 文件再安装依赖
# 利用 Docker 缓存层：只要 package.json 没变，
# npm ci 这一层就会用缓存，不需要重新安装
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/

RUN npm ci --workspace=packages/shared --workspace=packages/server

# ---------- 第二阶段：运行 ----------
FROM node:22-alpine AS production

WORKDIR /app

# 📖 学习点：只复制生产依赖（tsx 已移至 dependencies）
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/

RUN npm ci --workspace=packages/shared --workspace=packages/server --omit=dev

# 复制源码
COPY packages/shared/ packages/shared/
COPY packages/server/ packages/server/

# 📖 创建数据目录（SQLite 数据库存储位置）
RUN mkdir -p packages/server/data

# 📖 学习点：Cloud Run 要求监听 PORT 环境变量
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# 📖 使用 tsx 直接运行 TypeScript（tsx 已在 dependencies 中）
CMD ["npx", "tsx", "packages/server/src/index.ts"]
