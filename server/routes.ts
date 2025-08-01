import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema, insertServiceSchema, insertAppointmentSchema, insertGalleryImageSchema, insertTransactionSchema, systemSettings, appointments } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { ObjectStorageService } from "./objectStorage";

// Configuração do multer para upload em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/clients/login", async (req, res) => {
    try {
      const { cpf } = req.body;
      if (!cpf || cpf.length !== 11) {
        return res.status(400).json({ message: "CPF deve ter 11 dígitos" });
      }

      const client = await storage.getClientByCpf(cpf);
      if (!client) {
        return res.status(404).json({ message: "Cliente não encontrado" });
      }

      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      console.log("Received client data:", req.body);
      const clientData = insertClientSchema.parse(req.body);
      console.log("Parsed client data:", clientData);
      
      // Verificar se CPF já existe
      const existingClient = await storage.getClientByCpf(clientData.cpf);
      if (existingClient) {
        return res.status(409).json({ message: "Cliente já existe com este CPF" });
      }
      
      const client = await storage.createClient(clientData);
      console.log("Created client:", client);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, clientData);
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      await storage.deleteClient(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/active", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.patch("/api/services/:id", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, serviceData);
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const { date, clientId } = req.query;
      
      if (date) {
        const appointments = await storage.getAppointmentsByDate(new Date(date as string));
        return res.json(appointments);
      }
      
      if (clientId) {
        const appointments = await storage.getAppointmentsByClient(clientId as string);
        return res.json(appointments);
      }

      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      console.log("Received appointment data:", req.body);
      
      // Convert date string to Date object if needed
      const processedData = {
        ...req.body,
        date: typeof req.body.date === 'string' ? new Date(req.body.date) : req.body.date
      };
      
      console.log("Processed appointment data:", processedData);
      
      // Add default price if not provided
      if (!processedData.price) {
        processedData.price = "0.00";
      }

      // Validate appointment time with timezone service
      const settings = await storage.getSystemSettings();
      const { TimezoneService } = await import('./timezone-utils');
      const timezoneService = new TimezoneService(settings);
      
      const timeValidation = timezoneService.validateAppointmentTime(processedData.date);
      
      if (!timeValidation.valid) {
        return res.status(400).json({ 
          message: "Horário inválido", 
          error: timeValidation.message 
        });
      }
      
      const appointmentData = insertAppointmentSchema.parse(processedData);
      console.log("Parsed appointment data:", appointmentData);
      const appointment = await storage.createAppointment(appointmentData);
      console.log("Created appointment:", appointment);
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      
      // Convert date string to Date object if present
      if (updateData.date && typeof updateData.date === 'string') {
        updateData.date = new Date(updateData.date);
      }
      
      console.log("Updating appointment:", id, updateData);
      const updatedAppointment = await storage.updateAppointment(id, updateData);
      console.log("Updated appointment result:", updatedAppointment);
      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      await storage.deleteAppointment(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Upload de imagem para galeria
  app.post("/api/gallery/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
      }

      const { title, category, description } = req.body;
      
      if (!title || !category) {
        return res.status(400).json({ message: "Título e categoria são obrigatórios" });
      }

      // Gerar ID único para a imagem
      const imageId = randomUUID();
      const filename = `gallery/${category}/${imageId}.jpg`;

      // Processar imagem com Sharp para otimização
      const processedBuffer = await sharp(req.file.buffer)
        .resize(800, 600, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();

      // Obter configurações do object storage
      const objectStorageService = new ObjectStorageService();
      const publicSearchPaths = objectStorageService.getPublicObjectSearchPaths();
      
      if (publicSearchPaths.length === 0) {
        throw new Error('Object storage não configurado');
      }

      // Upload para object storage
      const basePath = publicSearchPaths[0];
      const fullPath = `${basePath}/${filename}`;
      
      const { bucketName, objectName } = parseObjectPath(fullPath);
      
      // Import client directly for upload
      const { objectStorageClient } = await import('./objectStorage');
      const bucket = objectStorageClient.bucket(bucketName);
      
      if (!bucket) {
        throw new Error('Falha ao acessar bucket de storage');
      }

      const file = bucket.file(objectName);
      
      await file.save(processedBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000',
        },
      });

      // Salvar informações no banco de dados
      const imageUrl = `/public-objects/${filename}`;
      const imageData = {
        url: imageUrl,
        title,
        description: description || null,
        category
      };

      const galleryImage = await storage.createGalleryImage(imageData);
      
      res.status(201).json({
        ...galleryImage,
        message: "Imagem enviada com sucesso"
      });

    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Falha ao enviar imagem" });
    }
  });

  app.post("/api/gallery", async (req, res) => {
    try {
      const imageData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.createGalleryImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid image data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create gallery image" });
    }
  });

  app.delete("/api/gallery/:id", async (req, res) => {
    try {
      await storage.deleteGalleryImage(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Servir arquivos públicos do object storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    try {
      const filePath = req.params.filePath;
      const objectStorageService = new ObjectStorageService();
      const file = await objectStorageService.searchPublicObject(filePath);
      
      if (!file) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }
      
      await objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving public object:", error);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Stats routes
  app.get("/api/stats/today", async (req, res) => {
    try {
      const stats = await storage.getTodayStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's stats" });
    }
  });

  // System Settings routes
  app.get("/api/system-settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching system settings:", error);
      res.status(500).json({ error: "Failed to fetch system settings" });
    }
  });

  app.put("/api/system-settings", async (req, res) => {
    try {
      const updatedSettings = await storage.updateSystemSettings(req.body);
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating system settings:", error);
      res.status(500).json({ error: "Failed to update system settings" });
    }
  });

  // Theme routes
  app.get("/api/theme", async (req, res) => {
    try {
      const theme = await storage.getTheme();
      res.json(theme);
    } catch (error) {
      console.error("Error fetching theme:", error);
      res.status(500).json({ error: "Failed to fetch theme" });
    }
  });

  app.put("/api/theme", async (req, res) => {
    try {
      const updatedTheme = await storage.updateTheme(req.body);
      res.json(updatedTheme);
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ error: "Failed to update theme" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Função auxiliar para parsing de path do object storage
function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}
