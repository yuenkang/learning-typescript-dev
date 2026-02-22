// ============================================
// 📖 TypeScript 学习笔记：自定义 Hook（Custom Hook）
// ============================================
// 自定义 Hook 是 React 中复用逻辑的核心方式。
//
// 📖 什么是 Hook？
// Hook 是以 "use" 开头的函数，可以在内部使用其他 Hook（如 useState）。
// 它把"状态 + 副作用 + 逻辑"打包成一个可复用的单元。
//
// 📖 为什么要自定义 Hook？
// 看看 App.tsx 中的书签数据加载逻辑：
// - useState 定义状态（bookmarks, loading, error）
// - useEffect 加载数据
// - useCallback 缓存加载函数
// - 各种回调函数（增删改查）
// 这些逻辑全堆在 App 组件里，让组件变得很臃肿。
// 自定义 Hook 可以把这些逻辑提取出来，让组件只关注 UI。

import { useState, useEffect, useCallback } from "react";
import type { BookmarkWithTags, Tag } from "@bookmark/shared";
import * as api from "../api";

// ============================================
// 📖 TypeScript 学习笔记：Hook 的返回值类型
// ============================================

/**
 * useBookmarks Hook 的返回值类型
 *
 * 📖 学习点：接口定义 Hook 返回值
 * 把返回值定义成接口，让调用者知道能用哪些属性和方法。
 * 这比直接返回一个元组（如 useState）更清晰。
 */
interface UseBookmarksReturn {
    bookmarks: BookmarkWithTags[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    addBookmark: (bookmark: BookmarkWithTags) => void;
    updateBookmarkInList: (bookmark: BookmarkWithTags) => void;
    removeBookmark: (id: number) => void;
}

/**
 * 书签数据管理 Hook
 *
 * 📖 学习点：自定义 Hook 的参数
 * - 参数用对象传入（而不是多个位置参数），方便扩展
 * - 可选参数用 ? 标注
 */
export function useBookmarks(filters?: {
    search?: string;
    tagId?: number | null;
}): UseBookmarksReturn {
    const [bookmarks, setBookmarks] = useState<BookmarkWithTags[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 📖 学习点：依赖值的稳定性
    // filters 是一个对象，每次渲染都会创建新引用。
    // 所以我们用具体的属性值作为依赖，而不是整个对象。
    const searchQuery = filters?.search;
    const tagId = filters?.tagId;

    const refresh = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await api.fetchBookmarks({
                search: searchQuery || undefined,
                tagId: tagId ?? undefined,
            });
            setBookmarks(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [searchQuery, tagId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // 📖 学习点：不可变更新函数
    // 这些函数用于在不重新请求 API 的情况下更新本地状态
    const addBookmark = useCallback((bookmark: BookmarkWithTags) => {
        setBookmarks((prev) => [bookmark, ...prev]);
    }, []);

    const updateBookmarkInList = useCallback((bookmark: BookmarkWithTags) => {
        setBookmarks((prev) =>
            prev.map((b) => (b.id === bookmark.id ? bookmark : b))
        );
    }, []);

    const removeBookmark = useCallback((id: number) => {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
    }, []);

    return {
        bookmarks,
        loading,
        error,
        refresh,
        addBookmark,
        updateBookmarkInList,
        removeBookmark,
    };
}

// ============================================
// 标签数据管理 Hook
// ============================================

interface UseTagsReturn {
    tags: Tag[];
    loading: boolean;
    refresh: () => Promise<void>;
    addTag: (tag: Tag) => void;
}

/**
 * 📖 学习点：简单的 Hook 也有价值
 * 即使逻辑简单，提取成 Hook 也能让组件更干净。
 */
export function useTags(): UseTagsReturn {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const data = await api.fetchTags();
            setTags(data);
        } catch (err) {
            console.error("加载标签失败:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addTag = useCallback((tag: Tag) => {
        setTags((prev) => [...prev, tag]);
    }, []);

    return { tags, loading, refresh, addTag };
}
