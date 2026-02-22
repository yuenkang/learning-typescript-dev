// ============================================
// 📖 TypeScript 学习笔记：类型安全的环境配置
// ============================================
// 在实际项目中，端口号、数据库路径等配置不应该硬编码在代码里，
// 而是通过"环境变量"来管理。这样：
// - 不同环境（开发/生产）可以有不同配置
// - 敏感信息（如 API 密钥）不会提交到代码仓库
//
// 📖 学习点：process.env 的类型
// Node.js 的 process.env 类型是 Record<string, string | undefined>
// 这意味着所有环境变量都是 string 或 undefined。
// 我们需要做以下处理：
// 1. 提供默认值（?? 运算符）
// 2. 类型转换（如 Number()）
// 3. 集中管理，避免散落在代码各处

/**
 * 📖 学习点：as const 断言
 * 不加 as const：NODE_ENV 的类型是 string
 * 加了 as const：NODE_ENV 的类型是 'development' | 'production' | 'test'（字面量类型）
 * 字面量类型更精确，能让 TS 做更好的类型检查
 */
const NODE_ENV = (process.env.NODE_ENV ?? "development") as
    | "development"
    | "production"
    | "test";

/**
 * 应用配置对象
 *
 * 📖 学习点：只读对象（Readonly）
 * Object.freeze() 在运行时防止修改
 * as const 在编译时让所有属性变成 readonly
 * 双重保险，确保配置不被意外修改
 */
const config = Object.freeze({
    /** 当前环境 */
    env: NODE_ENV,

    /** 是否为开发环境 */
    isDev: NODE_ENV === "development",

    /** 服务器配置 */
    server: {
        port: Number(process.env.PORT ?? 3001),
        host: process.env.HOST ?? "localhost",
    },

    /** 数据库配置 */
    database: {
        /** 数据库文件名 */
        filename: process.env.DB_FILENAME ?? "bookmarks.db",
    },

    /** CORS 配置 */
    cors: {
        /** 允许的前端源地址 */
        origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    },
});

// 📖 学习点：typeof 操作符获取值的类型
// typeof config 会得到 config 对象的精确类型
// 这样其他文件 import 时就有完整的类型提示
export type AppConfig = typeof config;

export default config;
