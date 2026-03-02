// ============================================
// 📖 TypeScript 学习笔记：API 请求封装
// ============================================
// 把所有 API 请求逻辑集中到一个文件中，好处：
// 1. 避免在每个组件里重复写 fetch 代码
// 2. 统一处理错误
// 3. 类型安全 —— 每个函数的返回值都有明确类型
//
// 📖 学习点：模块化设计
// 前端的"关注点分离"和后端一样重要。
// 组件只负责展示 UI，数据获取交给 api 模块。

import type {
    BookmarkWithTags,
    Tag,
    CreateBookmarkRequest,
    UpdateBookmarkRequest,
    ApiResponse,
} from "@bookmark/shared";

// 📖 学习点：环境感知的 API 基础路径
//
// 三种环境，三种策略：
// 1. Web 浏览器：返回 ""（空），靠 Vite 代理转发 /api/* → localhost:3001
// 2. Electron 桌面端：页面从 file:// 加载，必须用绝对路径
// 3. Node.js（TUI 终端）：没有 window 对象，也必须用绝对路径
//
// 📖 学习点：惰性求值（Lazy Evaluation）
// 之前用 const API_BASE = process.env.API_BASE 会在模块加载时立即求值。
// 但 ES Module 的 import 是静态提升的——所有 import 在代码执行前就被解析。
// 如果 dotenv 还没来得及加载 .env，process.env.API_BASE 就是 undefined。
//
// 解决方案：改成函数，在每次发请求时才去读取环境变量。
// 这叫"惰性求值"——推迟到真正需要时才计算值。
function getApiBase(): string {
    if (typeof window === "undefined") {
        return process.env.API_BASE ?? "http://localhost:3001";           // Node.js (TUI)
    }
    if (window.location.protocol === "file:") {
        return import.meta.env.VITE_API_BASE ?? "http://localhost:3001"; // Electron
    }
    return "";                                                            // Web (代理)
}

// ============================================
// 📖 TypeScript 学习笔记：通用请求函数
// ============================================

/**
 * 通用 API 请求函数
 *
 * 📖 学习点：泛型函数（Generic Function）
 * - <T> 是泛型参数，调用时由 TS 自动推断或手动指定
 * - 返回 Promise<T>，调用者拿到的就是 T 类型的数据
 *
 * 📖 学习点：async 函数的返回值
 * async 函数自动返回 Promise，所以返回类型是 Promise<T>
 */
async function request<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`${getApiBase()}${url}`, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options, // 📖 展开运算符：合并默认 headers 和调用者传入的选项
    });

    // 📖 学习点：类型断言 + 泛型
    // response.json() 返回 Promise<any>
    // 我们断言为 ApiResponse<T>，然后取 data 字段
    const result = (await response.json()) as ApiResponse<T>;

    if (!result.success) {
        // 📖 如果后端返回 success: false，抛出错误
        // 这里利用了类型的灵活性：result 可能是 ApiErrorResponse
        throw new Error((result as unknown as { error: string }).error);
    }

    return result.data;
}

// ============================================
// 书签 API
// ============================================

/**
 * 📖 学习点：具体的 API 函数
 * 每个函数封装了一个 API 端点，参数和返回值都有明确类型。
 * 组件调用时能获得完整的类型提示和自动补全。
 */

/** 获取书签列表 */
export async function fetchBookmarks(params?: {
    search?: string;
    tagId?: number;
}): Promise<BookmarkWithTags[]> {
    // 📖 学习点：URLSearchParams
    // 构建 URL 查询参数的标准方式，会自动处理编码
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.tagId) query.set("tagId", String(params.tagId));

    const queryString = query.toString();
    const url = `/api/bookmarks${queryString ? `?${queryString}` : ""}`;

    return request<BookmarkWithTags[]>(url);
}

/** 获取单个书签 */
export async function fetchBookmark(id: number): Promise<BookmarkWithTags> {
    return request<BookmarkWithTags>(`/api/bookmarks/${id}`);
}

/** 创建书签 */
export async function createBookmark(
    data: CreateBookmarkRequest
): Promise<BookmarkWithTags> {
    return request<BookmarkWithTags>("/api/bookmarks", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/** 更新书签 */
export async function updateBookmark(
    id: number,
    data: UpdateBookmarkRequest
): Promise<BookmarkWithTags> {
    return request<BookmarkWithTags>(`/api/bookmarks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

/** 删除书签 */
export async function deleteBookmark(id: number): Promise<{ id: number }> {
    return request<{ id: number }>(`/api/bookmarks/${id}`, {
        method: "DELETE",
    });
}

// ============================================
// 标签 API
// ============================================

/** 获取所有标签 */
export async function fetchTags(): Promise<Tag[]> {
    return request<Tag[]>("/api/tags");
}

/** 创建标签 */
export async function createTag(
    data: Pick<Tag, "name" | "color">
): Promise<Tag> {
    return request<Tag>("/api/tags", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

/** 删除标签 */
export async function deleteTag(id: number): Promise<{ id: number }> {
    return request<{ id: number }>(`/api/tags/${id}`, {
        method: "DELETE",
    });
}
