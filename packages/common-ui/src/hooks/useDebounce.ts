// ============================================
// 📖 TypeScript 学习笔记：自定义 Hook — useDebounce
// ============================================
// "防抖"（Debounce）是前端性能优化的经典技巧。
//
// 📖 问题场景：
// 用户在搜索框输入 "React"，每输一个字母就触发一次 API 请求：
//   "R" → 请求1
//   "Re" → 请求2
//   "Rea" → 请求3
//   "Reac" → 请求4
//   "React" → 请求5
// 实际上只有最后一次"React"的结果是有用的，前 4 次是浪费。
//
// 📖 防抖的解决方案：
// 用户停止输入 300ms 后才真正发送请求。
// 在 300ms 内如果继续输入，就取消之前的计时器重新开始。

import { useState, useEffect } from "react";

/**
 * 防抖 Hook
 *
 * 📖 学习点：泛型 Hook
 * - <T> 让这个 Hook 可以用于任何类型的值（string、number、object...）
 * - TS 会根据传入的 value 自动推断 T 的类型
 *
 * 📖 用法示例：
 * ```ts
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * // search 每次击键都变化
 * // debouncedSearch 只在停止输入 300ms 后才更新
 * useEffect(() => {
 *   fetchResults(debouncedSearch); // 这里只发送最终的搜索请求
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // 📖 学习点：setTimeout 的返回值类型
        // 在浏览器中是 number，在 Node.js 中是 NodeJS.Timeout
        // TS 会根据环境自动选择正确的类型
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // 📖 学习点：useEffect 的清理函数（Cleanup）
        // 返回的函数会在：
        // 1. 组件卸载时执行
        // 2. 下次 useEffect 执行前执行
        // 在这里，清理函数取消之前的计时器，实现"防抖"效果
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
