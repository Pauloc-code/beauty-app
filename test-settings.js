// Teste massivo de configurações
const baseUrl = 'http://localhost:5000/api/system-settings';

// Array de testes para diferentes configurações
const testConfigs = [
  {
    name: "Brasília - Feriados Desabilitados",
    data: {
      timezone: "America/Sao_Paulo",
      showHolidays: false,
      holidayRegion: "sao_paulo",
      workingHours: { start: "09:00", end: "19:00" }
    }
  },
  {
    name: "Manaus - Feriados Habilitados",
    data: {
      timezone: "America/Manaus",
      showHolidays: true,
      holidayRegion: "manaus",
      workingHours: { start: "08:30", end: "17:30" }
    }
  },
  {
    name: "Rio - Horário Estendido",
    data: {
      timezone: "America/Sao_Paulo",
      showHolidays: true,
      holidayRegion: "rio_de_janeiro",
      workingHours: { start: "07:00", end: "20:00" }
    }
  },
  {
    name: "Fortaleza - Fim de Semana",
    data: {
      timezone: "America/Fortaleza",
      showHolidays: true,
      holidayRegion: "fortaleza",
      workingDays: [1, 2, 3, 4, 5, 6, 0], // Include Sunday
      workingHours: { start: "10:00", end: "16:00" }
    }
  }
];

async function testConfig(config) {
  try {
    console.log(`\n=== Testando: ${config.name} ===`);
    
    // 1. PUT request para salvar
    const putResponse = await fetch(baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config.data)
    });
    
    if (!putResponse.ok) {
      throw new Error(`PUT failed with status: ${putResponse.status}`);
    }
    
    const putResult = await putResponse.json();
    console.log('PUT SUCCESS:', JSON.stringify(putResult, null, 2));
    
    // 2. GET request para verificar se foi salvo
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    
    const getResponse = await fetch(baseUrl);
    if (!getResponse.ok) {
      throw new Error(`GET failed with status: ${getResponse.status}`);
    }
    
    const getResult = await getResponse.json();
    console.log('GET VERIFICATION:', JSON.stringify(getResult, null, 2));
    
    // 3. Verificar se os dados batem
    const fieldsToCheck = ['timezone', 'showHolidays', 'holidayRegion', 'workingHours'];
    let allMatch = true;
    
    for (const field of fieldsToCheck) {
      if (config.data[field] !== undefined) {
        if (field === 'workingHours') {
          const expected = config.data[field];
          const actual = getResult[field];
          if (expected.start !== actual.start || expected.end !== actual.end) {
            console.error(`MISMATCH in ${field}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
            allMatch = false;
          }
        } else {
          if (config.data[field] !== getResult[field]) {
            console.error(`MISMATCH in ${field}: expected ${config.data[field]}, got ${getResult[field]}`);
            allMatch = false;
          }
        }
      }
    }
    
    if (allMatch) {
      console.log('✅ TESTE PASSOU - Todos os dados foram salvos corretamente!');
      return true;
    } else {
      console.log('❌ TESTE FALHOU - Dados não coincidem');
      return false;
    }
    
  } catch (error) {
    console.error(`❌ ERRO no teste ${config.name}:`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando teste massivo de configurações...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const config of testConfigs) {
    const success = await testConfig(config);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    
    // Delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=== RESULTADO FINAL ===');
  console.log(`✅ Testes passaram: ${passed}`);
  console.log(`❌ Testes falharam: ${failed}`);
  console.log(`📊 Taxa de sucesso: ${(passed / (passed + failed) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! O backend de configurações está funcionando perfeitamente.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique os logs acima para detalhes.');
  }
}

// Execute the tests
runAllTests().catch(console.error);