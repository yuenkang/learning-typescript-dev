// ============================================
// 📖 TypeScript + Electron 学习笔记：渲染进程入口
// ============================================
// 📖 学习点：渲染进程和普通 Web 应用的入口完全一样
// React 代码运行在 Electron 的 Chromium 浏览器中，
// 所以写法和 client 的 main.tsx 几乎相同。

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
