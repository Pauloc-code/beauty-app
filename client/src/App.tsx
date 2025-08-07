// Este é um ficheiro de teste temporário para isolar o erro.
// Removemos todas as importações complexas.

export default function App() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#e0f2fe', 
      fontFamily: 'sans-serif' 
    }}>
      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        textAlign: 'center', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        border: '1px solid #bae6fd'
      }}>
        <h1 style={{ color: '#0c4a6e', fontSize: '24px', marginBottom: '10px' }}>
          Teste de Renderização do App
        </h1>
        <p style={{ color: '#374151', fontSize: '16px' }}>
          Se você está a ver esta mensagem, a configuração base da aplicação está a funcionar corretamente.
        </p>
      </div>
    </div>
  );
}
