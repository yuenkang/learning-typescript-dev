// ============================================
// 📖 TypeScript 学习笔记：Ink 组件 — 书签详情面板
// ============================================
// 显示选中书签的详细信息。
// 这个组件展示了 Ink 的样式能力：颜色、加粗、下划线等。

import React from "react";
import { Box, Text } from "ink";
import type { BookmarkWithTags } from "@bookmark/shared";

interface BookmarkDetailProps {
  bookmark: BookmarkWithTags | null;
}

/**
 * 书签详情面板
 *
 * 📖 学习点：条件渲染 + null 检查
 * bookmark 可能是 null（没有选中任何书签时），
 * 所以需要先处理 null 的情况。
 */
export default function BookmarkDetail({ bookmark }: BookmarkDetailProps) {
  if (!bookmark) {
    return (
      <Box borderStyle="single" borderColor="gray" padding={1} width={50}>
        <Text color="gray">选择一个书签查看详情</Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor="cyan"
      padding={1}
      width={50}
    >
      {/* 标题 */}
      <Text bold color="white">
        📖 {bookmark.title}
      </Text>

      {/* URL */}
      <Box marginTop={1}>
        <Text color="gray">🔗 </Text>
        <Text color="blue" underline>
          {bookmark.url}
        </Text>
      </Box>

      {/* 描述 */}
      {bookmark.description && (
        <Box marginTop={1}>
          <Text color="gray">📝 {bookmark.description}</Text>
        </Box>
      )}

      {/* 标签 */}
      {bookmark.tags.length > 0 && (
        <Box marginTop={1}>
          <Text color="gray">🏷️  </Text>
          {bookmark.tags.map((tag, i) => (
            <React.Fragment key={tag.id}>
              {i > 0 && <Text> </Text>}
              <Text color="magenta">[{tag.name}]</Text>
            </React.Fragment>
          ))}
        </Box>
      )}

      {/* 时间 */}
      <Box marginTop={1}>
        <Text color="gray" dimColor>
          📅 {new Date(bookmark.createdAt).toLocaleDateString("zh-CN")}
        </Text>
      </Box>
    </Box>
  );
}
