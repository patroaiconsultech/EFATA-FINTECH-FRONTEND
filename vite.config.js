import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 5173),
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT || 8080),
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2022",
  },
});
