import { DebugLogger } from "./debug-logger";
import { apiRequest } from "./queryClient";

export class QuickTester {
  
  // Teste básico de conectividade da API
  static async testBasicConnectivity() {
    DebugLogger.log("QuickTest", "Testing basic API connectivity");
    
    try {
      const services = await apiRequest("GET", "/api/services");
      const clients = await apiRequest("GET", "/api/clients");
      const gallery = await apiRequest("GET", "/api/gallery");
      
      DebugLogger.success("QuickTest", "API connectivity test passed", {
        services: services.length,
        clients: clients.length,
        gallery: gallery.length
      });
      
      return { services, clients, gallery };
    } catch (error) {
      DebugLogger.error("QuickTest", "API connectivity test failed", error);
      throw error;
    }
  }
  
  // Teste de criação simples
  static async testBasicCreation() {
    DebugLogger.log("QuickTest", "Testing basic creation functionality");
    
    try {
      // Criar um cliente de teste simples
      const testClient = {
        name: "Teste Cliente",
        cpf: "99999999999",
        email: "teste@teste.com",
        phone: "(11) 99999-9999"
      };
      
      const client = await apiRequest("POST", "/api/clients", testClient);
      DebugLogger.success("QuickTest", "Client creation test passed", client);
      
      return client;
    } catch (error) {
      DebugLogger.warn("QuickTest", "Client creation test failed (might already exist)", error);
      return null;
    }
  }
  
  // Executar testes rápidos
  static async runQuickTests() {
    DebugLogger.log("QuickTest", "🚀 Starting quick system validation");
    
    try {
      const connectivity = await this.testBasicConnectivity();
      const creation = await this.testBasicCreation();
      
      DebugLogger.success("QuickTest", "✅ Quick tests completed", {
        connectivity: !!connectivity,
        creation: !!creation
      });
      
      return { connectivity, creation };
    } catch (error) {
      DebugLogger.error("QuickTest", "Quick tests failed", error);
      throw error;
    }
  }
}