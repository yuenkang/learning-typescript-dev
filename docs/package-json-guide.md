# 📖 package.json 配置说明

本项目包含 4 个 `package.json` 文件。由于 JSON 格式不支持注释，这里统一说明各字段的含义。

---

## 根目录 `package.json`

```jsonc
{
  "name": "bookmark-manager",     // 项目名称
  "version": "1.0.0",             // 版本号（语义化版本：主版本.次版本.补丁）
  "private": true,                // 私有项目，禁止意外发布到 npm
  "description": "...",           // 项目描述

  // 📖 workspaces（工作空间）— npm monorepo 的核心配置
  // "packages/*" 表示 packages/ 下的每个子目录都是一个独立的包
  // npm 会自动把它们链接在一起，不需要手动 npm link
  "workspaces": ["packages/*"],

  "scripts": {
    // & 符号：同时运行多个命令（并行）
    "dev": "npm run dev --workspace=packages/server & npm run dev --workspace=packages/client",
    // --workspace= 指定在哪个子包中运行命令
    "dev:server": "npm run dev --workspace=packages/server",
    "dev:client": "npm run dev --workspace=packages/client"
  }
}
```

---

## `packages/shared/package.json`

```jsonc
{
  "name": "@bookmark/shared",    // 📖 @scope/name 格式，@ 后面是"作用域"
  "version": "1.0.0",
  "private": true,

  // 📖 main 和 types：告诉其他包从哪里导入
  // 当代码写 import { Bookmark } from '@bookmark/shared' 时，
  // Node.js 会去 main 指定的文件找运行时代码
  // TypeScript 会去 types 指定的文件找类型声明
  "main": "./src/index.ts",      // 入口文件（运行时）
  "types": "./src/index.ts"      // 类型声明入口（编译时）
}
```

---

## `packages/server/package.json`

```jsonc
{
  "name": "@bookmark/server",
  "version": "1.0.0",
  "private": true,

  // 📖 "type": "module" — 使用 ES Module 模块系统
  // 这样就能用 import/export 语法（而不是旧的 require/module.exports）
  "type": "module",

  "scripts": {
    // 📖 tsx watch: 直接运行 TS 文件 + 热重载
    // tsx 是一个工具，让你不用先编译就能运行 TypeScript
    // watch 模式会监听文件变化，修改代码后自动重启
    "dev": "tsx watch src/index.ts",

    // tsc: TypeScript 编译器，将 TS 编译成 JS
    "build": "tsc",

    // 运行编译后的 JS 文件（生产环境用）
    "start": "node dist/index.js"
  },

  // 📖 dependencies vs devDependencies
  // dependencies: 运行时需要的包（生产环境要用）
  "dependencies": {
    "@bookmark/shared": "*",       // 共享类型包（* 表示使用本地 workspace 版本）
    "express": "^5.1.0",           // Web 框架
    "cors": "^2.8.5",             // 跨域支持中间件
    "better-sqlite3": "^11.8.1"   // SQLite 数据库驱动
  },

  // devDependencies: 开发时需要的包（不会进入生产环境）
  "devDependencies": {
    "@types/express": "^5.0.2",          // Express 的类型声明
    "@types/cors": "^2.8.17",            // cors 的类型声明
    "@types/better-sqlite3": "^7.6.12",  // better-sqlite3 的类型声明
    "tsx": "^4.19.3",                    // 直接运行 TS 文件的工具
    "typescript": "^5.7.3"               // TypeScript 编译器
  }
  // 📖 @types/* 包的作用：
  // 很多 npm 包是用 JS 写的，没有类型信息。
  // @types/xxx 是社区维护的类型声明文件，装上后 TS 就知道这些包的类型了。
  // 版本号前缀 "^" 表示兼容该主版本的最新版（如 ^5.0.2 可升级到 5.x.x）
}
```

---

## `packages/client/package.json`

```jsonc
{
  "name": "@bookmark/client",
  "version": "1.0.0",
  "private": true,
  "type": "module",

  "scripts": {
    "dev": "vite",                     // 启动 Vite 开发服务器（热更新）
    "build": "tsc -b && vite build",   // 先类型检查，再打包（生产构建）
    "lint": "eslint .",                // 运行 ESLint 代码检查
    "preview": "vite preview"          // 预览生产构建结果
  },

  "dependencies": {
    "@bookmark/shared": "*",     // 共享类型
    "react": "^19.2.0",         // React UI 框架
    "react-dom": "^19.2.0"      // React DOM 渲染器（浏览器端）
  },

  "devDependencies": {
    // --- ESLint 相关 ---
    "@eslint/js": "^9.39.1",                    // ESLint 核心 JS 规则
    "eslint": "^9.39.1",                        // ESLint 代码检查工具
    "eslint-plugin-react-hooks": "^7.0.1",      // React Hooks 规则检查
    "eslint-plugin-react-refresh": "^0.4.24",   // React 热更新兼容性检查
    "typescript-eslint": "^8.48.0",             // TypeScript ESLint 插件

    // --- Tailwind CSS ---
    "@tailwindcss/vite": "^4.2.0",   // Tailwind CSS 的 Vite 插件
    "tailwindcss": "^4.2.0",         // Tailwind CSS 框架

    // --- 类型声明 ---
    "@types/node": "^24.10.1",       // Node.js 类型（给 vite.config.ts 用）
    "@types/react": "^19.2.7",       // React 类型
    "@types/react-dom": "^19.2.3",   // React DOM 类型

    // --- 构建工具 ---
    "@vitejs/plugin-react": "^5.1.1",  // Vite 的 React 插件（JSX 编译等）
    "globals": "^16.5.0",              // 全局变量定义（给 ESLint 用）
    "typescript": "~5.9.3",            // TypeScript 编译器
    "vite": "^7.3.1"                   // Vite 构建工具
  }
  // 📖 版本号前缀区别：
  //   "^5.9.3" — 兼容主版本（可升级到 5.x.x 的最新版）
  //   "~5.9.3" — 兼容次版本（只升级到 5.9.x 的最新版，更保守）
  //   "*"      — 任意版本（在 workspaces 中表示使用本地包）
}
```
