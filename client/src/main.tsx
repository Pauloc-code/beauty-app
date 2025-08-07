import { createRoot } from "react-dom/client";
import App from "./App";
import React from 'react';

// Este é o ponto de entrada mais simples possível.
// Ele apenas renderiza o componente App.

const rootElement = document.getElementById("root");

if (rootElement) {
    const root = createRoot(rootElement);
    // Removemos o StrictMode temporariamente para eliminar qualquer variável.
    root.render(<App />);
} else {
    // Esta mensagem de erro apareceria se o div 'root' não existisse no index.html.
    console.error("Elemento 'root' não foi encontrado no DOM.");
}
