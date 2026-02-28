import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // 📖 学习点：Electron 插件配置
    // 每个 entry 对应一个 Electron 进程的入口文件
    electron([
      {
        // 📖 主进程入口
        entry: "electron/main.ts",
      },
      {
        // 📖 预加载脚本入口
        entry: "electron/preload.ts",
        onstart(args) {
          // 📖 学习点：preload 脚本更新时不需要重启整个 Electron
          // 只需要刷新渲染进程的页面即可
          args.reload();
        },
      },
    ]),

    // 📖 学习点：vite-plugin-electron-renderer
    // 让渲染进程中也能正确解析 Node.js 的内置模块
    renderer(),
  ],

  // 📖 学习点：Vite 开发代理（Dev Proxy）
  // 和 client 的 vite.config.ts 一样，配置代理把 /api/* 转发到后端
  //
  // 📖 为什么 Electron 也需要代理？
  // vite-plugin-electron 在开发模式下，让 Electron 加载 Vite 开发服务器的 URL
  // （如 http://localhost:5173），所以 /api/* 请求也是发给 Vite 的。
  // 通过代理，Vite 会把这些请求转发到后端服务器（http://localhost:3001）。
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
