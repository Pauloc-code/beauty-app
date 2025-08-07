import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração mínima e limpa para teste
export default defineConfig({
  plugins: [react()],
  // Define a raiz do projeto front-end
  root: 'client',
  build: {
    // Define o diretório de saída relativo à raiz
    outDir: '../dist',
    emptyOutDir: true,
  }
})
