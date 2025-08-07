import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import React from 'react';

const rootElement = document.getElementById("root");

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
} else {
    console.error("Elemento 'root' não foi encontrado no DOM.");
}
