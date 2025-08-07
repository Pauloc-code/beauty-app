import React from 'react';

// Componente de teste mínimo para verificar a renderização.
function App() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#eef2ff', 
      fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        textAlign: 'center', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #c7d2fe'
      }}>
        <h1 style={{ color: '#312e81', fontSize: '24px', marginBottom: '10px' }}>
          Configuração Limpa Funcionou!
        </h1>
        <p style={{ color: '#374151', fontSize: '16px' }}>
          A base do projeto está agora estável.
        </p>
      </div>
    </div>
  )
}

export default App;
