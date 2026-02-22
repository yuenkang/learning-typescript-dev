// 📖 学习点：桶文件（Barrel File）
// 把所有导出集中到 index.ts，方便其他包引用
// 引用方式：import { Bookmark, Tag } from '@bookmark/shared'
// 而不是：import { Bookmark } from '@bookmark/shared/src/types'

export * from "./types.js";
export * from "./validators.js";

