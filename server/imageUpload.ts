import multer from "multer";
import sharp from "sharp";
import { ObjectStorageService } from "./objectStorage";
import { randomUUID } from "crypto";

// Configuração do multer para upload em memória
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

// Serviço para processamento e upload de imagens
export class ImageUploadService {
  private objectStorageService: ObjectStorageService;

  constructor() {
    this.objectStorageService = new ObjectStorageService();
  }

  async processAndUploadImage(
    imageBuffer: Buffer,
    originalname: string,
    category: string = 'gallery'
  ): Promise<string> {
    try {
      // Gerar um ID único para a imagem
      const imageId = randomUUID();
      const extension = 'jpg'; // Sempre convertemos para JPG para otimização
      const filename = `${category}/${imageId}.${extension}`;

      // Processar imagem com Sharp para otimizar tamanho e qualidade
      const processedBuffer = await sharp(imageBuffer)
        .resize(800, 600, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();

      // Fazer upload para object storage
      const publicSearchPaths = this.objectStorageService.getPublicObjectSearchPaths();
      if (publicSearchPaths.length === 0) {
        throw new Error('Public object search paths not configured');
      }

      // Usar o primeiro path público disponível
      const basePath = publicSearchPaths[0];
      const fullPath = `${basePath}/${filename}`;
      
      // Parse do path para obter bucket e object name
      const { bucketName, objectName } = this.parseObjectPath(fullPath);
      
      // Upload para o bucket
      const bucket = this.objectStorageService.constructor.prototype.objectStorageClient?.bucket(bucketName);
      if (!bucket) {
        throw new Error('Failed to get storage bucket');
      }

      const file = bucket.file(objectName);
      
      await file.save(processedBuffer, {
        metadata: {
          contentType: 'image/jpeg',
          cacheControl: 'public, max-age=31536000', // 1 ano
        },
      });

      // Retornar a URL pública da imagem
      return `/public-objects/${filename}`;

    } catch (error) {
      console.error('Error processing and uploading image:', error);
      throw new Error('Falha ao processar e enviar imagem');
    }
  }

  private parseObjectPath(path: string): {
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
}