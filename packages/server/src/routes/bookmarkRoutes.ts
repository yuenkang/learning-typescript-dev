// ============================================
// 📖 TypeScript 学习笔记：Express 路由模块化
// ============================================
// 把所有路由写在 index.ts 里会导致文件越来越大。
// Express 的 Router 让我们可以把路由拆分到不同文件。
// 每个文件负责一组相关的路由（如所有书签相关的路由）。
//
// 📖 学习点：Router 的工作方式
// 1. 创建一个 Router 实例
// 2. 在 Router 上定义路由（和 app.get/post 用法一样）
// 3. 在 index.ts 中用 app.use('/api/bookmarks', bookmarkRouter) 挂载
// 4. Router 里的路径是相对路径（'/' 实际上是 '/api/bookmarks/'）

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import type {
    CreateBookmarkRequest,
    UpdateBookmarkRequest,
    BookmarkWithTags,
    ApiResponse,
    Tag,
} from "@bookmark/shared";
import { db } from "../database.js";
import { AppError } from "../middleware/errorHandler.js";

// 📖 学习点：创建路由实例
// Router() 创建一个"迷你应用"，拥有和 app 一样的路由方法
const router = Router();

// ============================================
// GET /api/bookmarks — 获取书签列表
// ============================================

/**
 * 📖 学习点：查询参数的类型
 * URL 查询参数（?search=xxx&tag=yyy）都是字符串类型。
 * Express 的 req.query 中所有值都是 string | undefined。
 * 我们需要用类型断言或类型守卫来处理它们。
 */
router.get("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        // 📖 学习点：从 req.query 中解构并指定类型
        // as string | undefined 是类型断言，告诉 TS 这个值的类型
        const search = req.query.search as string | undefined;
        const tagId = req.query.tagId as string | undefined;

        let bookmarks: BookmarkWithTags[];

        if (tagId) {
            // 📖 学习点：SQL JOIN 查询
            // 通过 bookmark_tags 关联表筛选特定标签的书签
            const rows = db
                .prepare(
                    `
        SELECT DISTINCT b.*
        FROM bookmarks b
        JOIN bookmark_tags bt ON b.id = bt.bookmark_id
        WHERE bt.tag_id = ?
        ORDER BY b.created_at DESC
      `
                )
                .all(Number(tagId)) as BookmarkRow[];

            bookmarks = rows.map((row) => attachTags(row));
        } else if (search) {
            // 📖 学习点：SQL LIKE 模糊搜索
            // % 是通配符，%keyword% 表示包含 keyword 的所有记录
            const rows = db
                .prepare(
                    `
        SELECT * FROM bookmarks
        WHERE title LIKE ? OR url LIKE ? OR description LIKE ?
        ORDER BY created_at DESC
      `
                )
                .all(`%${search}%`, `%${search}%`, `%${search}%`) as BookmarkRow[];

            bookmarks = rows.map((row) => attachTags(row));
        } else {
            // 查询所有书签
            const rows = db
                .prepare("SELECT * FROM bookmarks ORDER BY created_at DESC")
                .all() as BookmarkRow[];

            bookmarks = rows.map((row) => attachTags(row));
        }

        const response: ApiResponse<BookmarkWithTags[]> = {
            success: true,
            data: bookmarks,
        };
        res.json(response);
    } catch (err) {
        next(err);
    }
});

// ============================================
// GET /api/bookmarks/:id — 获取单个书签
// ============================================

/**
 * 📖 学习点：路由参数（Route Parameters）
 * :id 是路由参数，通过 req.params.id 获取。
 * 注意：req.params.id 的类型是 string，需要转为 number。
 */
router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);

        // 📖 学习点：Number() 转换的安全检查
        // Number("abc") 会返回 NaN，用 isNaN() 检查
        if (isNaN(id)) {
            throw new AppError(400, "无效的书签 ID");
        }

        const row = db
            .prepare("SELECT * FROM bookmarks WHERE id = ?")
            .get(id) as BookmarkRow | undefined;

        // 📖 学习点：undefined 检查
        // .get() 没找到数据时返回 undefined
        if (!row) {
            throw new AppError(404, `书签 ID ${id} 不存在`);
        }

        const bookmark = attachTags(row);

        const response: ApiResponse<BookmarkWithTags> = {
            success: true,
            data: bookmark,
        };
        res.json(response);
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /api/bookmarks — 创建书签
// ============================================

router.post("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        // 📖 学习点：请求体类型
        // req.body 默认是 any 类型，我们用 as 断言为 CreateBookmarkRequest
        // 然后从中解构出需要的字段
        const {
            title,
            url,
            description,
            favicon,
            tagIds,
        } = req.body as CreateBookmarkRequest;

        // 基本验证
        if (!title || !url) {
            throw new AppError(400, "标题和 URL 为必填项");
        }

        // 📖 学习点：better-sqlite3 的预编译语句（Prepared Statement）
        // prepare() 预编译 SQL，run() 执行并返回结果
        // ? 是参数占位符，防止 SQL 注入攻击
        const result = db
            .prepare(
                `INSERT INTO bookmarks (title, url, description, favicon) VALUES (?, ?, ?, ?)`
            )
            .run(title, url, description ?? "", favicon ?? "");

        // 📖 学习点：lastInsertRowid
        // SQLite 插入后返回新记录的 ID
        // 注意类型是 number | bigint，我们用 Number() 转一下
        const newId = Number(result.lastInsertRowid);

        // 如果有标签，建立关联
        if (tagIds && tagIds.length > 0) {
            const insertTag = db.prepare(
                "INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)"
            );
            // 📖 学习点：for...of 循环
            // TypeScript 知道 tagIds 是 number[]，所以 tagId 自动推断为 number
            for (const tagId of tagIds) {
                insertTag.run(newId, tagId);
            }
        }

        // 查询刚创建的书签（包含标签信息）
        const row = db
            .prepare("SELECT * FROM bookmarks WHERE id = ?")
            .get(newId) as BookmarkRow;
        const bookmark = attachTags(row);

        const response: ApiResponse<BookmarkWithTags> = {
            success: true,
            data: bookmark,
            message: "书签创建成功",
        };
        // 📖 学习点：HTTP 状态码
        // 201 Created：表示资源创建成功（比 200 更语义化）
        res.status(201).json(response);
    } catch (err) {
        next(err);
    }
});

// ============================================
// PUT /api/bookmarks/:id — 更新书签
// ============================================

router.put("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new AppError(400, "无效的书签 ID");
        }

        // 检查书签是否存在
        const existing = db
            .prepare("SELECT * FROM bookmarks WHERE id = ?")
            .get(id) as BookmarkRow | undefined;

        if (!existing) {
            throw new AppError(404, `书签 ID ${id} 不存在`);
        }

        const body = req.body as UpdateBookmarkRequest;

        // 📖 学习点：?? 空值合并运算符（Nullish Coalescing）
        // a ?? b 的含义：如果 a 是 null 或 undefined，就用 b
        // 和 || 不同的是，?? 不会把 '' 或 0 当作"空值"
        const title = body.title ?? existing.title;
        const url = body.url ?? existing.url;
        const description = body.description ?? existing.description;
        const favicon = body.favicon ?? existing.favicon;

        db.prepare(
            `UPDATE bookmarks
       SET title = ?, url = ?, description = ?, favicon = ?, updated_at = datetime('now')
       WHERE id = ?`
        ).run(title, url, description, favicon, id);

        // 如果传了 tagIds，更新标签关联
        if (body.tagIds !== undefined) {
            // 先删除旧关联
            db.prepare("DELETE FROM bookmark_tags WHERE bookmark_id = ?").run(id);
            // 再建立新关联
            if (body.tagIds.length > 0) {
                const insertTag = db.prepare(
                    "INSERT OR IGNORE INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?)"
                );
                for (const tagId of body.tagIds) {
                    insertTag.run(id, tagId);
                }
            }
        }

        const row = db
            .prepare("SELECT * FROM bookmarks WHERE id = ?")
            .get(id) as BookmarkRow;
        const bookmark = attachTags(row);

        const response: ApiResponse<BookmarkWithTags> = {
            success: true,
            data: bookmark,
            message: "书签更新成功",
        };
        res.json(response);
    } catch (err) {
        next(err);
    }
});

// ============================================
// DELETE /api/bookmarks/:id — 删除书签
// ============================================

router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new AppError(400, "无效的书签 ID");
        }

        const existing = db
            .prepare("SELECT * FROM bookmarks WHERE id = ?")
            .get(id) as BookmarkRow | undefined;

        if (!existing) {
            throw new AppError(404, `书签 ID ${id} 不存在`);
        }

        // 📖 学习点：级联删除
        // 因为建表时设置了 ON DELETE CASCADE，
        // 删除书签时 bookmark_tags 中的关联记录会自动删除
        db.prepare("DELETE FROM bookmarks WHERE id = ?").run(id);

        const response: ApiResponse<{ id: number }> = {
            success: true,
            data: { id },
            message: "书签删除成功",
        };
        res.json(response);
    } catch (err) {
        next(err);
    }
});

// ============================================
// 辅助函数
// ============================================

/**
 * 📖 学习点：类型别名用于数据库行
 * 数据库返回的行数据格式和我们的 interface 略有不同：
 * - 数据库字段用 snake_case（created_at）
 * - TypeScript 接口用 camelCase（createdAt）
 * 所以需要一个中间类型来表示"数据库原始行"
 */
interface BookmarkRow {
    id: number;
    title: string;
    url: string;
    description: string;
    favicon: string;
    created_at: string;
    updated_at: string;
}

/**
 * 为书签附加标签信息，并转换字段命名风格
 *
 * 📖 学习点：数据转换函数
 * - 接收数据库格式（snake_case）
 * - 返回 API 格式（camelCase）
 * - 同时查询并附加标签数组
 */
function attachTags(row: BookmarkRow): BookmarkWithTags {
    // 查询该书签关联的所有标签
    const tags = db
        .prepare(
            `
    SELECT t.* FROM tags t
    JOIN bookmark_tags bt ON t.id = bt.tag_id
    WHERE bt.bookmark_id = ?
  `
        )
        .all(row.id) as Tag[];

    // 📖 学习点：对象展开和字段重映射
    // 把 snake_case 的数据库字段转成 camelCase 的 API 字段
    return {
        id: row.id,
        title: row.title,
        url: row.url,
        description: row.description,
        favicon: row.favicon,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        tags,
    };
}

// 📖 学习点：默认导出 vs 命名导出
// 这里用默认导出，因为一个文件只有一个路由器
// import 时可以起任意名字：import bookmarkRouter from './routes/bookmarkRoutes.js'
export default router;
