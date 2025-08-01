import { 
  type User, 
  type InsertUser,
  type Client,
  type InsertClient,
  type Service,
  type InsertService,
  type Appointment,
  type InsertAppointment,
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

  // System Settings methods
  getSystemSettings(): Promise<SystemSettings[]>;
  getSystemSetting(key: string): Promise<SystemSettings | undefined>;
  upsertSystemSetting(key: string, value: string): Promise<SystemSettings>;
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
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todayAppointmentsResult = await this.getAppointmentsByDate(today);
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

  async getSystemSettings(): Promise<SystemSettings[]> {
    return await db.select().from(systemSettings);
  }

  async getSystemSetting(key: string): Promise<SystemSettings | undefined> {
    const [setting] = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key));
    return setting;
  }

  async upsertSystemSetting(key: string, value: string): Promise<SystemSettings> {
    const existing = await this.getSystemSetting(key);
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(systemSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values({ key, value })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
