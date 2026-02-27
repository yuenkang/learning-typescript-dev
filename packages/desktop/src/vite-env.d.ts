/// <reference types="vite/client" />

// 📖 学习点：模块声明（Module Declaration）
// TypeScript 默认不知道如何处理 .css 文件的导入。
// 通过声明 *.css 模块，告诉 TS "这种导入是合法的"。
// 实际的 CSS 处理由 Vite 在运行时完成。

declare module "*.css" {}

// 📖 学习点：Electron API 类型声明
// preload.ts 通过 contextBridge 暴露了 electronAPI 到 window 对象上，
// 但 TypeScript 不知道 window.electronAPI 的类型。
// 通过扩展 Window 接口来添加类型支持。
interface ElectronAPI {
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  platform: string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
