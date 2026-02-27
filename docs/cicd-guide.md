# CI/CD 与部署指南

若要使用 GitHub Actions 工作流将应用部署到 Google Cloud Run，您需要配置 Google Cloud 项目和 GitHub 仓库。

## 概览

| 工作流              | 文件          | 触发条件            | 用途                                     |
| ------------------- | ------------- | ------------------- | ---------------------------------------- |
| **CI**              | `ci.yml`      | push / PR 到 master | TypeScript 类型检查 + 构建验证           |
| **Deploy**          | `deploy.yml`  | push 到 master      | 部署 Server + Client 到 Google Cloud Run |
| **Desktop Release** | `release.yml` | push `v*` tag       | 跨平台打包桌面应用 + 创建 GitHub Release |

---

## 1. Google Cloud 设置

### 1.1 创建项目

确保您拥有一个 Google Cloud 项目。请记下您的 **项目 ID (Project ID)**。

### 1.2 启用 API

为您的项目启用必要的 API：

- **Cloud Run API**
- **Artifact Registry API**

### 1.3 创建 Artifact Registry 仓库

在 Artifact Registry 中创建一个 Docker 仓库以存储容器镜像。

```bash
gcloud artifacts repositories create bookmark \
  --repository-format=docker \
  --location=asia-east2 \
  --description="Docker repository for Bookmark Manager"
```

### 1.4 创建服务账号 (Service Account)

创建一个用于 GitHub Actions 部署的服务账号：

1. 前往 **IAM & Admin** > **Service Accounts**。
2. 创建一个新的服务账号（例如 `github-actions-deploy`）。
3. 授予该账号以下角色：
   - **Cloud Run Admin** (用于部署服务)
   - **Artifact Registry Administrator** (用于推送镜像)
   - **Service Account User** (允许作为服务账号运行操作)

### 1.5 生成密钥

1. 点击刚创建的服务账号。
2. 进入 **Keys** 标签页。
3. 点击 **Add Key** > **Create new key** > **JSON**。
4. 密钥文件将下载到您的电脑上。

---

## 2. GitHub 配置

### 2.1 添加 Secrets

前往 GitHub 仓库 > **Settings** > **Secrets and variables** > **Actions** > **Secrets** 标签页 > **New repository secret**。

| Secret 名称      | 说明             | 值                                              |
| :--------------- | :--------------- | :---------------------------------------------- |
| `GCP_PROJECT_ID` | 项目标识         | 您的 Google Cloud 项目 ID                       |
| `GCP_SA_KEY`     | 部署授权         | 您下载的 JSON 密钥文件的完整内容                |
| `API_BASE_URL`   | 桌面应用后端地址 | Cloud Run Server 的 URL（Desktop Release 使用） |

### 2.2 添加 Variables

前往 GitHub 仓库 > **Settings** > **Secrets and variables** > **Actions** > **Variables** 标签页 > **New repository variable**。

| Variable 名称 | 说明     | 默认值               |
| :------------ | :------- | :------------------- |
| `GCP_REGION`  | 部署区域 | `asia-east2`（香港） |

### 2.3 配置手动审批 (GitHub Environments)

为了让部署在执行前需要人工确认：

1. 前往 GitHub 仓库 > **Settings** > **Environments**。
2. 点击 **New environment**，名称填写 `production`。
3. 在 Environment protection rules 下，勾选 **Required reviewers**。
4. 添加您自己或其他需要审批的人员。
5. 点击 **Save protection rules**。

---

## 3. 部署

完成上述配置后，任何推送到 `master` 分支的提交都会自动触发部署工作流：

1. **Server** 先部署到 Cloud Run（Express API）
2. 自动获取 Server 的 Cloud Run URL
3. **Client** 构建时注入 Server URL 作为 `VITE_API_BASE`，然后部署

---

## 4. 域名配置（香港区域）

由于 Google Cloud Run 在香港 (`asia-east2`) 等部分区域**不支持直接的域名映射**功能，您需要配置 **全局外部应用负载均衡器 (Global External Application Load Balancer)** 来绑定自定义域名。

### 步骤概览

1. **预留 IP 地址**：创建一个静态全局 IP 地址。
2. **创建网络端点组 (NEG)**：将 Cloud Run 服务添加为无服务器网络端点组。
3. **创建负载均衡器**：前端配置绑定 IP 和 HTTPS 证书，后端指向 NEG。
4. **配置 DNS**：将域名解析到预留的 IP 地址。

### 详细步骤（推荐使用 Cloud Shell 命令行）

由于控制台 UI 经常变化，**强烈建议**直接在 Google Cloud Console 右上角点击终端图标打开 **Cloud Shell** 运行以下命令：

```bash
# 1. 设置变量（请替换为您的真实域名和服务名）
DOMAIN="api.yourdomain.com"
REGION="asia-east2"
SERVER_SERVICE="bookmark-server"
CLIENT_SERVICE="bookmark-client"

# 2. 预留静态 IP 地址
gcloud compute addresses create bookmark-lb-ip --global

# 查看分配的 IP 地址（请将此 IP 配置到您的 DNS A 记录）
gcloud compute addresses describe bookmark-lb-ip --global --format="get(address)"

# 3. 创建无服务器网络端点组 (NEG) — 以 Server 为例
gcloud compute network-endpoint-groups create bookmark-server-neg \
    --region=$REGION \
    --network-endpoint-type=serverless \
    --cloud-run-service=$SERVER_SERVICE

# 4. 创建负载均衡器组件
# 4.1 创建后端服务
gcloud compute backend-services create bookmark-backend-service --global

# 4.2 将 NEG 添加到后端服务
gcloud compute backend-services add-backend bookmark-backend-service \
    --global \
    --network-endpoint-group=bookmark-server-neg \
    --network-endpoint-group-region=$REGION

# 4.3 创建 URL 映射
gcloud compute url-maps create bookmark-url-map \
    --default-service bookmark-backend-service

# 4.4 创建托管 SSL 证书
gcloud compute ssl-certificates create bookmark-cert \
    --domains $DOMAIN --global

# 4.5 创建 HTTPS 代理
gcloud compute target-https-proxies create bookmark-https-proxy \
    --ssl-certificates=bookmark-cert \
    --url-map=bookmark-url-map

# 4.6 创建转发规则（将 IP 绑定到 HTTPS 代理）
gcloud compute forwarding-rules create bookmark-forwarding-rule \
    --address=bookmark-lb-ip \
    --target-https-proxy=bookmark-https-proxy \
    --global \
    --ports=443
```

### DNS 配置

- 使用步骤 2 中获取的 IP 地址，在域名服务商处添加 **A 记录**。
- **Cloudflare 用户注意**：添加 A 记录时，请务必**关闭代理状态** (Proxy Status)，将云朵图标设置为**灰色 (DNS Only)**。
  - 如果开启代理（橙色云朵），Google 无法验证域名所有权，导致 SSL 证书无法签发。
  - 证书生效（Active）后，可以尝试重新开启代理并设置为 Full (Strict) 模式。
- 等待 SSL 证书状态变为 **ACTIVE**，通常需要 15-60 分钟。
- 查看证书状态：`gcloud compute ssl-certificates list`

---

## 5. Desktop Release

### 触发方式

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 打包平台

| 平台    | 运行器           | 产物                  |
| ------- | ---------------- | --------------------- |
| macOS   | `macos-latest`   | `.dmg` + `.zip`       |
| Windows | `windows-latest` | `.exe`（NSIS 安装器） |
| Linux   | `ubuntu-latest`  | `.AppImage`           |

三个平台通过**矩阵策略**并行构建。打包完成后自动创建 **Draft Release**。

---

## 6. 本地环境变量

```bash
cp packages/desktop/.env.example packages/desktop/.env
# 编辑 VITE_API_BASE=http://localhost:3001
```

> `.env` 已被 `.gitignore` 排除，不会提交到仓库。

**优先级**：`VITE_API_BASE 环境变量` > `file:// 默认值` > `空（Vite dev proxy）`

---

## 7. 日志查看

在 Cloud Run 环境中，系统会自动捕获程序输出到 `stdout` 和 `stderr` 的所有内容。

1. 进入 [Google Cloud Console](https://console.cloud.google.com/run)。
2. 点击服务名称（`bookmark-server` 或 `bookmark-client`）。
3. 点击 **Logs (日志)** 标签页。

> [!TIP]
> 生产环境建议通过标准输出记录日志，这样可以利用云端日志系统的搜索、过滤和导出功能，且不会占用容器内存。
