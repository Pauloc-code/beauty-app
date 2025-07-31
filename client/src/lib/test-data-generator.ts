import { DebugLogger } from "./debug-logger";
import { apiRequest } from "./queryClient";

export class TestDataGenerator {
  
  // Criar dados de clientes de teste
  static async createTestClients() {
    DebugLogger.log("TestData", "Creating test clients");
    
    // Verificar clientes existentes primeiro
    const existingClients = await apiRequest("GET", "/api/clients");
    const existingCpfs = new Set(existingClients.map((client: any) => client.cpf));
    
    const testClients = [
      {
        name: "Maria Silva Santos",
        cpf: "12345678901",
        email: "maria.santos@email.com",
        phone: "(11) 99999-1234"
      },
      {
        name: "Ana Paula Costa",
        cpf: "09876543210",
        email: "ana.costa@email.com",
        phone: "(11) 88888-5678"
      },
      {
        name: "Juliana Ferreira",
        cpf: "11122233344",
        email: "juliana.ferreira@email.com",
        phone: "(11) 77777-9012"
      }
    ];

    for (const client of testClients) {
      try {
        if (existingCpfs.has(client.cpf)) {
          DebugLogger.log("TestData", "Client already exists, skipping", { name: client.name, cpf: client.cpf });
          continue;
        }
        
        const result = await apiRequest("POST", "/api/clients", client);
        DebugLogger.success("TestData", "✅ Created test client", { name: client.name, id: result.id });
      } catch (error) {
        DebugLogger.error("TestData", "Failed to create test client", { client: client.name, error });
      }
    }
  }

  // Criar dados de serviços de teste
  static async createTestServices() {
    DebugLogger.log("TestData", "Creating test services");
    
    const testServices = [
      {
        name: "Esmaltação em Gel",
        description: "Aplicação de esmalte em gel com duração prolongada",
        duration: 45,
        price: "35.00",
        points: 10,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
      },
      {
        name: "Spa dos Pés",
        description: "Tratamento completo com esfoliação, hidratação e esmaltação",
        duration: 60,
        price: "50.00",
        points: 15,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
      },
      {
        name: "Unhas de Fibra",
        description: "Alongamento com fibra de vidro para unhas mais resistentes",
        duration: 90,
        price: "80.00",
        points: 25,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
      },
      {
        name: "Decoração Artística",
        description: "Nail art personalizada com desenhos e aplicações",
        duration: 75,
        price: "65.00",
        points: 20,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1599206676520-5c89a4a20c90?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
      }
    ];

    for (const service of testServices) {
      try {
        const result = await apiRequest("POST", "/api/services", service);
        DebugLogger.success("TestData", "Created test service", { name: service.name, id: result.id });
      } catch (error) {
        DebugLogger.error("TestData", "Failed to create test service", { service: service.name, error });
      }
    }
  }

  // Criar imagens de galeria de teste
  static async createTestGalleryImages() {
    DebugLogger.log("TestData", "Creating test gallery images");
    
    const testImages = [
      {
        url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        title: "Esmaltação Rosa Elegante",
        description: "Trabalho realizado com esmalte em gel rosa pastel",
        category: "Esmaltação"
      },
      {
        url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        title: "Spa dos Pés Relaxante",
        description: "Tratamento completo de pedicure com hidratação",
        category: "Pedicure"
      },
      {
        url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        title: "Alongamento Natural",
        description: "Unhas alongadas com fibra de vidro",
        category: "Alongamento"
      },
      {
        url: "https://images.unsplash.com/photo-1599206676520-5c89a4a20c90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        title: "Arte Floral",
        description: "Decoração artística com motivos florais",
        category: "Nail Art"
      }
    ];

    for (const image of testImages) {
      try {
        const result = await apiRequest("POST", "/api/gallery", image);
        DebugLogger.success("TestData", "Created test gallery image", { title: image.title, id: result.id });
      } catch (error) {
        DebugLogger.error("TestData", "Failed to create test gallery image", { image: image.title, error });
      }
    }
  }

  // Criar agendamentos de teste
  static async createTestAppointments(clientIds: string[], serviceIds: string[]) {
    DebugLogger.log("TestData", "Creating test appointments");
    
    if (clientIds.length === 0 || serviceIds.length === 0) {
      DebugLogger.warn("TestData", "No clients or services available for appointments");
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    dayAfterTomorrow.setHours(14, 0, 0, 0);

    const testAppointments = [
      {
        clientId: clientIds[0],
        serviceId: serviceIds[0],
        date: tomorrow.toISOString(),
        status: "scheduled",
        price: "35.00",
        notes: "Cliente prefere esmalte vermelho"
      },
      {
        clientId: clientIds[1],
        serviceId: serviceIds[1],
        date: dayAfterTomorrow.toISOString(),
        status: "confirmed",
        price: "50.00",
        notes: "Primeira vez fazendo spa dos pés"
      }
    ];

    for (const appointment of testAppointments) {
      try {
        const result = await apiRequest("POST", "/api/appointments", appointment);
        DebugLogger.success("TestData", "Created test appointment", result);
      } catch (error) {
        DebugLogger.error("TestData", "Failed to create test appointment", error);
      }
    }
  }

  // Executar todos os testes
  static async generateAllTestData() {
    DebugLogger.log("TestData", "Starting comprehensive test data generation");
    
    try {
      // Criar clientes
      await this.createTestClients();
      
      // Aguardar um pouco para garantir que os clientes foram criados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar serviços
      await this.createTestServices();
      
      // Aguardar um pouco para garantir que os serviços foram criados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar galeria
      await this.createTestGalleryImages();
      
      // Buscar IDs dos clientes e serviços criados
      const clients = await apiRequest("GET", "/api/clients");
      const services = await apiRequest("GET", "/api/services");
      
      const clientIds = clients.map((c: any) => c.id);
      const serviceIds = services.map((s: any) => s.id);
      
      // Criar agendamentos
      await this.createTestAppointments(clientIds, serviceIds);
      
      DebugLogger.success("TestData", "All test data generated successfully", {
        clients: clientIds.length,
        services: serviceIds.length
      });
      
    } catch (error) {
      DebugLogger.error("TestData", "Failed to generate test data", error);
    }
  }
}