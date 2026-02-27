// ============================================
// 📖 TypeScript 学习笔记：UI 模块的桶文件
// ============================================
// 📖 学习点：模块化架构
// 把共享的 UI 组件、hooks、API 集中到一个独立包中，
// 让 client 和 desktop 都可以导入，避免代码重复和循环依赖。
//
// 使用方式：
// import { BookmarkCard, BookmarkForm, useBookmarks } from "@bookmark/ui";

// 组件
export { default as BookmarkCard } from "./components/BookmarkCard.tsx";
export { default as BookmarkForm } from "./components/BookmarkForm.tsx";

// Hooks
export { useBookmarks, useTags } from "./hooks/useBookmarks.ts";
export { useDebounce } from "./hooks/useDebounce.ts";

// API 函数
export {
  fetchBookmarks,
  fetchBookmark,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  fetchTags,
  createTag,
  deleteTag,
} from "./api.ts";
