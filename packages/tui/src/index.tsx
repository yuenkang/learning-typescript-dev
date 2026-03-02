#!/usr/bin/env node
// ============================================
// 📖 TypeScript 学习笔记：TUI 入口文件
// ============================================
// #!/usr/bin/env node — Shebang 行
// 告诉操作系统用 Node.js 来执行这个脚本。
//
// 📖 学习点：Ink 的 render 函数
// render(<App />) 把 React 组件渲染到终端，
// 就像 ReactDOM.createRoot().render() 渲染到浏览器一样。

// 📖 学习点：dotenv — 加载 .env 环境变量
// Node.js 不像 Vite 那样自动读取 .env 文件，
// 需要手动用 dotenv 来加载。
//
// 📖 坑：dotenv 默认从 process.cwd()（当前工作目录）找 .env，
// 但 npm run dev:tui 是从项目根目录执行的，cwd 不是 packages/tui/。
// 所以需要用 import.meta.url 算出 .env 的绝对路径。
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const currentDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(currentDir, "../.env") });

import React from "react";
import { render } from "ink";
import App from "./app.js";

render(React.createElement(App));
