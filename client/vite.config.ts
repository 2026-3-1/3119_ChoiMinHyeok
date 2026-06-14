import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
      "/api-docs-v1": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
  build: {
    // 청크 크기 경고 기준 (기본 500kb → 1mb)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // React 핵심 라이브러리 묶음
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // 데이터 패칭 / 상태
          "vendor-query": ["@tanstack/react-query"],
          // UI 유틸
          "vendor-ui": ["axios"],
        },
      },
    },
  },
});
