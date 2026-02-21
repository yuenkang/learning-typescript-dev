// ============================================
// 📖 TypeScript 学习笔记：标签路由
// ============================================
// 标签路由比书签路由简单，适合对比学习。
// 注意这里和 bookmarkRoutes.ts 的结构完全一样：
// 1. 创建 Router
// 2. 定义路由
// 3. 导出 Router

import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import type { Tag, ApiResponse } from "@bookmark/shared";
import { db } from "../database.js";
import { AppError } from "../middleware/errorHandler.js";

const router = Router();

// ============================================
// GET /api/tags — 获取所有标签
// ============================================

router.get("/", (_req: Request, res: Response, next: NextFunction) => {
    try {
        const tags = db
            .prepare("SELECT * FROM tags ORDER BY name ASC")
            .all() as Tag[];

        const response: ApiResponse<Tag[]> = {
            success: true,
            data: tags,
        };
        res.json(response);
    } catch (err) {
        next(err);
    }
});

// ============================================
// POST /api/tags — 创建标签
// ============================================

/**
 * 📖 学习点：Pick<T, K> 工具类型
 * 和 Omit 相反，Pick 表示"只保留类型 T 中的属性 K"
 * Pick<Tag, 'name' | 'color'> = { name: string; color?: string }
 */
router.post("/", (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, color } = req.body as Pick<Tag, "name" | "color">;

        if (!name) {
            throw new AppError(400, "标签名称为必填项");
        }

        // 📖 学习点：try/catch 处理唯一约束冲突
        // tags 表的 name 字段设置了 UNIQUE 约束
        // 如果插入重复名称，SQLite 会抛出错误
        try {
            const result = db
                .prepare("INSERT INTO tags (name, color) VALUES (?, ?)")
                .run(name, color ?? "#6366f1");

            const newTag: Tag = {
                id: Number(result.lastInsertRowid),
                name,
                color: color ?? "#6366f1",
            };

            const response: ApiResponse<Tag> = {
                success: true,
                data: newTag,
                message: "标签创建成功",
            };
            res.status(201).json(response);
        } catch {
            throw new AppError(409, `标签 "${name}" 已存在`);
        }
    } catch (err) {
        next(err);
    }
});

// ============================================
// DELETE /api/tags/:id — 删除标签
// ============================================

router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            throw new AppError(400, "无效的标签 ID");
        }

        const existing = db
            .prepare("SELECT * FROM tags WHERE id = ?")
            .get(id) as Tag | undefined;

        if (!existing) {
            throw new AppError(404, `标签 ID ${id} 不存在`);
        }

        // 级联删除：bookmark_tags 中的关联记录会自动删除
        db.prepare("DELETE FROM tags WHERE id = ?").run(id);

        const response: ApiResponse<{ id: number }> = {
            success: true,
            data: { id },
            message: "标签删除成功",
        };
        res.json(response);
    } catch (err) {
        next(err);
    }
});

export default router;
