// ============================================
// 📖 TypeScript 学习笔记：运行时类型验证
// ============================================
// TypeScript 的类型只在编译时存在，运行时会被完全擦除。
// 这意味着：即使你写了 `as ApiResponse<Bookmark>`，
// 如果服务器返回了意外的数据，TS 也不会报错——因为类型已经不存在了。
//
// 📖 编译时 vs 运行时
// - 编译时（写代码时）：TS 检查类型，帮你发现错误
// - 运行时（代码执行时）：类型信息消失，数据可能是任何东西
//
// 所以，对于"不可信"的数据（如 API 响应、用户输入），
// 我们需要在运行时手动验证数据是否符合预期格式。

/**
 * 📖 学习点：类型谓词（Type Predicate）
 *
 * `value is string` 是类型谓词语法。
 * 当函数返回 true 时，TS 会在调用处自动收窄类型。
 *
 * 例如：
 * ```ts
 * const data: unknown = getInput();
 * if (isString(data)) {
 *   // 这里 data 自动变成 string 类型
 *   console.log(data.toUpperCase()); // ✅ 安全
 * }
 * ```
 */
export function isString(value: unknown): value is string {
    return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
}

/**
 * 📖 学习点：Record<K, V> 工具类型
 * Record<string, unknown> 表示"键为 string、值为 unknown 的对象"
 * 用来表示"至少是一个对象"（排除 null、数组、原始类型等）
 */
export function isObject(
    value: unknown
): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * 验证 API 响应格式
 *
 * 📖 学习点：综合使用类型守卫
 * 这个函数检查数据是否符合 { success: boolean, data: T } 的格式。
 * 即使后端返回了错误格式的数据，前端也不会崩溃。
 */
export function isApiResponse(
    value: unknown
): value is { success: boolean; data: unknown; message?: string } {
    if (!isObject(value)) return false;
    if (typeof value.success !== "boolean") return false;
    if (!("data" in value)) return false;
    return true;
}

/**
 * 验证书签数据的基本格式
 *
 * 📖 学习点：多条件类型守卫
 * 通过逐个检查必要字段来验证数据格式。
 * 这种"防御性编程"在处理外部数据时非常重要。
 */
export function isValidBookmark(
    value: unknown
): value is { id: number; title: string; url: string } {
    if (!isObject(value)) return false;
    if (!isNumber(value.id)) return false;
    if (!isString(value.title)) return false;
    if (!isString(value.url)) return false;
    return true;
}

// ============================================
// 📖 TypeScript 学习笔记：实用验证工具
// ============================================

/**
 * 验证 URL 格式
 *
 * 📖 学习点：try/catch 作为验证手段
 * new URL() 如果传入无效 URL 会抛出错误，
 * 我们利用这个特性来验证 URL 格式。
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * 安全地从 unknown 类型中提取错误消息
 *
 * 📖 学习点：处理 unknown 类型
 * catch 块中的 err 是 unknown 类型，不能直接访问 .message。
 * 这个工具函数安全地提取错误消息，避免运行时崩溃。
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (isString(error)) return error;
    return "未知错误";
}
