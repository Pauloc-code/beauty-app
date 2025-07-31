import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GallerySection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => apiRequest("DELETE", `/api/gallery/${imageId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Imagem removida",
        description: "Imagem foi removida da galeria com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a imagem.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteImage = (imageId: string) => {
    if (confirm("Tem certeza que deseja remover esta imagem?")) {
      deleteImageMutation.mutate(imageId);
    }
  };

  const defaultImages = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Design artístico com padrões geométricos"
    },
    {
      id: "2", 
      url: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Elegante design nupcial com detalhes refinados"
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300", 
      title: "Suave gradiente com acabamento brilhante"
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Delicada arte floral em tons naturais"
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Criativo nail art com elementos modernos"
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1576502200272-341a4b8d5ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Clássica manicure francesa com toque moderno"
    }
  ];

  const imagesToShow = galleryImages?.length ? galleryImages : defaultImages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Gestão da Galeria</h2>
            <Button className="bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Upload Fotos
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="w-full h-40 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {imagesToShow.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.title || "Imagem da galeria"}
                    className="w-full h-40 object-cover rounded-lg gallery-image"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={deleteImageMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Upload placeholder */}
              <button className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors group">
                <div className="text-center">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary mx-auto mb-2 transition-colors" />
                  <p className="text-gray-500 group-hover:text-primary text-sm transition-colors">
                    Adicionar Foto
                  </p>
                </div>
              </button>
            </div>
          )}

          {(!galleryImages || galleryImages.length === 0) && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhuma imagem na galeria</p>
              <Button className="bg-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeira foto
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
