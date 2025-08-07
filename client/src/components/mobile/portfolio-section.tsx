import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Eye, Share2 } from "lucide-react";
import type { GalleryImage } from "@shared/schema";

// Dados de exemplo que já existiam no seu ficheiro
const defaultImages: GalleryImage[] = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      title: "Nail art com design geométrico colorido",
      description: "Arte moderna com padrões geométricos vibrantes",
      category: "Nail Art",
      createdAt: new Date()
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      title: "Design de unhas para noiva",
      description: "Elegante design nupcial com detalhes em pérola",
      category: "Noiva",
      createdAt: new Date()
    },
    // ...outras imagens de exemplo...
];

// Função de fetch simulada para o React Query
const fetchGallery = async (): Promise<GalleryImage[]> => {
  // Simula um atraso de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  // Retorna os dados de exemplo
  // No futuro, pode substituir isto por uma chamada real ao Firestore
  return defaultImages;
};

export default function PortfolioSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  
  // A chamada ao useQuery foi corrigida
  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ["gallery"], // Chave de query corrigida
    queryFn: fetchGallery, // queryFn adicionada
  });

  const imagesToShow = galleryImages || [];

  const toggleLike = (imageId: string) => {
    const newLikedImages = new Set(likedImages);
    if (newLikedImages.has(imageId)) {
      newLikedImages.delete(imageId);
    } else {
      newLikedImages.add(imageId);
    }
    setLikedImages(newLikedImages);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Portfólio</h3>
          <p className="text-gray-600 text-sm">Nossos trabalhos mais incríveis</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-full h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Portfólio</h3>
        <p className="text-gray-600 text-sm">Nossos trabalhos mais incríveis</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {imagesToShow.map((image: GalleryImage, index: number) => (
          <div
            key={image.id || index}
            onClick={() => setSelectedImage(selectedImage === image.id ? null : image.id || index.toString())}
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedImage === image.id || selectedImage === index.toString()
                ? "transform scale-105 z-10"
                : "hover:scale-[1.02]"
            }`}
          >
            <div 
              className={`relative overflow-hidden rounded-2xl ${
                selectedImage === image.id || selectedImage === index.toString()
                  ? "ring-3 ring-offset-2 shadow-2xl"
                  : "shadow-sm hover:shadow-lg"
              }`}
              style={(selectedImage === image.id || selectedImage === index.toString()) ? {
                '--tw-ring-color': 'var(--primary-color)'
              } as React.CSSProperties : {}}
            >
              <img
                src={image.url}
                alt={image.title || `Trabalho ${index + 1}`}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                selectedImage === image.id || selectedImage === index.toString()
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`} />
              
              <div className={`absolute bottom-0 left-0 right-0 p-3 text-white transition-all duration-300 ${
                selectedImage === image.id || selectedImage === index.toString()
                  ? "transform translate-y-0 opacity-100"
                  : "transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              }`}>
                <h4 className="font-semibold text-sm mb-1">{image.title}</h4>
                {image.category && (
                  <span 
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: 'var(--primary-color)' }}
                  >
                    {image.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
