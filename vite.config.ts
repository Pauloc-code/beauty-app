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
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
  }
})
```

### O que foi alterado:

* **Adicionei `path`** para resolver corretamente o diretório de saída.
* **Ajustei `outDir`** para `'../dist'` para corresponder à estrutura do seu projeto.

### Próximos Passos

1.  **Atualize** o seu ficheiro `vite.config.ts` com o código que forneci no Canvas.
2.  **Mantenha** os outros ficheiros de teste (`package.json`, `tsconfig.json`, `App.tsx`, `main.tsx`) como estão.
3.  **Envie as alterações** para o seu repositório no GitHub.
4.  **Faça o deploy na Vercel**, lembrando-se de **desativar o cache do build**.

Este ajuste final na configuração do Vite deve permitir que o build seja concluído com sucesso, ignorando os ficheiros que estavam a causar os erros de compilaç