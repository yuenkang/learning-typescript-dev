// ============================================
// 📖 TypeScript 学习笔记：UI 模块的桶文件
// ============================================
// 📖 学习点：模块化架构
// 把共享的 UI 组件、hooks 集中到一个独立包中，
// 让 client 和 desktop 都可以导入，避免代码重复和循环依赖。
//
// 📖 API 函数从 @bookmark/api 重导出
// 这样现有的 import { fetchBookmarks } from "@bookmark/common-ui" 仍然有效，
// 但实际数据层已经独立到 @bookmark/api 包中。
//
// 使用方式：
// import { BookmarkCard, BookmarkForm, useBookmarks } from "@bookmark/common-ui";
// import { fetchBookmarks } from "@bookmark/api";  // 也可以直接从 api 包导入

// 组件
export { default as BookmarkCard } from "./components/BookmarkCard.tsx";
export { default as BookmarkForm } from "./components/BookmarkForm.tsx";

// Hooks
export { useBookmarks, useTags } from "./hooks/useBookmarks.ts";
export { useDebounce } from "./hooks/useDebounce.ts";

// API 函数（从 @bookmark/api 重导出，保持向后兼容）
export {
  fetchBookmarks,
  fetchBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  fetchTags,
  createTag,
  deleteTag,
} from "@bookmark/api";
