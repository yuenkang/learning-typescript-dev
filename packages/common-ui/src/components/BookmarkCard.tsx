// ============================================
// 📖 TypeScript 学习笔记：React 组件的 Props 类型
// ============================================
// 每个 React 组件都可以接收"属性（Props）"。
// 在 TypeScript 中，我们用 interface 来定义 Props 的类型。
// 这样 TS 会在编译时检查你传给组件的属性是否正确。

import { useState } from "react";
import type { BookmarkWithTags, Tag } from "@bookmark/shared";
import * as api from "@bookmark/api";

// ============================================
// 📖 TypeScript 学习笔记：Props 接口
// ============================================

/**
 * BookmarkCard 的 Props 类型
 *
 * 📖 学习点：Props 接口命名惯例
 * - 通常以 组件名 + Props 命名
 * - 每个属性都有明确的类型注解
 * - 回调函数的类型用箭头函数格式：(参数) => 返回值
 */
interface BookmarkCardProps {
    bookmark: BookmarkWithTags;
    onEdit: (bookmark: BookmarkWithTags) => void; // 📖 回调函数类型
    onDelete: (id: number) => void;
    allTags: Tag[];
}

/**
 * 书签卡片组件
 *
 * 📖 学习点：函数组件的参数解构
 * - ({ bookmark, onEdit, onDelete }: BookmarkCardProps) 是解构写法
 * - 等价于 (props: BookmarkCardProps) 然后 props.bookmark
 * - 解构写法更简洁，也让 TS 能直接推断每个变量的类型
 */
export default function BookmarkCard({
    bookmark,
    onEdit,
    onDelete,
    allTags,
}: BookmarkCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showTagMenu, setShowTagMenu] = useState(false);

    // 📖 学习点：事件处理函数的类型
    // React 中的事件处理函数通常不需要显式标注类型，
    // 因为 TS 能从 onClick 等属性自动推断。
    const handleDelete = async () => {
        if (!confirm("确定要删除这个书签吗？")) return;

        setIsDeleting(true);
        try {
            await api.deleteBookmark(bookmark.id);
            onDelete(bookmark.id);
        } catch (err) {
            console.error("删除失败:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleQuickTag = async (tagId: number) => {
        try {
            const currentTagIds = bookmark.tags.map((t) => t.id);
            // 📖 学习点：数组方法 + 类型推断
            // .includes() 返回 boolean，TS 自动推断
            const newTagIds = currentTagIds.includes(tagId)
                ? currentTagIds.filter((id) => id !== tagId) // 取消标签
                : [...currentTagIds, tagId]; // 添加标签

            const updated = await api.updateBookmark(bookmark.id, {
                tagIds: newTagIds,
            });
            onEdit(updated);
            setShowTagMenu(false);
        } catch (err) {
            console.error("更新标签失败:", err);
        }
    };

    return (
        <div className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-5 transition-all duration-200">
            {/* 标题行 */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-medium text-white hover:text-purple-300 transition-colors line-clamp-1 flex-1"
                >
                    {bookmark.favicon && (
                        <img
                            src={bookmark.favicon}
                            alt=""
                            className="w-4 h-4 inline-block mr-2 -mt-0.5"
                        />
                    )}
                    {bookmark.title}
                </a>
                {/* 操作按钮 */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                        onClick={() => onEdit(bookmark)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="编辑"
                    >
                        ✏️
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setShowTagMenu(!showTagMenu)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="管理标签"
                        >
                            🏷️
                        </button>
                        {showTagMenu && (
                            <div className="absolute right-0 top-8 z-10 bg-slate-800 border border-white/20 rounded-lg p-2 shadow-xl min-w-[140px]">
                                {allTags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleQuickTag(tag.id)}
                                        className={`w-full text-left px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 ${bookmark.tags.some((t) => t.id === tag.id)
                                                ? "bg-white/10 text-white"
                                                : "text-slate-400 hover:text-white hover:bg-white/5"
                                            }`}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: tag.color ?? "#6366f1" }}
                                        />
                                        {tag.name}
                                        {bookmark.tags.some((t) => t.id === tag.id) && " ✓"}
                                    </button>
                                ))}
                                {allTags.length === 0 && (
                                    <p className="text-slate-500 text-xs px-3 py-1">暂无标签</p>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="删除"
                    >
                        🗑️
                    </button>
                </div>
            </div>

            {/* URL */}
            <p className="text-slate-500 text-sm mb-2 truncate">{bookmark.url}</p>

            {/* 描述 */}
            {bookmark.description && (
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {bookmark.description}
                </p>
            )}

            {/* 标签 */}
            {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {bookmark.tags.map((tag) => (
                        <span
                            key={tag.id}
                            className="px-2 py-0.5 text-xs rounded-full text-white/80"
                            style={{
                                backgroundColor: `${tag.color ?? "#6366f1"}33`,
                                borderColor: `${tag.color ?? "#6366f1"}66`,
                                borderWidth: "1px",
                            }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}

            {/* 时间 */}
            <p className="text-slate-600 text-xs mt-3">
                {new Date(bookmark.createdAt).toLocaleDateString("zh-CN")}
            </p>
        </div>
    );
}
