import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: path.resolve(__dirname, "client"),
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    // Adicionamos esta linha para desativar a minificação do código.
    // Isto irá dar-nos mensagens de erro claras no browser.
    minify: false,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
