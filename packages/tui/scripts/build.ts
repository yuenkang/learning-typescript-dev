// ============================================
// 📖 TypeScript 学习笔记：esbuild 打包配置
// ============================================
// esbuild 是一个极快的 JavaScript 打包器。
//
// 📖 tsc vs esbuild 的区别：
// - tsc：只做类型检查 + 转译（.ts → .js），不打包依赖
//   输出的 .js 仍然需要 node_modules 才能运行
// - esbuild：把所有代码和依赖打包成单个文件
//   输出的文件可以直接用 node 运行，不需要 node_modules

import { build } from "esbuild";
import type { Plugin } from "esbuild";

// 📖 学习点：esbuild 插件
// 插件可以拦截 import 请求，替换模块内容。
// react-devtools-core 是 ink 的可选开发依赖，替换为空模块。
const emptyModulePlugin: Plugin = {
  name: "empty-externals",
  setup(build) {
    build.onResolve({ filter: /^react-devtools-core$/ }, () => ({
      path: "react-devtools-core",
      namespace: "empty",
    }));
    build.onLoad({ filter: /.*/, namespace: "empty" }, () => ({
      contents: "export default {}",
      loader: "js",
    }));
  },
};

await build({
  entryPoints: ["src/index.tsx"],
  bundle: true,
  outfile: "dist/bookmark-tui.mjs",

  // 📖 学习点：platform 和 format
  // platform: 'node' → Node.js 程序，不打包内置模块
  // format: 'esm'    → ES Module 格式（ink 使用 top-level await）
  platform: "node",
  format: "esm",
  target: "node18",

  jsx: "automatic",
  plugins: [emptyModulePlugin],

  // 📖 学习点：CJS/ESM 混合打包
  // ink 的部分依赖（如 signal-exit）使用 CommonJS 的 require()。
  // ESM 模块中没有 require 函数，所以 esbuild 会生成一个 shimRequire，
  // 但它不支持 Node.js 内置模块（assert, fs 等）。
  // 解决方案：在文件开头用 createRequire 创建一个真正的 require 函数。
  banner: {
    js: `
import { createRequire as __createRequire } from 'module';
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirname_fn } from 'path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_fn(__filename);
`.trim(),
  },

  sourcemap: true,
});

console.log("✅ TUI 打包完成 → dist/bookmark-tui.mjs");
