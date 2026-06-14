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
        manualChunks: (id) => {
          if (id.includes("react-dom") || id.includes("react-router-dom") || id.includes("node_modules/react/")) return "vendor-react";
          if (id.includes("@tanstack/react-query")) return "vendor-query";
          if (id.includes("node_modules/axios/")) return "vendor-ui";
        },
      },
    },
  },
});
