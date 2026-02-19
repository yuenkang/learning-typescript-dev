// ============================================
// 📖 TypeScript + React 学习笔记
// ============================================

// 📖 学习点：React Hooks 的类型
// useState<string | null> 表示状态值可以是 string 或 null
// 这是"联合类型"（Union Type）的典型用法
import { useState, useEffect } from "react";

// 📖 学习点：从共享包导入类型
// 前后端使用同一个类型定义，改了一处两边都同步
import type { ApiResponse } from "@bookmark/shared";

// ============================================
// 📖 TypeScript 学习笔记：React 函数组件
// ============================================
// 在 TypeScript 中，React 组件就是一个返回 JSX 的函数。
// 函数的返回类型会被自动推断为 JSX.Element。

function App() {
  // 📖 学习点：useState 的泛型
  // useState<string | null>(null) 告诉 TS：
  // - serverStatus 的类型是 string | null
  // - 初始值是 null
  // 如果不写泛型，TS 会从初始值推断类型为 null（太窄了）
  const [serverStatus, setServerStatus] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📖 学习点：useEffect 的类型
  // useEffect 的回调函数不需要显式标注类型
  // 第二个参数 [] 表示只在组件挂载时执行一次
  useEffect(() => {
    // 📖 学习点：async/await 和类型
    // fetch 返回 Promise<Response>
    // response.json() 返回 Promise<any>，我们用 as 断言为具体类型
    const checkHealth = async () => {
      try {
        const response = await fetch("/api/health");

        // 📖 学习点：类型断言（Type Assertion）
        // response.json() 默认返回 any 类型
        // 我们用 as 告诉 TS 它实际上是 ApiResponse<...> 类型
        // 注意：类型断言不会做运行时检查，你要确保数据结构确实匹配
        const data = (await response.json()) as ApiResponse<{
          status: string;
          timestamp: string;
        }>;

        setServerStatus(data.data.status);
        setServerMessage(data.message ?? "");
      } catch (err) {
        // 📖 学习点：错误处理中的类型
        // catch 的 err 类型是 unknown（不是 any）
        // 你需要通过类型守卫（Type Guard）来安全地使用它
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("未知错误");
        }
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
            📚 书签管理器
          </h1>
          <p className="text-slate-400 text-lg">
            TypeScript 全栈学习项目
          </p>
        </div>

        {/* 状态卡片 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            系统状态
          </h2>

          {loading ? (
            <div className="flex items-center gap-3 text-slate-300">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <span>正在连接后端服务...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 font-medium">❌ 连接失败</p>
              <p className="text-red-400/80 text-sm mt-1">{error}</p>
              <p className="text-slate-400 text-xs mt-2">
                请确保后端已启动：npm run dev:server
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-300 font-medium">
                  ✅ 前后端连接成功！
                </p>
                <p className="text-green-400/80 text-sm mt-1">
                  {serverMessage}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">服务状态</p>
                  <p className="text-white font-medium">{serverStatus}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-slate-400 text-xs mb-1">技术栈</p>
                  <p className="text-white font-medium">Express + React</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 技术栈标签 */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["TypeScript", "React", "Express", "Vite", "Tailwind CSS", "SQLite"].map(
            (tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-white/10 text-slate-300 rounded-full text-sm border border-white/10 hover:bg-white/20 transition-colors cursor-default"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
