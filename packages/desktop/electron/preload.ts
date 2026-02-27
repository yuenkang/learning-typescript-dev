// ============================================
// 📖 TypeScript + Electron 学习笔记：预加载脚本（Preload Script）
// ============================================
// 预加载脚本是主进程和渲染进程之间的"桥梁"。
//
// 📖 为什么需要预加载脚本？
// 出于安全考虑，渲染进程不能直接访问 Node.js API。
// 但有时渲染进程需要一些 Node.js 能力（如获取系统信息）。
// 预加载脚本在渲染进程加载页面之前执行，
// 可以通过 contextBridge 安全地向渲染进程暴露有限的 API。
//
// 📖 学习点：contextBridge.exposeInMainWorld
// - 第一个参数：暴露到 window 对象上的属性名
// - 第二个参数：暴露的 API 对象
// 渲染进程可以通过 window.electronAPI 访问这些 API

import { contextBridge } from "electron";

// 📖 学习点：最小权限原则
// 只暴露渲染进程确实需要的 API，不要暴露整个 Node.js
// 这里我们只暴露了版本信息，是安全的
contextBridge.exposeInMainWorld("electronAPI", {
  // 暴露版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  // 平台信息
  platform: process.platform,
});
