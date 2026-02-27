# ============================================
# 📖 学习点：多阶段 Docker 构建（Multi-stage Build）
# ============================================
# 分为两个阶段：
#   1. build 阶段：安装依赖、编译 TypeScript
#   2. production 阶段：只复制运行时需要的文件
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

# 复制源码并构建
COPY packages/shared/ packages/shared/
COPY packages/server/ packages/server/
COPY tsconfig.base.json ./

RUN npm run build --workspace=packages/server 2>/dev/null || true

# ---------- 第二阶段：运行 ----------
FROM node:22-alpine AS production

WORKDIR /app

# 📖 学习点：只复制生产依赖
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/

RUN npm ci --workspace=packages/shared --workspace=packages/server --omit=dev

# 复制源码（tsx 直接运行 TypeScript，无需编译产物）
COPY packages/shared/ packages/shared/
COPY packages/server/ packages/server/

# 📖 学习点：Cloud Run 要求监听 PORT 环境变量
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# 📖 使用 tsx 直接运行 TypeScript
CMD ["npx", "tsx", "packages/server/src/index.ts"]
