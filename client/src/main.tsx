import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Ponto de entrada simples para renderizar a aplicação
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
