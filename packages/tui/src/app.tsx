// ============================================
// 📖 TypeScript 学习笔记：Ink 主应用
// ============================================
// 这是 TUI 的核心组件，对比 Web 版的 App.tsx：
//
// | Web 版                | TUI 版                |
// |----------------------|----------------------|
// | 鼠标点击             | 键盘快捷键            |
// | 搜索框 <input>       | TextInput 组件        |
// | 弹窗表单             | 内联编辑模式          |
// | 无限滚动             | 上下箭头导航          |
//
// 📖 学习点：useInput Hook
// Ink 提供的 useInput 用来监听键盘输入，
// 类似 Web 中的 addEventListener('keydown', ...)
// 但更声明式、更 React。

import React, { useState, useEffect, useCallback } from "react";
import { Box, Text, useInput, useApp } from "ink";
import TextInput from "ink-text-input";
import type { BookmarkWithTags, Tag } from "@bookmark/shared";
// 📖 学习点：跨包复用
// TUI 直接使用 @bookmark/api 的 API 函数。
// @bookmark/api 是纯数据层（HTTP 请求），不依赖任何 UI 框架。
// 这样 Web、Desktop、TUI 三端都能复用同一套 API。
import {
  fetchBookmarks,
  fetchTags,
  createBookmark,
  deleteBookmark,
} from "@bookmark/api";
import BookmarkList from "./components/BookmarkList.js";
import BookmarkDetail from "./components/BookmarkDetail.js";

// ============================================
// 📖 TypeScript 学习笔记：联合类型表示应用状态
// ============================================

/**
 * 📖 学习点：字面量联合类型表示"模式"
 *
 * type Mode = 'list' | 'search' | 'add' | 'confirm-delete'
 *
 * 这比用 number 或 boolean 清晰得多：
 * - ❌ const mode = 0   // 0 是什么意思？
 * - ✅ const mode = 'list'  // 一看就懂
 */
type AppMode = "list" | "search" | "add-title" | "add-url" | "confirm-delete";

export default function App() {
  // ---------- 数据状态 ----------
  const [bookmarks, setBookmarks] = useState<BookmarkWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------- UI 状态 ----------
  const [mode, setMode] = useState<AppMode>("list");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { exit } = useApp();

  // ---------- 数据加载 ----------
  const loadBookmarks = useCallback(async (search?: string) => {
    try {
      setError(null);
      const data = await fetchBookmarks(
        search ? { search } : undefined
      );
      setBookmarks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTags = useCallback(async () => {
    try {
      const data = await fetchTags();
      setTags(data);
    } catch {
      // 标签加载失败不阻塞
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
    loadTags();
  }, [loadBookmarks, loadTags]);

  // ---------- 显示临时消息 ----------
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  };

  // ============================================
  // 📖 TypeScript 学习笔记：useInput Hook
  // ============================================
  //
  // useInput((input, key) => { ... })
  // - input: 用户输入的字符（如 'a', 'q'）
  // - key: 特殊键对象 { return, escape, upArrow, downArrow, ... }
  //
  // 📖 对比 Web 版：
  // Web:  onKeyDown={(e) => e.key === 'ArrowUp' && ...}
  // Ink:  useInput((input, key) => key.upArrow && ...)

  useInput((input, key) => {
    // --- 列表模式的键盘操作 ---
    if (mode === "list") {
      // 上下移动
      if (key.upArrow) {
        setSelectedIndex((prev) => Math.max(0, prev - 1));
        return;
      }
      if (key.downArrow) {
        setSelectedIndex((prev) =>
          Math.min(bookmarks.length - 1, prev + 1)
        );
        return;
      }

      // 📖 快捷键映射
      if (input === "q") {
        exit(); // 退出应用
        return;
      }
      if (input === "/") {
        setMode("search");
        setSearchQuery("");
        return;
      }
      if (input === "a") {
        setMode("add-title");
        setNewTitle("");
        setNewUrl("");
        return;
      }
      if (input === "d" && bookmarks.length > 0) {
        setMode("confirm-delete");
        return;
      }
      if (input === "r") {
        setLoading(true);
        loadBookmarks();
        return;
      }
      return;
    }

    // --- 确认删除 ---
    if (mode === "confirm-delete") {
      if (input === "y" || input === "Y") {
        const bookmark = bookmarks[selectedIndex];
        if (bookmark) {
          deleteBookmark(bookmark.id).then(() => {
            setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id));
            setSelectedIndex((prev) => Math.max(0, prev - 1));
            showMessage(`已删除: ${bookmark.title}`);
          });
        }
        setMode("list");
        return;
      }
      setMode("list");
      return;
    }
  });

  // ---------- 搜索提交 ----------
  const handleSearchSubmit = (value: string) => {
    setMode("list");
    if (value.trim()) {
      setLoading(true);
      loadBookmarks(value.trim());
      showMessage(`搜索: "${value.trim()}"`);
    } else {
      setLoading(true);
      loadBookmarks();
    }
  };

  // ---------- 添加书签 ----------
  const handleTitleSubmit = (value: string) => {
    if (!value.trim()) {
      setMode("list");
      return;
    }
    setNewTitle(value.trim());
    setMode("add-url");
  };

  const handleUrlSubmit = (value: string) => {
    if (!value.trim()) {
      setMode("list");
      return;
    }
    setNewUrl(value.trim());
    createBookmark({ title: newTitle, url: value.trim() })
      .then((bookmark: BookmarkWithTags) => {
        setBookmarks((prev) => [bookmark, ...prev]);
        setSelectedIndex(0);
        showMessage(`已添加: ${bookmark.title}`);
      })
      .catch((err: unknown) => {
        showMessage(`添加失败: ${err instanceof Error ? err.message : "未知错误"}`);
      });
    setMode("list");
  };

  // ---------- 选中的书签 ----------
  const selectedBookmark =
    bookmarks.length > 0 ? bookmarks[selectedIndex] ?? null : null;

  // ============================================
  // 渲染
  // ============================================
  return (
    <Box flexDirection="column" padding={1}>
      {/* 标题栏 */}
      <Box marginBottom={1}>
        <Text bold color="cyan">
          📚 书签管理器
        </Text>
        <Text color="gray"> (TUI)</Text>
        {message && (
          <Text color="green"> ✓ {message}</Text>
        )}
      </Box>

      {/* 搜索模式 */}
      {mode === "search" && (
        <Box marginBottom={1}>
          <Text color="yellow">🔍 搜索: </Text>
          <TextInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
          />
        </Box>
      )}

      {/* 添加模式 - 标题 */}
      {mode === "add-title" && (
        <Box marginBottom={1}>
          <Text color="yellow">📝 标题: </Text>
          <TextInput
            value={newTitle}
            onChange={setNewTitle}
            onSubmit={handleTitleSubmit}
          />
        </Box>
      )}

      {/* 添加模式 - URL */}
      {mode === "add-url" && (
        <Box marginBottom={1}>
          <Text color="yellow">🔗 URL: </Text>
          <TextInput
            value={newUrl}
            onChange={setNewUrl}
            onSubmit={handleUrlSubmit}
          />
        </Box>
      )}

      {/* 确认删除 */}
      {mode === "confirm-delete" && selectedBookmark && (
        <Box marginBottom={1}>
          <Text color="red">
            确定删除 "{selectedBookmark.title}"？ (y/n)
          </Text>
        </Box>
      )}

      {/* 主内容区 */}
      {loading ? (
        <Text color="gray">⏳ 加载中...</Text>
      ) : error ? (
        <Box flexDirection="column">
          <Text color="red">❌ {error}</Text>
          <Text color="gray">请确保后端已启动 (npm run dev:server)</Text>
        </Box>
      ) : (
        <Box>
          {/* 左侧：列表 */}
          <Box flexDirection="column" width="50%">
            <BookmarkList
              bookmarks={bookmarks}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
            <Box marginTop={1} paddingX={1}>
              <Text color="gray" dimColor>
                {bookmarks.length} 个书签
              </Text>
            </Box>
          </Box>

          {/* 右侧：详情 */}
          <BookmarkDetail bookmark={selectedBookmark} />
        </Box>
      )}

      {/* 底部快捷键提示 */}
      <Box marginTop={1} gap={2}>
        <Text color="gray" dimColor>
          ↑↓ 导航
        </Text>
        <Text color="gray" dimColor>
          / 搜索
        </Text>
        <Text color="gray" dimColor>
          a 添加
        </Text>
        <Text color="gray" dimColor>
          d 删除
        </Text>
        <Text color="gray" dimColor>
          r 刷新
        </Text>
        <Text color="gray" dimColor>
          q 退出
        </Text>
      </Box>
    </Box>
  );
}
