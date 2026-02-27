// ============================================
// 📖 TypeScript + Electron 学习笔记：主进程（Main Process）
// ============================================
// Electron 应用有两种进程：
//   1. 主进程（Main Process）→ 运行在 Node.js 中，管理窗口和系统交互
//   2. 渲染进程（Renderer Process）→ 运行在 Chromium 中，展示 UI
//
// 📖 学习点：进程隔离
// 主进程可以访问 Node.js API（文件系统、网络等），
// 但渲染进程默认不能访问，需要通过 preload 脚本桥接。

import { app, BrowserWindow, Menu } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

// 📖 学习点：ESM 中获取 __dirname
// ESM 模块没有 __dirname，需要手动从 import.meta.url 转换
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 📖 学习点：生产模式的路径计算
// app.isPackaged 在打包后为 true，此时 __dirname 在 asar 内
// 通过 app.getAppPath() 获取 asar 根路径，再拼接 dist 目录
const DIST = path.join(app.getAppPath(), "dist");

// 📖 学习点：环境变量
// Vite 在开发模式下会通过环境变量传递开发服务器的 URL
// 生产模式下这个变量不存在，所以用 undefined 判断
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

/**
 * 创建主窗口
 *
 * 📖 学习点：BrowserWindow 配置
 * - width/height: 窗口初始大小
 * - webPreferences: 控制渲染进程的能力
 *   - preload: 预加载脚本路径（在渲染进程加载页面前执行）
 *   - nodeIntegration: false → 渲染进程不能直接用 Node.js API（安全）
 *   - contextIsolation: true → 预加载脚本和页面脚本隔离（安全）
 */
function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "📚 书签管理器 - 桌面版",
    // 📖 学习点：macOS 上的圆角标题栏效果
    titleBarStyle: "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true,
      // 📖 学习点：webSecurity
      // 打包后页面从 file:// 加载，<script type="module"> 会被
      // 同源策略阻止。关闭 webSecurity 让 file:// 下的模块加载正常工作。
      // 注意：这在桌面应用中是安全的，因为所有资源都是本地文件。
      webSecurity: !app.isPackaged ? true : false,
    },
  });

  // 📖 学习点：自定义菜单
  // Electron 默认有一套菜单，我们可以自定义
  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: "书签管理器",
      submenu: [
        { role: "about", label: "关于书签管理器" },
        { type: "separator" },
        { role: "quit", label: "退出" },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo", label: "撤销" },
        { role: "redo", label: "重做" },
        { type: "separator" },
        { role: "cut", label: "剪切" },
        { role: "copy", label: "复制" },
        { role: "paste", label: "粘贴" },
        { role: "selectAll", label: "全选" },
      ],
    },
    {
      label: "视图",
      submenu: [
        { role: "reload", label: "刷新" },
        { role: "forceReload", label: "强制刷新" },
        { role: "toggleDevTools", label: "开发者工具" },
        { type: "separator" },
        { role: "resetZoom", label: "重置缩放" },
        { role: "zoomIn", label: "放大" },
        { role: "zoomOut", label: "缩小" },
        { type: "separator" },
        { role: "togglefullscreen", label: "全屏" },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  // 📖 学习点：开发模式 vs 生产模式
  // 开发模式：加载 Vite 开发服务器（支持 HMR 热更新）
  // 生产模式：加载构建后的本地 HTML 文件
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(DIST, "index.html"));
  }
}

// 📖 学习点：Electron 生命周期事件
// app.whenReady() 在 Electron 初始化完成后触发
app.whenReady().then(() => {
  createWindow();

  // 📖 学习点：macOS 的 Dock 行为
  // macOS 上关闭所有窗口后，点击 Dock 图标应该重新打开窗口
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 📖 学习点：跨平台差异
// Windows / Linux 上关闭所有窗口后应退出应用
// macOS 上则保持在后台运行
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
