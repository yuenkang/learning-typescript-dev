// ============================================
// 📖 TypeScript + React 学习笔记：主应用组件
// ============================================
// App 是整个前端应用的"根组件"。
// 它负责：
// 1. 管理全局状态（书签列表、标签列表）
// 2. 组合子组件（BookmarkCard、BookmarkForm）
// 3. 处理搜索和筛选逻辑

import { useState, useEffect, useCallback } from "react";
import type { BookmarkWithTags, Tag } from "@bookmark/shared";
import * as api from "./api";
import BookmarkCard from "./components/BookmarkCard";
import BookmarkForm from "./components/BookmarkForm";

// ============================================
// 📖 TypeScript 学习笔记：组件状态设计
// ============================================
// 一个好的状态设计原则：
// 1. 把"数据源"放在最上层组件
// 2. 通过 Props 传给子组件
// 3. 子组件通过回调函数通知上层组件更新数据
// 这就是 React 的"单向数据流"模式。

function App() {
  // ---------- 数据状态 ----------
  const [bookmarks, setBookmarks] = useState<BookmarkWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- UI 状态 ----------
  const [showForm, setShowForm] = useState(false);
  const [editingBookmark, setEditingBookmark] =
    useState<BookmarkWithTags | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  // ============================================
  // 📖 TypeScript 学习笔记：useCallback
  // ============================================
  /**
   * 📖 学习点：useCallback 的作用
   * useCallback 缓存函数引用，避免每次渲染都创建新函数。
   * 这在把函数作为 Props 传给子组件时特别有用，
   * 可以避免子组件不必要的重新渲染。
   *
   * 📖 学习点：依赖数组
   * [searchQuery, selectedTagId] 表示只有这两个值变化时才生成新函数
   */
  const loadBookmarks = useCallback(async () => {
    try {
      setError(null);
      const data = await api.fetchBookmarks({
        search: searchQuery || undefined,
        tagId: selectedTagId ?? undefined,
      });
      setBookmarks(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedTagId]);

  const loadTags = useCallback(async () => {
    try {
      const data = await api.fetchTags();
      setTags(data);
    } catch (err) {
      console.error("加载标签失败:", err);
    }
  }, []);

  // 📖 学习点：多个 useEffect
  // 不同的副作用用不同的 useEffect 分开管理
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // ============================================
  // 回调函数（传给子组件）
  // ============================================

  const handleSave = (bookmark: BookmarkWithTags) => {
    if (editingBookmark) {
      // 📖 学习点：不可变更新（Immutable Update）
      // 用 map 创建新数组，不直接修改原数组
      // 这是 React 状态更新的核心原则
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmark.id ? bookmark : b))
      );
    } else {
      // 新建：添加到列表最前面
      setBookmarks((prev) => [bookmark, ...prev]);
    }
    setShowForm(false);
    setEditingBookmark(null);
  };

  const handleEdit = (bookmark: BookmarkWithTags) => {
    setEditingBookmark(bookmark);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    // 📖 学习点：filter 过滤
    // 返回一个不包含被删除项的新数组
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleTagCreated = (tag: Tag) => {
    setTags((prev) => [...prev, tag]);
  };

  // ============================================
  // 渲染
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            📚 书签管理器
          </h1>
          <button
            onClick={() => {
              setEditingBookmark(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-purple-900/30"
          >
            ＋ 添加书签
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 搜索和筛选栏 */}
        <div className="mb-6 space-y-3">
          {/* 搜索框 */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索书签..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* 标签筛选 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTagId(null)}
                className={`px-3 py-1 text-sm rounded-full transition-all ${selectedTagId === null
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
              >
                全部
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() =>
                    setSelectedTagId(
                      selectedTagId === tag.id ? null : tag.id
                    )
                  }
                  className={`px-3 py-1 text-sm rounded-full transition-all ${selectedTagId === tag.id
                      ? "text-white ring-1"
                      : "text-slate-400 hover:text-white"
                    }`}
                  style={{
                    backgroundColor:
                      selectedTagId === tag.id
                        ? `${tag.color ?? "#6366f1"}44`
                        : "rgba(255,255,255,0.05)",
                    borderColor:
                      selectedTagId === tag.id
                        ? tag.color ?? "#6366f1"
                        : "transparent",
                    borderWidth: "1px",
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 内容区域 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
            <p className="text-red-300 font-medium mb-2">加载失败</p>
            <p className="text-red-400/80 text-sm">{error}</p>
            <button
              onClick={loadBookmarks}
              className="mt-3 px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-slate-400 text-lg">
              {searchQuery || selectedTagId
                ? "没有找到匹配的书签"
                : "还没有书签，点击右上角添加一个吧！"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {/* 📖 学习点：列表渲染和 key
                React 用 key 来追踪每个列表项。
                key 必须是唯一且稳定的值（通常用数据库 ID）。
                没有 key 或用 index 作为 key 会导致渲染问题。
            */}
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={handleEdit}
                onDelete={handleDelete}
                allTags={tags}
              />
            ))}
          </div>
        )}
      </main>

      {/* 书签表单弹窗 */}
      {showForm && (
        <BookmarkForm
          editingBookmark={editingBookmark}
          allTags={tags}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingBookmark(null);
          }}
          onTagCreated={handleTagCreated}
        />
      )}
    </div>
  );
}

export default App;
