import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // O alias '@' agora aponta para a pasta 'src' na raiz do projeto.
      // Isso é uma convenção padrão e organiza melhor o código.
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // O diretório de saída para os arquivos de produção.
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    // Configurações de segurança para o servidor de desenvolvimento.
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
