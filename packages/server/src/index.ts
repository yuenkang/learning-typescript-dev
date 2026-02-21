// ============================================
// 📖 TypeScript 学习笔记：Express 后端入口
// ============================================
// 这是后端应用的入口文件。
// 职责：创建 Express 应用 → 配置中间件 → 挂载路由 → 启动监听。

// 📖 学习点：ES Module 的 import 语法
// 在 TypeScript 中，我们可以直接 import npm 包
// 因为安装了 @types/express，TS 知道 express 的所有类型
import express, { Request, Response } from "express";
import cors from "cors";

// 📖 学习点：从共享包中导入类型
// 这就是 monorepo 的好处 —— 前后端用同一套类型定义
import type { ApiResponse } from "@bookmark/shared";

// 📖 学习点：导入自己的模块
// 注意 .js 扩展名！在 ES Module 中，即使源码是 .ts，
// import 路径也要写 .js（因为运行时找的是编译后的 .js 文件）
// tsx 工具会自动处理这个映射
import { db } from "./database.js";
import bookmarkRouter from "./routes/bookmarkRoutes.js";
import tagRouter from "./routes/tagRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

// ============================================
// 创建 Express 应用
// ============================================

// 📖 学习点：类型推断（Type Inference）
// TS 会自动推断 app 的类型为 Express 实例
const app = express();

// 📖 学习点：常量的类型
// PORT 会被推断为 number 类型
const PORT = 3001;

// ============================================
// 中间件配置
// ============================================

// 📖 学习点：中间件（Middleware）
// 中间件是在请求到达路由处理器之前执行的函数。
// 执行顺序：cors → json → 路由 → errorHandler

// cors() - 允许跨域请求
app.use(cors());
// express.json() - 自动解析请求体中的 JSON 数据
app.use(express.json());

// ============================================
// 路由挂载
// ============================================

// 📖 学习点：路由挂载（Route Mounting）
// app.use('/api/bookmarks', bookmarkRouter) 的含义：
// 把 bookmarkRouter 中的所有路由"挂载"到 /api/bookmarks 路径下
// bookmarkRouter 里的 '/' 就变成了 '/api/bookmarks/'
// bookmarkRouter 里的 '/:id' 就变成了 '/api/bookmarks/:id'
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/tags", tagRouter);

// 健康检查接口（保留在入口文件中）
app.get("/api/health", (_req: Request, res: Response) => {
    const response: ApiResponse<{ status: string; timestamp: string }> = {
        success: true,
        data: {
            status: "running",
            timestamp: new Date().toISOString(),
        },
        message: "书签管理器后端服务运行正常 ✅",
    };
    res.json(response);
});

// ============================================
// 错误处理中间件（必须放在所有路由之后！）
// ============================================

// 📖 学习点：中间件顺序
// 错误处理中间件必须在所有路由之后注册。
// 因为 Express 按注册顺序执行中间件，
// 只有路由抛出错误后，才能被这个中间件捕获。
app.use(errorHandler);

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
    console.log(`
  🚀 书签管理器后端已启动
  📍 地址: http://localhost:${PORT}
  💚 健康检查: http://localhost:${PORT}/api/health
  📚 书签 API: http://localhost:${PORT}/api/bookmarks
  🏷️  标签 API: http://localhost:${PORT}/api/tags
  `);
});

export default app;
