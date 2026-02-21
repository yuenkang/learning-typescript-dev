// ============================================
// 📖 TypeScript 学习笔记：自定义错误类和错误处理中间件
// ============================================
// Express 中的错误处理是通过"4 参数中间件"实现的。
// 当路由中抛出错误（throw）或调用 next(error) 时，
// Express 会跳过所有普通中间件，直接进入错误处理中间件。

import type { Request, Response, NextFunction } from "express";
import type { ApiErrorResponse } from "@bookmark/shared";

// ============================================
// 📖 TypeScript 学习笔记：类（Class）
// ============================================
// TypeScript 的 class 比 JavaScript 多了：
// - 属性类型声明
// - 访问修饰符（public/private/protected）
// - readonly 只读修饰符

/**
 * 自定义 API 错误类
 *
 * 📖 学习点：继承（extends）
 * - AppError 继承自 JavaScript 内置的 Error 类
 * - 继承让我们可以在 Error 的基础上添加新属性（如 statusCode）
 * - throw new AppError(404, '未找到') 比 throw new Error('未找到') 信息更丰富
 */
export class AppError extends Error {
    // 📖 学习点：属性声明
    // 在 class 中，属性需要先声明类型，再在 constructor 中赋值
    // 也可以用 constructor 参数属性简写（见下方）
    public readonly statusCode: number;

    /**
     * 📖 学习点：构造函数参数属性（Parameter Properties）
     * 写法一（当前用法）：先声明属性，构造函数中赋值
     * 写法二（简写）：constructor(public readonly statusCode: number, message: string)
     * 简写方式会自动声明同名属性并赋值，但可读性略低
     */
    constructor(statusCode: number, message: string) {
        // 📖 学习点：super()
        // 继承的类必须在 constructor 中调用 super()
        // 这里调用 Error 的构造函数，传入错误消息
        super(message);

        this.statusCode = statusCode;

        // 📖 修复 TypeScript 中继承内置类的问题
        // 由于 ES5 的限制，继承 Error 时 instanceof 可能不工作
        // 手动设置原型链可以解决这个问题
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

// ============================================
// 错误处理中间件
// ============================================

/**
 * 全局错误处理中间件
 *
 * 📖 学习点：Express 错误处理中间件
 * - 必须有 4 个参数：(err, req, res, next)
 * - Express 通过参数个数来区分"普通中间件"和"错误处理中间件"
 * - 即使不使用 next，也必须声明，否则 Express 不会把它当作错误处理器
 *
 * 📖 学习点：类型守卫（Type Guard）
 * - `err instanceof AppError` 是类型守卫
 * - 在 if 分支内，TS 自动把 err 的类型收窄为 AppError
 * - 这样就能安全地访问 err.statusCode（普通 Error 没有这个属性）
 */
export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    // 📖 学习点：下划线前缀 _req, _next
    // 表示"我知道有这个参数但我不用它"
    // 这是 TypeScript/JavaScript 的命名惯例，避免"未使用参数"的警告

    console.error("❌ 错误:", err.message);

    // 使用类型守卫判断是不是我们自定义的错误
    if (err instanceof AppError) {
        // 📖 类型收窄（Type Narrowing）
        // 在这个分支里，TS 知道 err 是 AppError 类型
        // 所以可以安全地访问 err.statusCode
        const response: ApiErrorResponse = {
            success: false,
            error: err.message,
            message: err.message,
        };
        res.status(err.statusCode).json(response);
        return;
    }

    // 未知错误：返回 500
    const response: ApiErrorResponse = {
        success: false,
        error: "Internal Server Error",
        message: "服务器内部错误",
    };
    res.status(500).json(response);
}
