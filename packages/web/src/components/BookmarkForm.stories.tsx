// ============================================
// 📖 Storybook 学习笔记：BookmarkForm 的 Stories
// ============================================
// BookmarkForm 有两种模式：新建 和 编辑。
// 通过 editingBookmark 是否为 null 来区分。

import type { Meta, StoryObj } from "@storybook/react";
import { BookmarkForm } from "@bookmark/common-ui";
import type { CreateBookmarkRequest, Tag } from "@bookmark/shared";

const meta: Meta<typeof BookmarkForm> = {
    title: "Components/BookmarkForm",
    component: BookmarkForm,
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div style={{ padding: "2rem", background: "#0f172a", minHeight: "400px" }}>
                <Story />
            </div>
        ),
    ],
};
export default meta;

type Story = StoryObj<typeof BookmarkForm>;

const sampleTags = [
    { id: 1, name: "前端", color: "#6366f1" },
    { id: 2, name: "学习", color: "#22c55e" },
    { id: 3, name: "工作", color: "#ef4444" },
];

// ============================================
// Stories
// ============================================

/** 📖 新建模式：editingBookmark 为 null */
export const CreateMode: Story = {
    args: {
        editingBookmark: null,
        allTags: sampleTags,
        onSave: (b: CreateBookmarkRequest) => console.log("保存:", b),
        onCancel: () => console.log("取消"),
        onTagCreated: (t: Tag) => console.log("新标签:", t),
    },
};

/** 📖 编辑模式：传入已有书签数据 */
export const EditMode: Story = {
    args: {
        editingBookmark: {
            id: 1,
            title: "TypeScript 官方文档",
            url: "https://www.typescriptlang.org",
            description: "TypeScript 学习资源",
            createdAt: "2024-01-15T08:00:00Z",
            updatedAt: "2024-01-15T08:00:00Z",
            tags: [sampleTags[0], sampleTags[1]],
        },
        allTags: sampleTags,
        onSave: (b: CreateBookmarkRequest) => console.log("更新:", b),
        onCancel: () => console.log("取消"),
        onTagCreated: (t: Tag) => console.log("新标签:", t),
    },
};

/** 📖 没有可用标签 */
export const NoAvailableTags: Story = {
    args: {
        editingBookmark: null,
        allTags: [],
        onSave: (b: CreateBookmarkRequest) => console.log("保存:", b),
        onCancel: () => console.log("取消"),
        onTagCreated: (t: Tag) => console.log("新标签:", t),
    },
};
