/// <reference types="vite/client" />

// 📖 学习点：Vite 环境变量的类型声明
// Vite 通过 import.meta.env 暴露 VITE_ 前缀的环境变量
// 这里声明自定义的环境变量，让 TypeScript 提供类型提示
interface ImportMetaEnv {
    /** API 服务的基础地址，如 https://api.example.com */
    readonly VITE_API_BASE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
