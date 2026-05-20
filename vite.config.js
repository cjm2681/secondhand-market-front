import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',  // sockjs-client 문제 이거 추가
  },
    server: {
    proxy: {
      '/ws-chat': {
        target: 'http://localhost:8080',
        ws: true,          // WebSocket 프록시
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
