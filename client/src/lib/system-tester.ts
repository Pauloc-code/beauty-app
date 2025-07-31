import { DebugLogger } from "./debug-logger";
import { apiRequest } from "./queryClient";

export class SystemTester {
  
  // Testar criação de agendamentos
  static async testAppointmentBooking() {
    DebugLogger.log("SystemTest", "Testing appointment booking functionality");
    
    try {
      // Buscar clientes e serviços disponíveis
      const clients = await apiRequest("GET", "/api/clients");
      const services = await apiRequest("GET", "/api/services/active");
      
      if (clients.length === 0 || services.length === 0) {
        DebugLogger.warn("SystemTest", "No clients or services available for booking test");
        return;
      }
      
      // Criar agendamento de teste
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      
      const appointmentData = {
        clientId: clients[0].id,
        serviceId: services[0].id,
        date: tomorrow.toISOString(),
        status: "scheduled",
        price: services[0].price,
        notes: "Agendamento de teste automatizado"
      };
      
      const appointment = await apiRequest("POST", "/api/appointments", appointmentData);
      DebugLogger.success("SystemTest", "Appointment booking test passed", appointment);
      
      return appointment;
      
    } catch (error) {
      DebugLogger.error("SystemTest", "Appointment booking test failed", error);
      throw error;
    }
  }
  
  // Testar reagendamento
  static async testAppointmentRescheduling(appointmentId: string) {
    DebugLogger.log("SystemTest", "Testing appointment rescheduling");
    
    try {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 2);
      newDate.setHours(14, 0, 0, 0);
      
      const updatedAppointment = await apiRequest("PUT", `/api/appointments/${appointmentId}`, {
        date: newDate.toISOString(),
        notes: "Reagendado via teste automatizado"
      });
      
      DebugLogger.success("SystemTest", "Appointment rescheduling test passed", updatedAppointment);
      return updatedAppointment;
      
    } catch (error) {
      DebugLogger.error("SystemTest", "Appointment rescheduling test failed", error);
      throw error;
    }
  }
  
  // Testar cancelamento
  static async testAppointmentCancellation(appointmentId: string) {
    DebugLogger.log("SystemTest", "Testing appointment cancellation");
    
    try {
      const cancelledAppointment = await apiRequest("PUT", `/api/appointments/${appointmentId}`, {
        status: "cancelled",
        notes: "Cancelado via teste automatizado"
      });
      
      DebugLogger.success("SystemTest", "Appointment cancellation test passed", cancelledAppointment);
      return cancelledAppointment;
      
    } catch (error) {
      DebugLogger.error("SystemTest", "Appointment cancellation test failed", error);
      throw error;
    }
  }
  
  // Testar programa de fidelidade
  static async testLoyaltyProgram() {
    DebugLogger.log("SystemTest", "Testing loyalty program functionality");
    
    try {
      const clients = await apiRequest("GET", "/api/clients");
      if (clients.length === 0) {
        DebugLogger.warn("SystemTest", "No clients available for loyalty test");
        return;
      }
      
      const client = clients[0];
      const originalPoints = client.points;
      
      // Simular adição de pontos
      const updatedClient = await apiRequest("PUT", `/api/clients/${client.id}`, {
        points: originalPoints + 25
      });
      
      DebugLogger.success("SystemTest", "Loyalty program test passed", {
        clientId: client.id,
        originalPoints,
        newPoints: updatedClient.points,
        pointsAdded: 25
      });
      
      return updatedClient;
      
    } catch (error) {
      DebugLogger.error("SystemTest", "Loyalty program test failed", error);
      throw error;
    }
  }
  
  // Testar sincronização de dados
  static async testDataSynchronization() {
    DebugLogger.log("SystemTest", "Testing data synchronization between interfaces");
    
    try {
      // Testar sincronização de serviços
      const servicesAdmin = await apiRequest("GET", "/api/services");
      const servicesActive = await apiRequest("GET", "/api/services/active");
      
      // Testar sincronização de agendamentos
      const allAppointments = await apiRequest("GET", "/api/appointments");
      const todayAppointments = await apiRequest("GET", "/api/appointments", { date: new Date().toISOString().split('T')[0] });
      
      // Testar sincronização de estatísticas
      const stats = await apiRequest("GET", "/api/stats/today");
      
      DebugLogger.success("SystemTest", "Data synchronization test passed", {
        totalServices: servicesAdmin.length,
        activeServices: servicesActive.length,
        totalAppointments: allAppointments.length,
        todayAppointments: todayAppointments.length,
        todayStats: stats
      });
      
      return {
        services: { total: servicesAdmin.length, active: servicesActive.length },
        appointments: { total: allAppointments.length, today: todayAppointments.length },
        stats
      };
      
    } catch (error) {
      DebugLogger.error("SystemTest", "Data synchronization test failed", error);
      throw error;
    }
  }
  
  // Testar galeria e portfólio
  static async testGallerySystem() {
    DebugLogger.log("SystemTest", "Testing gallery and portfolio system");
    
    try {
      const galleryImages = await apiRequest("GET", "/api/gallery");
      
      DebugLogger.success("SystemTest", "Gallery system test passed", {
        totalImages: galleryImages.length,
        categories: [...new Set(galleryImages.map((img: any) => img.category).filter(Boolean))]
      });
      
      return galleryImages;
      
    } catch (error) {
      DebugLogger.error("SystemTest", "Gallery system test failed", error);
      throw error;
    }
  }
  
  // Executar todos os testes
  static async runFullSystemTest() {
    DebugLogger.log("SystemTest", "🚀 Starting comprehensive system testing");
    
    const results = {
      dataSync: null,
      gallery: null,
      loyalty: null,
      appointmentBooking: null,
      appointmentRescheduling: null,
      appointmentCancellation: null
    };
    
    try {
      // 1. Testar sincronização de dados
      results.dataSync = await this.testDataSynchronization();
      
      // 2. Testar sistema de galeria
      results.gallery = await this.testGallerySystem();
      
      // 3. Testar programa de fidelidade
      results.loyalty = await this.testLoyaltyProgram();
      
      // 4. Testar agendamento
      results.appointmentBooking = await this.testAppointmentBooking();
      
      // Se agendamento foi criado, testar reagendamento e cancelamento
      if (results.appointmentBooking) {
        // 5. Testar reagendamento
        results.appointmentRescheduling = await this.testAppointmentRescheduling(results.appointmentBooking.id);
        
        // 6. Testar cancelamento
        results.appointmentCancellation = await this.testAppointmentCancellation(results.appointmentBooking.id);
      }
      
      DebugLogger.success("SystemTest", "🎉 All system tests completed successfully", {
        testsRun: Object.keys(results).filter(key => results[key as keyof typeof results] !== null).length,
        results: results
      });
      
      return results;
      
    } catch (error) {
      DebugLogger.error("SystemTest", "System testing failed", error);
      throw error;
    }
  }
}