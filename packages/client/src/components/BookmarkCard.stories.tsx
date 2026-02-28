// ============================================
// 📖 Storybook 学习笔记：BookmarkCard 的 Stories
// ============================================
// 每个 Story 文件展示一个组件的不同状态。
// 通过传入不同的 Props（args），观察组件在各种场景下的表现。

import type { Meta, StoryObj } from "@storybook/react";
import { BookmarkCard } from "@bookmark/ui";
import type { BookmarkWithTags } from "@bookmark/shared";

// ============================================
// Meta：注册组件
// ============================================
// 📖 title 决定了在 Storybook 侧边栏的位置
//    "Components/BookmarkCard" → Components 分组下的 BookmarkCard
const meta: Meta<typeof BookmarkCard> = {
    title: "Components/BookmarkCard",
    component: BookmarkCard,
    // 📖 tags: ["autodocs"] 会自动生成文档页面
    tags: ["autodocs"],
    // 📖 decorators：给所有 Story 添加外层包裹（这里加深色背景）
    decorators: [
        (Story) => (
            <div style={{ padding: "2rem", background: "#0f172a", minHeight: "200px" }}>
                <Story />
            </div>
        ),
    ],
};
export default meta;

// 📖 StoryObj 类型让每个 Story 的 args 获得完整的类型提示
type Story = StoryObj<typeof BookmarkCard>;

// ============================================
// 共享的模拟数据
// ============================================
const sampleTags = [
    { id: 1, name: "前端", color: "#6366f1" },
    { id: 2, name: "学习", color: "#22c55e" },
    { id: 3, name: "工作", color: "#ef4444" },
    { id: 4, name: "工具", color: "#f59e0b" },
];

// ============================================
// Stories：每个 export 就是一个展示场景
// ============================================

/** 📖 基础用法：带标签的书签 */
export const Default: Story = {
    args: {
        bookmark: {
            id: 1,
            title: "TypeScript 官方文档",
            url: "https://www.typescriptlang.org",
            description: "TypeScript 最权威的学习资源，包含完整的语言手册和教程。",
            createdAt: "2024-01-15T08:00:00Z",
            updatedAt: "2024-01-15T08:00:00Z",
            tags: [sampleTags[0], sampleTags[1]],
        },
        allTags: sampleTags,
        onEdit: (b: BookmarkWithTags) => console.log("编辑:", b.title),
        onDelete: (id: number) => console.log("删除 ID:", id),
    },
};

/** 📖 没有标签的书签 */
export const NoTags: Story = {
    args: {
        ...Default.args,
        bookmark: {
            id: 2,
            title: "React 入门教程",
            url: "https://react.dev",
            description: "React 新版官方教程。",
            createdAt: "2024-02-01T10:00:00Z",
            updatedAt: "2024-02-01T10:00:00Z",
            tags: [],
        },
    },
};

/** 📖 没有描述的书签 */
export const NoDescription: Story = {
    args: {
        ...Default.args,
        bookmark: {
            id: 3,
            title: "GitHub",
            url: "https://github.com",
            createdAt: "2024-03-01T12:00:00Z",
            updatedAt: "2024-03-01T12:00:00Z",
            tags: [sampleTags[2]],
        },
    },
};

/** 📖 超长标题 — 测试文本截断 */
export const LongTitle: Story = {
    args: {
        ...Default.args,
        bookmark: {
            id: 4,
            title: "这是一个非常非常非常长的标题，用来测试当书签标题超出一行时组件的截断效果是否正常",
            url: "https://example.com/very-long-url-to-test-truncation",
            description: "测试超长内容的显示效果。确保 UI 不会因为过长的文本而布局错乱。",
            createdAt: "2024-04-01T14:00:00Z",
            updatedAt: "2024-04-01T14:00:00Z",
            tags: sampleTags,
        },
    },
};

/** 📖 多个标签 — 测试标签换行 */
export const ManyTags: Story = {
    args: {
        ...Default.args,
        bookmark: {
            id: 5,
            title: "MDN Web Docs",
            url: "https://developer.mozilla.org",
            description: "Web 技术文档百科全书",
            createdAt: "2024-05-01T16:00:00Z",
            updatedAt: "2024-05-01T16:00:00Z",
            tags: sampleTags,
        },
    },
};
