import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // 📖 学习点：开发代理（Dev Proxy）
  // 前端运行在 5173 端口，后端运行在 3001 端口
  // 直接从前端请求后端会触发浏览器的"跨域限制"（CORS）
  // 代理的作用：把前端发出的 /api/* 请求"偷偷转发"到后端
  // 对浏览器来说，请求始终是发给 5173 端口的，不存在跨域问题
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
