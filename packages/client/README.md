# 📱 书签管理器 - 前端

基于 **React + TypeScript + Vite + Tailwind CSS** 的前端应用。

## 技术栈

- **React 19** — UI 框架
- **TypeScript** — 类型安全
- **Vite** — 构建工具（极速热更新）
- **Tailwind CSS v4** — 原子化 CSS 框架

## 开发

```bash
# 在项目根目录运行
npm run dev:client
```

前端将在 http://localhost:5173 启动。

## 代理配置

开发模式下，所有 `/api/*` 请求会自动代理到后端 `http://localhost:3001`，详见 `vite.config.ts`。

## 项目结构

```
src/
├── App.tsx         # 主应用组件
├── App.css         # 组件样式（已用 Tailwind 替代）
├── main.tsx        # 应用入口
└── index.css       # 全局样式（Tailwind 引入）
```

## ESLint 配置

如需启用类型感知的 lint 规则，可修改 `eslint.config.js`：

```js
// 将 tseslint.configs.recommended 替换为
tseslint.configs.recommendedTypeChecked
// 或更严格的
tseslint.configs.strictTypeChecked
```
