import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // A propriedade 'root' informa ao Vite que a base do seu projeto front-end
  // (incluindo o index.html) está dentro da pasta 'client'.
  root: path.resolve(__dirname, "client"),

  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // O alias '@' agora precisa resolver a partir da pasta 'src' dentro de 'client'.
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    // O diretório de saída será relativo à raiz do projeto, não à pasta 'client'.
    // O Vite gerenciará os caminhos corretamente.
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
