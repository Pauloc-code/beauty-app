import { createRoot } from "react-dom/client";
import React from 'react'; // Importar o React é necessário para usar JSX

// Em vez de importar e renderizar o seu componente App,
// vamos tentar renderizar um elemento <div> muito simples diretamente.
// Isto testa o núcleo do React e do DOM sem nenhuma das suas dependências.

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Teste Direto do main.tsx</h1>
        <p>Se esta mensagem aparecer, o problema está na importação do ficheiro App.tsx.</p>
      </div>
    </React.StrictMode>
  );
} else {
  console.error("Elemento 'root' não encontrado no DOM. Verifique o seu index.html.");
}
