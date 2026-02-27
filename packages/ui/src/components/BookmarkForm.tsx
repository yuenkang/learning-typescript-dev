// ============================================
// 📖 TypeScript 学习笔记：表单组件与受控组件
// ============================================
// React 的"受控组件"模式：
// - 表单元素的值由 state 控制
// - 用户输入 → 触发 onChange → 更新 state → 重新渲染
// - 好处：数据始终在 React 的控制下，方便验证和提交

import { useState, useEffect } from "react";
import type {
    BookmarkWithTags,
    Tag,
    CreateBookmarkRequest,
} from "@bookmark/shared";
import * as api from "../api";

// ============================================
// Props 类型定义
// ============================================

interface BookmarkFormProps {
    /** 要编辑的书签（传入则为编辑模式，不传则为新建模式） */
    editingBookmark: BookmarkWithTags | null; // 📖 联合类型：有值=编辑，null=新建
    allTags: Tag[];
    onSave: (bookmark: BookmarkWithTags) => void;
    onCancel: () => void;
    onTagCreated: (tag: Tag) => void;
}

/**
 * 书签表单组件（新建 / 编辑 共用）
 *
 * 📖 学习点：组件复用
 * 新建和编辑共用同一个表单组件，通过 editingBookmark 是否为 null 来区分模式。
 * 这避免了写两个几乎一样的组件。
 */
export default function BookmarkForm({
    editingBookmark,
    allTags,
    onSave,
    onCancel,
    onTagCreated,
}: BookmarkFormProps) {
    // ============================================
    // 表单状态
    // ============================================

    // 📖 学习点：多个 useState 管理表单字段
    // 每个字段一个 state，简单直观
    // 也可以用一个 state 对象管理所有字段（减少 state 数量，但更新略复杂）
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 新标签创建
    const [newTagName, setNewTagName] = useState("");
    const [newTagColor, setNewTagColor] = useState("#6366f1");

    // 📖 学习点：useEffect 同步外部数据到 state
    // 当 editingBookmark 变化时，把它的数据填入表单
    useEffect(() => {
        if (editingBookmark) {
            setTitle(editingBookmark.title);
            setUrl(editingBookmark.url);
            setDescription(editingBookmark.description ?? "");
            setSelectedTagIds(editingBookmark.tags.map((t) => t.id));
        } else {
            // 新建模式：清空表单
            setTitle("");
            setUrl("");
            setDescription("");
            setSelectedTagIds([]);
        }
    }, [editingBookmark]);

    // ============================================
    // 事件处理
    // ============================================

    /**
     * 📖 学习点：React.FormEvent 类型
     * 表单提交事件的类型是 React.FormEvent<HTMLFormElement>
     * e.preventDefault() 阻止表单默认的页面刷新行为
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!title.trim() || !url.trim()) {
            setError("标题和 URL 为必填项");
            return;
        }

        setSubmitting(true);
        try {
            const data: CreateBookmarkRequest = {
                title: title.trim(),
                url: url.trim(),
                description: description.trim() || undefined,
                tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
            };

            // 📖 学习点：条件调用
            // 根据是编辑还是新建调用不同的 API
            const result = editingBookmark
                ? await api.updateBookmark(editingBookmark.id, data)
                : await api.createBookmark(data);

            onSave(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleTag = (tagId: number) => {
        setSelectedTagIds((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        );
    };

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const tag = await api.createTag({
                name: newTagName.trim(),
                color: newTagColor,
            });
            onTagCreated(tag);
            setSelectedTagIds((prev) => [...prev, tag.id]);
            setNewTagName("");
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    // ============================================
    // 渲染
    // ============================================

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-5">
                    {editingBookmark ? "✏️ 编辑书签" : "➕ 添加书签"}
                </h2>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {/*
          📖 学习点：受控表单
          每个 input 的 value 绑定 state，onChange 更新 state
          这样 React 始终掌控表单数据
        */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-300 text-sm mb-1">
                            标题 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="网站名称"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm mb-1">
                            URL <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm mb-1">描述</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="简单描述这个网站..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                        />
                    </div>

                    {/* 标签选择 */}
                    <div>
                        <label className="block text-slate-300 text-sm mb-2">标签</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {allTags.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() => handleToggleTag(tag.id)}
                                    className={`px-3 py-1 text-sm rounded-full transition-all ${selectedTagIds.includes(tag.id)
                                            ? "text-white ring-1"
                                            : "text-slate-400 hover:text-white"
                                        }`}
                                    style={{
                                        backgroundColor: selectedTagIds.includes(tag.id)
                                            ? `${tag.color ?? "#6366f1"}44`
                                            : "rgba(255,255,255,0.05)",
                                        borderColor: selectedTagIds.includes(tag.id)
                                            ? tag.color ?? "#6366f1"
                                            : "transparent",
                                        borderWidth: "1px",
                                    }}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                        {/* 快速创建标签 */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                placeholder="新标签名..."
                                className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                            />
                            <input
                                type="color"
                                value={newTagColor}
                                onChange={(e) => setNewTagColor(e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                            />
                            <button
                                type="button"
                                onClick={handleCreateTag}
                                disabled={!newTagName.trim()}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium rounded-lg transition-all disabled:opacity-50"
                        >
                            {submitting
                                ? "保存中..."
                                : editingBookmark
                                    ? "保存修改"
                                    : "添加书签"}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors"
                        >
                            取消
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
