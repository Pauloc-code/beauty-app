import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Expand } from "lucide-react";

export default function PortfolioSection() {
  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const defaultImages = [
    {
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Nail art com design geométrico colorido"
    },
    {
      url: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Design de unhas para noiva com detalhes em pérola"
    },
    {
      url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Gradiente em tons pastel com brilho"
    },
    {
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Arte floral delicada em tons nude"
    }
  ];

  const imagesToShow = galleryImages?.length ? galleryImages : defaultImages;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Portfólio</h3>
          <p className="text-gray-600">Nossos trabalhos mais recentes</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full h-40 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">Portfólio</h3>
        <p className="text-gray-600">Nossos trabalhos mais recentes</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {imagesToShow.map((image, index) => (
          <div key={image.id || index} className="relative group">
            <img
              src={image.url}
              alt={image.title || `Trabalho ${index + 1}`}
              className="w-full h-40 object-cover rounded-lg gallery-image"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
              <Expand className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {(!galleryImages || galleryImages.length === 0) && (
        <Card className="mt-6 p-4 text-center">
          <p className="text-gray-500">Galeria em breve será atualizada com nossos trabalhos mais recentes!</p>
        </Card>
      )}
    </div>
  );
}
