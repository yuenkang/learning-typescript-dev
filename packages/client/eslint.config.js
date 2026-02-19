// 📖 ==========================================
// 📖 ESLint 配置 — 代码规范检查工具
// 📖 ==========================================
// ESLint 是 JS/TS 项目的"代码质量检查器"。
// 它会自动检查代码中的潜在问题，比如：
//   - 未使用的变量
//   - 不安全的类型转换
//   - React Hooks 的使用规则违反
//
// 📖 学习点：ESLint Flat Config（扁平配置）
// 这是 ESLint v9 引入的新配置格式，用 JS 模块导出一个数组。
// 每个数组元素是一个配置对象，后面的会覆盖前面的。

import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // 📖 globalIgnores: 全局忽略的文件/目录
  // dist/ 是编译输出目录，不需要 lint 检查
  globalIgnores(['dist']),

  {
    // 📖 files: 指定这组规则适用于哪些文件
    // 只检查 .ts 和 .tsx 文件（TypeScript 文件）
    files: ['**/*.{ts,tsx}'],

    // 📖 extends: 继承的规则集
    // 从基础到具体，每层叠加更多规则：
    extends: [
      // 1. ESLint 官方推荐规则（基础 JS 规则）
      js.configs.recommended,
      // 2. TypeScript ESLint 推荐规则（TS 特有的类型检查规则）
      tseslint.configs.recommended,
      // 3. React Hooks 规则（确保 Hooks 使用正确，如依赖数组完整性）
      reactHooks.configs.flat.recommended,
      // 4. React Refresh 规则（确保热更新正常工作）
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      // ECMAScript 版本
      ecmaVersion: 2020,
      // 📖 globals.browser: 声明浏览器全局变量（window、document 等）
      // 这样 ESLint 就不会把 window、document 标记为"未定义变量"
      globals: globals.browser,
    },
  },
])
