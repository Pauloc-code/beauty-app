import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Configuração Mínima e Limpa para Teste
export default defineConfig({
  plugins: [react()],
  // Define a raiz do projeto front-end, onde o index.html está localizado.
  root: 'client',
  build: {
    // Define o diretório de saída para os ficheiros de produção.
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  }
})
