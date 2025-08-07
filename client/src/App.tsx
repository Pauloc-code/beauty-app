import React from 'react';

// Este é o componente mais simples possível.
// Não tem estado, rotas, ou qualquer outra lógica complexa.

export default function App() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#f0f9ff', 
      fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        textAlign: 'center', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #e0f2fe'
      }}>
        <h1 style={{ color: '#0369a1', fontSize: '24px', marginBottom: '10px' }}>
          Teste de Renderização Mínima
        </h1>
        <p style={{ color: '#374151', fontSize: '16px' }}>
          Se você vê esta mensagem, o problema está nas bibliotecas do seu App.tsx original.
        </p>
      </div>
    </div>
  );
}
