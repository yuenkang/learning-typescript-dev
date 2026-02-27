# ============================================
# 📖 学习点：静态网站的 Docker 部署
# ============================================
# 用 Node 构建 Vite 项目，然后用 Nginx 托管静态文件

# ---------- 第一阶段：构建 ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/ui/package.json packages/ui/
COPY packages/client/package.json packages/client/

RUN npm ci --workspace=packages/shared --workspace=packages/ui --workspace=packages/client

COPY packages/shared/ packages/shared/
COPY packages/ui/ packages/ui/
COPY packages/client/ packages/client/
COPY tsconfig.base.json ./

# 📖 学习点：构建时注入环境变量
# ARG 接收 docker build --build-arg 传入的值
# 然后设为环境变量，Vite 构建时会静态替换到代码中
ARG VITE_API_BASE
ENV VITE_API_BASE=$VITE_API_BASE

RUN npm run build --workspace=packages/client

# ---------- 第二阶段：Nginx 托管 ----------
FROM nginx:alpine AS production

# 📖 学习点：Nginx 配置
# SPA 应用需要把所有路由都指向 index.html
COPY packages/client/nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物到 Nginx 默认目录
COPY --from=build /app/packages/client/dist /usr/share/nginx/html

# 📖 Cloud Run 要求监听 PORT 环境变量
# Nginx 默认 80，通过 envsubst 动态替换
ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "sed -i \"s/listen 80/listen $PORT/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
