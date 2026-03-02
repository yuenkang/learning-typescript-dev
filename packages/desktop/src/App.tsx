// ============================================
// 📖 TypeScript + Electron 学习笔记：桌面版主应用
// ============================================
// 📖 学习点：跨包组件复用
// 这个文件和 client 的 App.tsx 结构几乎相同，
// 但直接从 client 包导入组件和 hooks，有效避免代码重复。
//
// 📖 注意事项：
// 1. 组件从 @client/... 路径导入（Vite alias 解析）
// 2. 组件内部的 ../api 导入会被 Vite alias 重定向到桌面版 api.ts
// 3. hooks 同样从 @client 导入，它们内部引用的 api 也会被重定向

import { useState } from "react";
import type { BookmarkWithTags } from "@bookmark/shared";

// 📖 学习点：从共享 UI 包导入
// 组件和 hooks 现在位于独立的 @bookmark/common-ui 包中，
// client 和 desktop 都从这里导入，消除了互相依赖。
import {
  useBookmarks,
  useTags,
  useDebounce,
  BookmarkCard,
  BookmarkForm,
} from "@bookmark/common-ui";

function App() {
  // ---------- UI 状态（和 client 版相同）----------
  const [showForm, setShowForm] = useState(false);
  const [editingBookmark, setEditingBookmark] =
    useState<BookmarkWithTags | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // ---------- 数据状态 ----------
  const {
    bookmarks,
    loading,
    error,
    refresh,
    addBookmark,
    updateBookmarkInList,
    removeBookmark,
  } = useBookmarks({
    search: debouncedSearch,
    tagId: selectedTagId,
  });

  const { tags, addTag } = useTags();

  // ---------- 事件处理 ----------
  const handleSave = (bookmark: BookmarkWithTags) => {
    if (editingBookmark) {
      updateBookmarkInList(bookmark);
    } else {
      addBookmark(bookmark);
    }
    setShowForm(false);
    setEditingBookmark(null);
  };

  const handleEdit = (bookmark: BookmarkWithTags) => {
    setEditingBookmark(bookmark);
    setShowForm(true);
  };

  // ---------- 渲染 ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* 📖 学习点：桌面端标题栏
        * macOS 上使用了 titleBarStyle: 'hiddenInset'，
        * 所以需要一个可拖拽区域来替代系统标题栏。
        * drag-region 类在 index.css 中定义了 -webkit-app-region: drag
        */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between drag-region">
          {/* 📖 macOS 左侧有红绿灯按钮，需要留出空间 */}
          <div className="pl-16">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              📚 书签管理器
              <span className="ml-2 text-xs font-normal text-slate-500">
                桌面版
              </span>
            </h1>
          </div>
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
            <p className="text-red-400/60 text-xs mt-1">
              请确保后端服务已启动（npm run dev:server）
            </p>
            <button
              onClick={refresh}
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
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onEdit={handleEdit}
                onDelete={removeBookmark}
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
          onTagCreated={addTag}
        />
      )}
    </div>
  );
}

export default App;
