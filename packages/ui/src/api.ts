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
// 在不同环境下，API 请求的目标地址不同：
//   - Web 开发模式：Vite dev proxy 把 /api/* 转发到后端，用相对路径即可
//   - Electron 开发模式：同上，vite-plugin-electron 也通过 Vite dev server 加载
//   - Electron 生产模式：页面从 file:// 加载，/api/* 会变成 file:///api/*
//     所以必须用绝对路径 http://localhost:3001
//
// 📖 学习点：window.location.protocol 判断
// file:// 协议说明是 Electron 打包后运行，需要完整的后端地址
const API_BASE =
    typeof window !== "undefined" && window.location.protocol === "file:"
        ? "http://localhost:3001"
        : "";

// ============================================
// 📖 TypeScript 学习笔记：通用请求函数
// ============================================

/**
 * 通用 API 请求函数
 *
 * 📖 学习点：泛型函数（Generic Function）
 * - <T> 是泛型参数，调用时由 TS 自动推断或手动指定
 * - 返回 Promise<T>，调用者拿到的就是 T 类型的数据
 * - 这样一个函数就能处理所有类型的 API 响应
 *
 * 📖 学习点：async 函数的返回值
 * async 函数自动返回 Promise，所以返回类型是 Promise<T>
 */
async function request<T>(
    url: string,
    options?: RequestInit // 📖 RequestInit 是浏览器内置类型，定义了 fetch 的选项
): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
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
