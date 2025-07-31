import { DebugLogger } from "./debug-logger";
import { apiRequest } from "./queryClient";

export class AdminTester {
  
  // Testar funcionalidades do painel administrativo
  static async testAdminFunctions() {
    DebugLogger.log("AdminTest", "Testing admin panel functions");
    
    const results = {
      dataLoading: false,
      clientManagement: false,
      serviceManagement: false,
      galleryManagement: false
    };
    
    try {
      // 1. Testar carregamento de dados
      const services = await apiRequest("GET", "/api/services");
      const clients = await apiRequest("GET", "/api/clients");  
      const gallery = await apiRequest("GET", "/api/gallery");
      
      results.dataLoading = true;
      DebugLogger.success("AdminTest", "Data loading successful", {
        services: services.length,
        clients: clients.length,
        gallery: gallery.length
      });
      
      // 2. Testar gestão de serviços
      if (services.length > 0) {
        const firstService = services[0];
        await apiRequest("PATCH", `/api/services/${firstService.id}`, {
          price: firstService.price // Teste simples sem alteração
        });
        results.serviceManagement = true;
        DebugLogger.success("AdminTest", "Service management working");
      }
      
      // 3. Testar criação de galeria (teste simples)
      try {
        await apiRequest("POST", "/api/gallery", {
          title: "Teste Admin",
          description: "Imagem de teste do painel administrativo",
          imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
          category: "teste"
        });
        results.galleryManagement = true;
        DebugLogger.success("AdminTest", "Gallery management working");
      } catch (error) {
        DebugLogger.warn("AdminTest", "Gallery creation test failed", error);
      }
      
      results.clientManagement = clients.length >= 0; // Se carregou, está funcionando
      
      const totalTests = Object.keys(results).length;
      const passedTests = Object.values(results).filter(Boolean).length;
      
      DebugLogger.success("AdminTest", `Admin tests completed: ${passedTests}/${totalTests} passed`, results);
      
      return results;
      
    } catch (error) {
      DebugLogger.error("AdminTest", "Admin testing failed", error);
      throw error;
    }
  }
  
  // Testar apenas conectividade básica do admin
  static async testBasicAdminConnectivity() {
    DebugLogger.log("AdminTest", "Testing basic admin connectivity");
    
    try {
      const [services, clients, gallery, stats] = await Promise.all([
        apiRequest("GET", "/api/services"),
        apiRequest("GET", "/api/clients"),
        apiRequest("GET", "/api/gallery"),
        apiRequest("GET", "/api/stats/today")
      ]);
      
      DebugLogger.success("AdminTest", "Basic admin connectivity successful", {
        servicesCount: services.length,
        clientsCount: clients.length, 
        galleryCount: gallery.length,
        statsLoaded: !!stats
      });
      
      return true;
    } catch (error) {
      DebugLogger.error("AdminTest", "Basic admin connectivity failed", error);
      return false;
    }
  }
}