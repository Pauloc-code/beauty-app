import { useState, useRef } from "react";
import { Bell, Star, Camera } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MobileHeader() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const clientName = "Maria Silva";
  
  // Função para redimensionar e comprimir a imagem
  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        // Definir tamanho fixo para foto de perfil (100x100px)
        canvas.width = 100;
        canvas.height = 100;
        
        // Desenhar a imagem redimensionada
        ctx.drawImage(img, 0, 0, 100, 100);
        
        // Converter para base64 com qualidade reduzida (0.7)
        const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedImage);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };
  
  // Função para lidar com a seleção de imagem
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await resizeImage(file);
        setProfileImage(compressedImage);
        
        // Aqui você salvaria no banco de dados
        // await updateClientProfileImage(compressedImage);
        
        console.log('Imagem salva em formato comprimido');
      } catch (error) {
        console.error('Erro ao processar imagem:', error);
      }
    }
  };
  
  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  return (
    <div 
      className="p-4 text-white relative overflow-hidden"
      style={{ background: 'var(--header-gradient)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-8 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-4 left-8 w-24 h-24 bg-white rounded-full"></div>
      </div>
      
      <div className="relative">
        {/* Header with greeting and notification */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-full bg-yellow-400 overflow-hidden cursor-pointer relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={clientName} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {getInitials(clientName)}
                </div>
              )}
              
              {/* Overlay com ícone de câmera */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              
              {/* Input oculto para seleção de arquivo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-sm opacity-90">Boa tarde, seja bem-vinda!</p>
              <h2 className="text-lg font-bold">{clientName}</h2>
            </div>
          </div>
          
          <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Loyalty Program Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="font-semibold text-xs">Programa de Fidelidade</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">175</div>
              <div className="text-xs opacity-80">pontos</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-1">
            <div className="w-full bg-white/20 rounded-full h-1">
              <div 
                className="bg-yellow-400 h-1 rounded-full transition-all duration-500"
                style={{ width: '70%' }}
              ></div>
            </div>
          </div>
          
          <div className="text-xs">
            <span className="opacity-90">Faltam apenas 25 pontos para sua próxima recompensa</span>
          </div>
        </div>
      </div>
    </div>
  );
}