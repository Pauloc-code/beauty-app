import { 
  type User, 
  type InsertUser,
  type Client,
  type InsertClient,
  type Service,
  type InsertService,
  type Appointment,
  type InsertAppointment,
  type AppointmentService,
  type InsertAppointmentService,
  type AppointmentWithDetails,
  type GalleryImage,
  type InsertGalleryImage,
  type Transaction,
  type InsertTransaction,
  type SystemSettings,
  type InsertSystemSettings,
  users,
  clients,
  services,
  appointments,
  appointmentServices,
  galleryImages,
  transactions,
  systemSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client methods
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  getClientByCpf(cpf: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Service methods
  getServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // Appointment methods
  getAppointments(): Promise<AppointmentWithDetails[]>;
  getAppointmentsByDate(date: Date): Promise<AppointmentWithDetails[]>;
  getAppointmentsByClient(clientId: string): Promise<AppointmentWithDetails[]>;
  getAppointment(id: string): Promise<AppointmentWithDetails | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;

  // Appointment Services methods
  getAppointmentServices(appointmentId: string): Promise<(AppointmentService & { service: Service })[]>;
  addAppointmentService(appointmentService: InsertAppointmentService): Promise<AppointmentService>;
  updateAppointmentService(id: string, appointmentService: Partial<InsertAppointmentService>): Promise<AppointmentService>;
  removeAppointmentService(id: string): Promise<void>;

  // Gallery methods
  getGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  deleteGalleryImage(id: string): Promise<void>;

  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Stats methods
  getTodayStats(): Promise<{
    todayAppointments: number;
    todayRevenue: number;
    newClients: number;
    occupancyRate: number;
  }>;

  // Activities methods
  getRecentActivities(): Promise<Array<{
    id: string;
    type: 'appointment' | 'client' | 'gallery';
    action: string;
    description: string;
    timestamp: Date;
    icon: string;
    iconBg: string;
  }>>;

  // System Settings methods
  getSystemSettings(): Promise<SystemSettings[]>;
  getSystemSetting(key: string): Promise<SystemSettings | undefined>;
  upsertSystemSetting(key: string, value: string): Promise<SystemSettings>;
  initializeSystemSettings(): Promise<SystemSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientByCpf(cpf: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.cpf, cpf));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: string, updateClient: Partial<InsertClient>): Promise<Client> {
    const [client] = await db
      .update(clients)
      .set({ ...updateClient, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return client;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  }

  async getActiveServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.active, true)).orderBy(desc(services.createdAt));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  async updateService(id: string, updateService: Partial<InsertService>): Promise<Service> {
    const [service] = await db
      .update(services)
      .set({ ...updateService, updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getAppointments(): Promise<AppointmentWithDetails[]> {
    return await db
      .select()
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .orderBy(desc(appointments.date))
      .then(rows => 
        rows.map(row => ({
          ...row.appointments,
          client: row.clients!,
          service: row.services!
        }))
      );
  }

  async getAppointmentsByDate(date: Date): Promise<AppointmentWithDetails[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(
        gte(appointments.date, startOfDay),
        lte(appointments.date, endOfDay)
      ))
      .orderBy(appointments.date)
      .then(rows => 
        rows.map(row => ({
          ...row.appointments,
          client: row.clients!,
          service: row.services!
        }))
      );
  }

  async getAppointmentsByClient(clientId: string): Promise<AppointmentWithDetails[]> {
    return await db
      .select()
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.clientId, clientId))
      .orderBy(desc(appointments.date))
      .then(rows => 
        rows.map(row => ({
          ...row.appointments,
          client: row.clients!,
          service: row.services!
        }))
      );
  }

  async getAppointment(id: string): Promise<AppointmentWithDetails | undefined> {
    const rows = await db
      .select()
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.id, id));

    if (rows.length === 0) return undefined;

    const row = rows[0];
    return {
      ...row.appointments,
      client: row.clients!,
      service: row.services!
    };
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    return appointment;
  }

  async updateAppointment(id: string, updateAppointment: any): Promise<Appointment> {
    console.log("Updating appointment in DB:", id, updateAppointment);
    
    // Convert date string to Date object if needed
    const processedData = {
      ...updateAppointment,
      date: updateAppointment.date ? new Date(updateAppointment.date) : undefined,
      updatedAt: new Date()
    };
    
    // Remove undefined values
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === undefined) {
        delete processedData[key];
      }
    });
    
    console.log("Processed data for DB:", processedData);
    
    const [appointment] = await db
      .update(appointments)
      .set(processedData)
      .where(eq(appointments.id, id))
      .returning();
    
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    
    console.log("Updated appointment result:", appointment);
    return appointment;
  }

  async deleteAppointment(id: string): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Appointment Services methods
  async getAppointmentServices(appointmentId: string): Promise<(AppointmentService & { service: Service })[]> {
    return await db
      .select({
        id: appointmentServices.id,
        appointmentId: appointmentServices.appointmentId,
        serviceId: appointmentServices.serviceId,
        price: appointmentServices.price,
        createdAt: appointmentServices.createdAt,
        service: services
      })
      .from(appointmentServices)
      .leftJoin(services, eq(appointmentServices.serviceId, services.id))
      .where(eq(appointmentServices.appointmentId, appointmentId));
  }

  async addAppointmentService(appointmentService: InsertAppointmentService): Promise<AppointmentService> {
    const [created] = await db
      .insert(appointmentServices)
      .values(appointmentService)
      .returning();
    return created;
  }

  async updateAppointmentService(id: string, appointmentService: Partial<InsertAppointmentService>): Promise<AppointmentService> {
    const [updated] = await db
      .update(appointmentServices)
      .set(appointmentService)
      .where(eq(appointmentServices.id, id))
      .returning();
    return updated;
  }

  async removeAppointmentService(id: string): Promise<void> {
    await db.delete(appointmentServices).where(eq(appointmentServices.id, id));
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(desc(galleryImages.createdAt));
  }

  async createGalleryImage(insertImage: InsertGalleryImage): Promise<GalleryImage> {
    const [image] = await db
      .insert(galleryImages)
      .values(insertImage)
      .returning();
    return image;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }

  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getTodayStats(): Promise<{
    todayAppointments: number;
    todayRevenue: number;
    newClients: number;
    occupancyRate: number;
  }> {
    // Get system settings for timezone
    const settings = await this.getSystemSettings();
    const { createTimezoneService } = await import('./timezone-utils');
    const timezoneService = new (await import('./timezone-utils')).TimezoneService(settings);
    
    const allAppointments = await this.getAppointments();
    const today = new Date();
    
    const todayAppointmentsResult = allAppointments.filter(appointment => {
      return timezoneService.isSameLocalDay(appointment.date, today);
    });
    const todayAppointments = todayAppointmentsResult.length;

    const todayRevenue = todayAppointmentsResult
      .filter(app => app.status === 'completed')
      .reduce((sum, app) => sum + parseFloat(app.price), 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);
    const newClientsResult = await db
      .select()
      .from(clients)
      .where(gte(clients.createdAt, startOfWeek));
    const newClients = newClientsResult.length;

    // Simple occupancy calculation (8 hours * 60 minutes / average 45 min per appointment)
    const totalSlots = Math.floor((8 * 60) / 45);
    const occupancyRate = Math.round((todayAppointments / totalSlots) * 100);

    return {
      todayAppointments,
      todayRevenue,
      newClients,
      occupancyRate: Math.min(occupancyRate, 100)
    };
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    const [existing] = await db.select().from(systemSettings).limit(1);
    
    if (existing) {
      return existing;
    }

    // Create default settings
    const [newSettings] = await db
      .insert(systemSettings)
      .values({
        timezone: "America/Sao_Paulo",
        showHolidays: true,
        holidayRegion: "sao_paulo",
        workingDays: [1, 2, 3, 4, 5, 6],
        workingHours: { start: "08:00", end: "18:00" }
      })
      .returning();

    return newSettings;
  }

  async updateSystemSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.getSystemSettings();
    
    // Remove campos que não devem ser atualizados pelo usuário
    const { id, createdAt, updatedAt, ...userUpdates } = updates as any;
    
    const [updated] = await db
      .update(systemSettings)
      .set({
        ...userUpdates,
        updatedAt: new Date()
      })
      .where(eq(systemSettings.id, current.id))
      .returning();

    return updated;
  }

  // Theme Settings
  async getTheme(): Promise<any> {
    // For now, return default theme - you can implement theme table later
    return {
      id: "1",
      name: "Rosa Clássico",
      primaryColor: "#ec4899",
      secondaryColor: "#f9a8d4",
      accentColor: "#fce7f3",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  async updateTheme(themeData: any): Promise<any> {
    // For now, just return the updated theme - you can implement theme table later
    return {
      id: "1",
      ...themeData,
      updatedAt: new Date().toISOString()
    };
  }

  async getRecentActivities(): Promise<Array<{
    id: string;
    type: 'appointment' | 'client' | 'gallery';
    action: string;
    description: string;
    timestamp: Date;
    icon: string;
    iconBg: string;
  }>> {
    const activities: Array<{
      id: string;
      type: 'appointment' | 'client' | 'gallery';
      action: string;
      description: string;
      timestamp: Date;
      icon: string;
      iconBg: string;
    }> = [];

    try {
      // Get recent appointments (last 10)
      const recentAppointments = await db
        .select({
          id: appointments.id,
          status: appointments.status,
          clientName: clients.name,
          serviceName: services.name,
          updatedAt: appointments.updatedAt,
          createdAt: appointments.createdAt,
        })
        .from(appointments)
        .leftJoin(clients, eq(appointments.clientId, clients.id))
        .leftJoin(services, eq(appointments.serviceId, services.id))
        .orderBy(desc(appointments.updatedAt))
        .limit(5);

      for (const appointment of recentAppointments) {
        let action = 'criado';
        let icon = 'Calendar';
        let iconBg = 'bg-blue-100';
        
        if (appointment.status === 'completed') {
          action = 'concluído';
          icon = 'Check';
          iconBg = 'bg-green-100';
        } else if (appointment.status === 'no_show') {
          action = 'faltou';
          icon = 'X';
          iconBg = 'bg-red-100';
        } else if (appointment.status === 'confirmed') {
          action = 'confirmado';
          icon = 'Check';
          iconBg = 'bg-green-100';
        }

        activities.push({
          id: appointment.id,
          type: 'appointment',
          action,
          description: `Agendamento ${action}: ${appointment.clientName} - ${appointment.serviceName}`,
          timestamp: appointment.updatedAt || appointment.createdAt,
          icon,
          iconBg
        });
      }

      // Get recent clients (last 5)
      const recentClients = await db
        .select()
        .from(clients)
        .orderBy(desc(clients.createdAt))
        .limit(3);

      for (const client of recentClients) {
        activities.push({
          id: client.id,
          type: 'client',
          action: 'cadastrado',
          description: `Nova cliente cadastrada: ${client.name}`,
          timestamp: client.createdAt,
          icon: 'UserPlus',
          iconBg: 'bg-blue-100'
        });
      }

      // Get recent gallery images (last 3)
      const recentImages = await db
        .select()
        .from(galleryImages)
        .orderBy(desc(galleryImages.createdAt))
        .limit(2);

      for (const image of recentImages) {
        activities.push({
          id: image.id,
          type: 'gallery',
          action: 'adicionada',
          description: `Foto adicionada à galeria: ${image.title}`,
          timestamp: image.createdAt,
          icon: 'Camera',
          iconBg: 'bg-purple-100'
        });
      }

      // Sort all activities by timestamp (most recent first)
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Return only the 6 most recent activities
      return activities.slice(0, 6);

    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
