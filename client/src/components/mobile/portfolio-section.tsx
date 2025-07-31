import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Eye, Share2 } from "lucide-react";
import type { GalleryImage } from "@shared/schema";

export default function PortfolioSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  
  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ["/api/gallery"],
  });

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
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      title: "Gradiente em tons pastel",
      description: "Suave degradê com acabamento brilhante",
      category: "Degradê",
      createdAt: new Date()
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      title: "Arte floral delicada",
      description: "Flores pintadas à mão em tons naturais",
      category: "Floral",
      createdAt: new Date()
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      title: "Design moderno minimalista",
      description: "Linhas clean com detalhes dourados",
      category: "Minimalista",
      createdAt: new Date()
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1576502200272-341a4b8d5ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
      title: "Francesa moderna",
      description: "Clássica francesa com toque contemporâneo",
      category: "Francesa",
      createdAt: new Date()
    }
  ];

  const imagesToShow = galleryImages?.length ? galleryImages : defaultImages;

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
        {imagesToShow.map((image, index) => (
          <div
            key={image.id || index}
            onClick={() => setSelectedImage(selectedImage === image.id ? null : image.id || index.toString())}
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedImage === image.id || selectedImage === index.toString()
                ? "transform scale-105 z-10"
                : "hover:scale-[1.02]"
            }`}
          >
            <div className={`relative overflow-hidden rounded-2xl ${
              selectedImage === image.id || selectedImage === index.toString()
                ? "ring-3 ring-primary ring-offset-2 shadow-2xl"
                : "shadow-sm hover:shadow-lg"
            }`}>
              <img
                src={image.url}
                alt={image.title || `Trabalho ${index + 1}`}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Overlay com gradiente */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                selectedImage === image.id || selectedImage === index.toString()
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`} />
              
              {/* Conteúdo do overlay */}
              <div className={`absolute bottom-0 left-0 right-0 p-3 text-white transition-all duration-300 ${
                selectedImage === image.id || selectedImage === index.toString()
                  ? "transform translate-y-0 opacity-100"
                  : "transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              }`}>
                <h4 className="font-semibold text-sm mb-1">{image.title}</h4>
                {image.category && (
                  <span className="text-xs bg-primary px-2 py-1 rounded-full">
                    {image.category}
                  </span>
                )}
              </div>

              {/* Botões de ação */}
              <div className={`absolute top-3 right-3 flex space-x-2 transition-all duration-300 ${
                selectedImage === image.id || selectedImage === index.toString()
                  ? "transform translate-y-0 opacity-100"
                  : "transform -translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              }`}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(image.id || index.toString());
                  }}
                  className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
                    likedImages.has(image.id || index.toString())
                      ? "bg-red-500 text-white"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${
                    likedImages.has(image.id || index.toString()) ? "fill-current" : ""
                  }`} />
                </button>
                
                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200">
                  <Eye className="w-4 h-4" />
                </button>
                
                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Indicador de seleção */}
              {selectedImage === image.id || selectedImage === index.toString() && (
                <div className="absolute top-3 left-3">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal/Detalhes da imagem selecionada */}
      {selectedImage && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-white rounded-2xl p-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">
                {imagesToShow.find(img => img.id === selectedImage || imagesToShow.indexOf(img).toString() === selectedImage)?.title}
              </h4>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              {imagesToShow.find(img => img.id === selectedImage || imagesToShow.indexOf(img).toString() === selectedImage)?.description}
            </p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-primary text-white py-2 px-4 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                Agendar Esse Estilo
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {imagesToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📸</span>
          </div>
          <p className="text-gray-500 mb-4">Galeria em breve será atualizada!</p>
        </div>
      )}
    </div>
  );
}
