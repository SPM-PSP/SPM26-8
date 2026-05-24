import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'app'),
    },
  },
  server: {
    port: 5173,
    host: true, // 局域网可访问，启动时会打印 Network 地址
    proxy: {
      // 前端用相对路径 /api，由本机 Vite 转发到后端，避免他人设备请求到他们自己的 localhost
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
});
