// ============================================
// 📖 TypeScript 学习笔记：Ink 组件 — 书签列表
// ============================================
// Ink 的组件和 React 组件写法完全一样！
// 但渲染目标不同：
// - React DOM → 浏览器（<div>, <span>）
// - Ink       → 终端（<Box>, <Text>）
//
// 📖 Ink 核心概念对照：
// | Web (React DOM) | Terminal (Ink) |
// |-----------------|---------------|
// | <div>           | <Box>         |
// | <span>          | <Text>        |
// | CSS flexbox     | Box props     |
// | onClick         | useInput      |

import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import type { BookmarkWithTags, Tag } from "@bookmark/shared";

interface BookmarkListProps {
  bookmarks: BookmarkWithTags[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

/**
 * 书签列表组件
 *
 * 📖 学习点：Ink 的 <Box> 和 <Text>
 * - <Box> 是容器，类似 <div>，支持 flexbox 布局
 * - <Text> 是文本，类似 <span>，支持颜色和样式
 * - Box 的 props 直接控制布局：flexDirection, padding, margin 等
 */
export default function BookmarkList({
  bookmarks,
  selectedIndex,
  onSelect,
}: BookmarkListProps) {
  if (bookmarks.length === 0) {
    return (
      <Box padding={1}>
        <Text color="gray">📭 暂无书签，按 a 添加</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {bookmarks.map((bookmark, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Box key={bookmark.id} paddingX={1}>
            {/* 📖 选中指示器 */}
            <Text color={isSelected ? "cyan" : "gray"}>
              {isSelected ? "❯ " : "  "}
            </Text>

            {/* 标题 */}
            <Text bold={isSelected} color={isSelected ? "white" : "gray"}>
              {bookmark.title}
            </Text>

            {/* 标签 */}
            {bookmark.tags.length > 0 && (
              <Text color="gray">
                {"  "}
                {bookmark.tags.map((t) => `[${t.name}]`).join(" ")}
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
