// ============================================
// 📖 TypeScript 学习笔记：API 模块的桶文件
// ============================================
// 📖 学习点：API 层独立成包的好处
// 将 API 请求逻辑从 UI 层中提取出来：
// - @bookmark/api  → 纯数据层（HTTP 请求，无 UI 依赖）
// - @bookmark/common-ui   → 纯展示层（React 组件 + Hooks）
//
// 这样 TUI、Web、Desktop 都能复用同一套 API，
// 不需要各自写一遍，也不会引入不需要的 UI 依赖。

export {
  fetchBookmarks,
  fetchBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  fetchTags,
  createTag,
  deleteTag,
} from "./api.js";
