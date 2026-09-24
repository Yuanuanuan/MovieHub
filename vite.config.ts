import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Third arg "" loads *all* env vars (not just VITE_-prefixed ones) — safe
  // here because this file only runs in Node during dev, never in the browser.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": "/src",
        "/": "/public", // 将 @ 符号映射到 src 目录下
      },
    },
    server: {
      // Mirrors api/tmdb/[...path].ts for local dev: `vite dev` doesn't run
      // Vercel Serverless Functions, so we proxy straight to TMDB here and
      // attach the Bearer token server-side, same as production does.
      proxy: {
        "/api/tmdb": {
          target: env.TMDB_BASE_URL || "https://api.themoviedb.org/3",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tmdb/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (env.TMDB_API_TOKEN) {
                proxyReq.setHeader("Authorization", `Bearer ${env.TMDB_API_TOKEN}`);
              }
            });
          },
        },
      },
    },
  };
});
