# 📚 TypeScript 全栈学习知识地图

> 基于 **书签管理器** 项目，梳理所有已学和待学的知识点。

---

## 一、TypeScript 类型系统（核心）

### ✅ 已学

| 知识点              | 说明                                                             | 所在文件                                                               |
| ------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **interface** 接口  | 定义对象的形状，`?` 可选属性                                     | `shared/src/types.ts`                                                  |
| **type** 类型别名   | 联合类型、交叉类型等复杂类型                                     | `shared/src/types.ts`                                                  |
| **泛型 `<T>`**      | `ApiResponse<T>`、泛型函数 `request<T>()`                        | `shared/src/types.ts`、`web/src/api.ts`                             |
| **工具类型**        | `Omit<T,K>`、`Partial<T>`、`Pick<T,K>`、`Record<K,V>`            | `shared/src/types.ts`、`web/src/api.ts`、`shared/src/validators.ts` |
| **交叉类型 `&`**    | `BookmarkWithTags = Bookmark & { tags: Tag[] }`                  | `shared/src/types.ts`                                                  |
| **字面量类型**      | `success: false`、字面量联合类型 `'development' \| 'production'` | `shared/src/types.ts`、`server/src/config.ts`                          |
| **类型守卫**        | `instanceof`、`typeof`、`in`                                     | `server/src/middleware/errorHandler.ts`                                |
| **类型谓词**        | `value is string`，函数返回 true 时自动收窄类型                  | `shared/src/validators.ts`                                             |
| **类型断言 `as`**   | `as string \| undefined`、`as BookmarkRow[]`                     | `server/src/routes/bookmarkRoutes.ts`                                  |
| **类型推断**        | TS 自动推断变量/函数返回值类型                                   | 全项目                                                                 |
| **类型收窄**        | `if (err instanceof AppError)` 分支内自动收窄                    | `server/src/middleware/errorHandler.ts`                                |
| **索引访问类型**    | `Bookmark['id']` 引用其他接口的属性类型                          | `shared/src/types.ts`                                                  |
| **typeof 操作符**   | `type AppConfig = typeof config` 从值推导类型                    | `server/src/config.ts`                                                 |
| **`as const` 断言** | 让值变成字面量类型（更精确的类型）                               | `server/src/config.ts`                                                 |

### ⬜ 待学

| 知识点                 | 说明                                        | 优先级 |
| ---------------------- | ------------------------------------------- | ------ |
| **联合类型 `\|`** 深入 | 可辨识联合（Discriminated Union）、穷尽检查 | ⭐⭐⭐ |
| **映射类型**           | 从已有类型创建新类型（`[K in keyof T]`）    | ⭐⭐   |
| **条件类型**           | `T extends U ? X : Y`                       | ⭐⭐   |
| **模板字面量类型**     | `` `${string}_id` ``                        | ⭐     |
| **`infer` 关键字**     | 在条件类型中推断类型                        | ⭐     |
| **装饰器**             | 类和方法的装饰器（stage 3 提案）            | ⭐     |
| **枚举 `enum`**        | 枚举类型 vs 联合类型对比                    | ⭐⭐   |

---

## 二、Node.js 后端开发

### ✅ 已学

| 知识点               | 说明                                                              | 所在文件                                        |
| -------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| **Express 应用创建** | 创建 app、挂载中间件、启动监听                                    | `server/src/index.ts`                           |
| **路由模块化**       | `Router()` 创建独立路由模块，`app.use()` 挂载                     | `server/src/routes/bookmarkRoutes.ts`           |
| **RESTful CRUD**     | GET / POST / PUT / DELETE 完整实现                                | `server/src/routes/bookmarkRoutes.ts`           |
| **中间件**           | cors、json 解析、自定义 logger、错误处理                          | `server/src/index.ts`、`server/src/middleware/` |
| **中间件顺序**       | 错误处理中间件必须在路由之后，4 参数签名                          | `server/src/index.ts`                           |
| **自定义错误类**     | `class AppError extends Error`，类的继承                          | `server/src/middleware/errorHandler.ts`         |
| **SQLite 数据库**    | better-sqlite3 同步操作，建表、CRUD                               | `server/src/database.ts`                        |
| **多对多关系**       | 关联表 `bookmark_tags`，级联删除                                  | `server/src/database.ts`                        |
| **ESM 模块**         | `import/export`、`.js` 扩展名、`import.meta.url` 获取 `__dirname` | `server/src/database.ts`                        |
| **环境配置**         | `process.env`、`??` 默认值、集中管理 config                       | `server/src/config.ts`                          |
| **单例模式**         | 数据库连接实例全局唯一                                            | `server/src/database.ts`                        |
| **HTTP 状态码**      | 200、201、400、404、500                                           | `server/src/routes/bookmarkRoutes.ts`           |
| **类与继承**         | `class`、`extends`、`super()`、`readonly`                         | `server/src/middleware/errorHandler.ts`         |

### ⬜ 待学

| 知识点                    | 说明                               | 优先级 |
| ------------------------- | ---------------------------------- | ------ |
| **异步 async/await** 深入 | Promise 链、并发控制、错误处理模式 | ⭐⭐⭐ |
| **输入验证库**            | Zod / Joi 替代手写验证             | ⭐⭐⭐ |
| **认证与授权**            | JWT / Session、middleware 鉴权     | ⭐⭐⭐ |
| **ORM**                   | Prisma / Drizzle 替代手写 SQL      | ⭐⭐   |
| **单元测试**              | Vitest 测试后端路由和业务逻辑      | ⭐⭐⭐ |
| **日志框架**              | Pino / Winston 结构化日志          | ⭐     |
| **环境变量管理**          | dotenv / .env 文件                 | ⭐⭐   |

---

## 三、React 前端开发

### ✅ 已学

| 知识点          | 说明                                             | 所在文件                                 |
| --------------- | ------------------------------------------------ | ---------------------------------------- |
| **函数组件**    | Props 接口、参数解构                             | `web/src/components/BookmarkCard.tsx` |
| **Props 类型**  | `interface XxxProps`，回调函数类型               | `web/src/components/*.tsx`            |
| **useState**    | 状态管理，泛型 `useState<T>()`                   | `web/src/App.tsx`                     |
| **useEffect**   | 副作用、清理函数、依赖数组                       | `web/src/hooks/useDebounce.ts`        |
| **useCallback** | 函数缓存，避免不必要渲染                         | `web/src/hooks/useBookmarks.ts`       |
| **自定义 Hook** | `useBookmarks`、`useTags`、`useDebounce`         | `web/src/hooks/`                      |
| **防抖优化**    | `useDebounce` Hook 减少 API 请求次数             | `web/src/hooks/useDebounce.ts`        |
| **受控组件**    | 表单值由 state 控制                              | `web/src/components/BookmarkForm.tsx` |
| **表单事件**    | `React.FormEvent`、`e.preventDefault()`          | `web/src/components/BookmarkForm.tsx` |
| **条件渲染**    | 三元运算符、`&&` 短路                            | `web/src/App.tsx`                     |
| **列表渲染**    | `.map()` + `key` 属性                            | `web/src/App.tsx`                     |
| **关注点分离**  | Hook 管数据、组件管展示                          | 全前端                                   |
| **不可变更新**  | `prev.map()`、`prev.filter()`、`[...prev, item]` | `web/src/hooks/useBookmarks.ts`       |

### ⬜ 待学

| 知识点                    | 说明                            | 优先级 |
| ------------------------- | ------------------------------- | ------ |
| **useReducer**            | 复杂状态管理                    | ⭐⭐   |
| **useContext**            | 跨组件状态共享（主题/用户信息） | ⭐⭐⭐ |
| **useMemo**               | 计算值缓存                      | ⭐⭐   |
| **useRef**                | DOM 引用和持久化值              | ⭐⭐   |
| **React Router**          | 多页面路由                      | ⭐⭐⭐ |
| **错误边界**              | `ErrorBoundary` 组件            | ⭐⭐   |
| **React.memo**            | 组件级别的渲染优化              | ⭐     |
| **Suspense / React.lazy** | 代码分割和懒加载                | ⭐     |
| **前端测试**              | React Testing Library + Vitest  | ⭐⭐⭐ |

---

## 四、API 通信

### ✅ 已学

| 知识点              | 说明                                  | 所在文件                   |
| ------------------- | ------------------------------------- | -------------------------- |
| **fetch API**       | 浏览器原生请求 API                    | `web/src/api.ts`        |
| **泛型请求函数**    | `request<T>()` 统一类型安全的请求封装 | `web/src/api.ts`        |
| **URLSearchParams** | 构建 URL 查询参数                     | `web/src/api.ts`        |
| **统一响应格式**    | `ApiResponse<T>` 前后端共享           | `shared/src/types.ts`      |
| **运行时类型验证**  | 类型擦除概念、手动验证外部数据        | `shared/src/validators.ts` |
| **JSON 序列化**     | `JSON.stringify()`、`response.json()` | `web/src/api.ts`        |

### ⬜ 待学

| 知识点                | 说明                             | 优先级 |
| --------------------- | -------------------------------- | ------ |
| **Axios**             | 更强大的 HTTP 客户端             | ⭐     |
| **请求拦截器**        | 统一添加 token、错误处理         | ⭐⭐   |
| **WebSocket**         | 实时通信                         | ⭐     |
| **React Query / SWR** | 服务端状态管理（缓存、乐观更新） | ⭐⭐⭐ |

---

## 五、工程化与工具链

### ✅ 已学

| 知识点                              | 说明                                                                          | 所在文件                              |
| ----------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| **npm workspaces**                  | monorepo 架构，多包管理                                                       | 根 `package.json`                     |
| **tsconfig**                        | 编译选项、配置继承（extends）                                                 | `tsconfig.base.json`                  |
| **Vite**                            | 前端开发服务器、热更新、生产构建                                              | `web/vite.config.ts`               |
| **tsx**                             | 直接运行 TS 文件 + watch 热重载                                               | `server/package.json`                 |
| **ESLint**                          | 代码规范检查                                                                  | `web/eslint.config.js`             |
| **Tailwind CSS**                    | 原子化 CSS 样式                                                               | `web/src/App.tsx`                  |
| **Storybook**                       | 组件可视化工作台，独立展示/调试每个组件，通过 Stories 传入不同 Props 观察效果 | `web/src/components/*.stories.tsx` |
| **React DevTools**                  | 浏览器插件，查看组件树、Props、State、Hooks 值                                | Chrome 扩展                           |
| **package.json**                    | name、version、scripts、依赖管理                                              | `docs/package-json-guide.md`          |
| **@types/\* 包**                    | 社区类型声明，为 JS 库提供类型                                                | `server/package.json`                 |
| **dependencies vs devDependencies** | 运行时依赖 vs 开发时依赖                                                      | `docs/package-json-guide.md`          |
| **版本号语义**                      | `^` 兼容主版本、`~` 兼容次版本、`*` 任意                                      | `docs/package-json-guide.md`          |

### ⬜ 待学

| 知识点                  | 说明                        | 优先级 |
| ----------------------- | --------------------------- | ------ |
| **Git 工作流**          | 分支策略、PR、代码审查      | ⭐⭐   |
| **CI/CD**               | GitHub Actions 自动测试部署 | ⭐⭐   |
| **Docker**              | 容器化部署                  | ⭐     |
| **Prettier**            | 代码格式化                  | ⭐⭐   |
| **Husky + lint-staged** | Git hook 自动检查           | ⭐     |

---

## 六、设计模式与编程思想

### ✅ 已学

| 知识点         | 出现场景                             |
| -------------- | ------------------------------------ |
| **关注点分离** | Hook 管数据 / 组件管 UI / 模块化路由 |
| **单例模式**   | 数据库连接实例                       |
| **防御性编程** | 运行时类型验证、错误处理             |
| **组件复用**   | BookmarkForm 新建/编辑共用           |
| **防抖**       | useDebounce 减少 API 调用            |
| **中间件模式** | Express 请求处理流水线               |

### ⬜ 待学

| 知识点              | 说明                 | 优先级 |
| ------------------- | -------------------- | ------ |
| **策略模式**        | 算法/行为的可替换    | ⭐     |
| **观察者/发布订阅** | 事件驱动编程         | ⭐⭐   |
| **依赖注入**        | 可测试代码           | ⭐⭐   |
| **SOLID 原则**      | 面向对象设计五大原则 | ⭐⭐   |

---

## 📊 学习进度总览

```
TypeScript 类型系统  ████████████████░░░░  80%  (核心完成，进阶待学)
Node.js 后端        ██████████████░░░░░░  70%  (CRUD 完成，测试/认证待学)
React 前端          ████████████░░░░░░░░  60%  (基础完成，路由/状态管理待学)
API 通信            ██████████████░░░░░░  70%  (基础完成，缓存/乐观更新待学)
工程化              ████████████████░░░░  80%  (配置完成，CI/CD 待学)
设计模式            ██████████░░░░░░░░░░  50%  (实践已有，理论待深入)
```

---

## 🎯 推荐下一步学习方向

### 优先级一：补强核心能力

1. **单元测试**（Vitest） — 给已有代码写测试，养成测试驱动开发习惯
2. **React Router** — 实现多页面导航，如设置页、统计页
3. **useContext** — 全局状态（深色主题、用户偏好）

### 优先级二：进阶实战

4. **认证系统** — JWT 登录注册，protect middleware
5. **Zod 验证** — 替代手写验证，前后端共享 schema
6. **React Query** — 替代手动 fetch + state 管理

### 优先级三：生产级能力

7. **CI/CD** — GitHub Actions 自动测试
8. **Docker** — 容器化部署
9. **TypeScript 高级类型** — 条件类型、映射类型
