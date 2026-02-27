# 📚 书签管理器 (Bookmark Manager)

TypeScript 全栈学习项目 — 通过实战掌握 TypeScript + React + Express + Electron。

## 技术栈

| 层     | 技术                        | 说明             |
| ------ | --------------------------- | ---------------- |
| 前端   | React + Vite + Tailwind CSS | 响应式 UI        |
| 桌面端 | Electron + React            | 跨平台桌面应用   |
| 后端   | Express                     | REST API         |
| 数据库 | SQLite (better-sqlite3)     | 轻量嵌入式数据库 |
| 语言   | TypeScript                  | 全栈类型安全     |
| 架构   | npm workspaces monorepo     | 多包共享代码     |

## 快速开始

```bash
# 安装依赖
npm install

# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:server  # 后端 → http://localhost:3001
npm run dev:client  # 前端 → http://localhost:5173
npm run dev:desktop # 桌面端 Electron 应用

# 打包桌面应用（macOS/Windows/Linux）
npm run dist:desktop

# 启动 Storybook 组件工作台
npm run storybook --workspace=packages/client  # → http://localhost:6006
```

## 项目结构

```
├── packages/
│   ├── shared/     # @bookmark/shared  - 前后端共享的类型定义
│   ├── ui/         # @bookmark/ui      - 共享 React 组件、hooks、API
│   ├── server/     # @bookmark/server  - Express 后端 API
│   ├── client/     # @bookmark/client  - React 前端应用
│   └── desktop/    # @bookmark/desktop - Electron 桌面应用
├── package.json    # monorepo 根配置
└── tsconfig.base.json  # 共享 TypeScript 配置
```

## 学习路线

1. ✅ **阶段一：项目搭建** — monorepo、TypeScript 配置、基础类型
2. ✅ **阶段二：后端 API** — Express 路由、SQLite、CRUD 操作
3. ✅ **阶段三：前端页面** — React 组件、状态管理、Tailwind 样式
4. ✅ **阶段四：前后端联调** — API 封装、共享类型、错误处理
5. ✅ **阶段五：桌面应用** — Electron、跨包复用、跨平台打包
6. ⬜ **阶段六：进阶优化** — 认证、搜索、性能优化

📖 详细知识点梳理见 [学习知识地图](docs/learning-knowledge-map.md)
