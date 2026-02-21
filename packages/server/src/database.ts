// ============================================
// 📖 TypeScript 学习笔记：数据库模块
// ============================================
// 这个文件负责：
// 1. 连接 SQLite 数据库
// 2. 创建数据表（如果不存在）
// 3. 导出数据库实例供路由使用
//
// 📖 学习点：模块化（Module）
// 把数据库逻辑独立成一个模块，其他文件通过 import 使用。
// 这是"关注点分离"（Separation of Concerns）的实践。

import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ============================================
// 📖 TypeScript 学习笔记：ESM 中获取 __dirname
// ============================================
// 在 CommonJS 中可以直接用 __dirname 获取当前文件所在目录。
// 但在 ES Module 中 __dirname 不存在，需要手动计算：
//   1. import.meta.url → 当前文件的 URL（file:///xxx/xxx.ts）
//   2. fileURLToPath() → 转成文件路径（/xxx/xxx.ts）
//   3. path.dirname()  → 取目录部分（/xxx/）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 数据库文件路径：放在 server 包的根目录下
const DB_PATH = path.join(__dirname, "..", "data", "bookmarks.db");

// ============================================
// 初始化数据库连接
// ============================================

/**
 * 创建并初始化数据库连接
 *
 * 📖 学习点：函数返回值类型
 * - 返回类型 Database.Database 来自 better-sqlite3 的类型声明
 * - TS 也能自动推断返回类型，但显式标注让代码更清晰
 */
function initDatabase(): Database.Database {
    // 📖 学习点：better-sqlite3 是同步的（Synchronous）
    // 不同于大多数 Node.js 库用 async/await，
    // better-sqlite3 选择了同步操作，因为 SQLite 本身就是嵌入式的，
    // 省去了异步回调的复杂性，代码更简洁。
    const db = new Database(DB_PATH);

    // 开启 WAL 模式：提升并发读写性能
    // 📖 pragma 是 SQLite 的配置命令
    db.pragma("journal_mode = WAL");

    // 开启外键约束：确保关联数据的完整性
    // 例如：删除书签时，相关的 bookmark_tags 记录也必须处理
    db.pragma("foreign_keys = ON");

    // ============================================
    // 创建数据表
    // ============================================
    // 📖 学习点：SQL 建表语句
    // IF NOT EXISTS：表已存在就跳过，不会报错（幂等操作）

    // 书签表
    db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      url         TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      favicon     TEXT    DEFAULT '',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

    // 标签表
    db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT    NOT NULL UNIQUE,
      color TEXT    DEFAULT '#6366f1'
    )
  `);

    // 📖 学习点：多对多关系（Many-to-Many）
    // 一个书签可以有多个标签，一个标签也可以属于多个书签。
    // 需要一张"关联表"（Junction Table）来连接它们。
    // bookmark_tags 就是这张关联表。
    db.exec(`
    CREATE TABLE IF NOT EXISTS bookmark_tags (
      bookmark_id INTEGER NOT NULL,
      tag_id      INTEGER NOT NULL,
      PRIMARY KEY (bookmark_id, tag_id),
      FOREIGN KEY (bookmark_id) REFERENCES bookmarks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id)      REFERENCES tags(id)      ON DELETE CASCADE
    )
  `);
    // 📖 ON DELETE CASCADE：级联删除
    // 当删除一个书签时，bookmark_tags 中相关的记录会自动删除
    // 这样就不会留下"孤立"的关联数据

    console.log("  📦 数据库初始化完成");
    console.log(`  📂 数据库路径: ${DB_PATH}`);

    return db;
}

// ============================================
// 导出数据库实例
// ============================================

// 📖 学习点：单例模式（Singleton）
// 整个应用只创建一个数据库连接实例。
// 其他文件 import { db } from './database.js' 拿到的都是同一个实例。
export const db = initDatabase();
