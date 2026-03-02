// ============================================
// 📖 TypeScript 学习笔记：环境类型声明
// ============================================
// import.meta.env 是 Vite 在浏览器环境中注入的属性，
// 但 TypeScript 默认不知道它的存在。
// 这个 .d.ts 文件用 "声明合并"（Declaration Merging）
// 告诉 TS：ImportMeta 接口上还有一个 env 属性。
//
// 📖 学习点：.d.ts 文件
// - 只包含类型声明，不包含任何运行时代码
// - 文件名以 .d.ts 结尾
// - TS 编译器会自动加载 include 范围内的 .d.ts 文件

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
