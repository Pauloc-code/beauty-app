import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Trash2, Camera } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

export default function GallerySection() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Gallery form
  const galleryForm = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Título é obrigatório"),
      category: z.string().min(1, "Categoria é obrigatória"),
      description: z.string().optional()
    })),
    defaultValues: {
      title: "",
      category: "",
      description: ""
    }
  });

  const { data: galleryImages, isLoading } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const uploadGalleryImageMutation = useMutation({
    mutationFn: async (data: { formData: FormData }) => {
      console.log("Uploading gallery image");
      const response = await fetch("/api/gallery/upload", {
        method: "POST",
        body: data.formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao enviar imagem");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Gallery image uploaded successfully:", data);
      toast({
        title: "Sucesso",
        description: "Foto enviada e adicionada à galeria com sucesso",
      });
      galleryForm.reset();
      setGalleryOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
    onError: (error) => {
      console.error("Error uploading gallery image:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar foto",
        variant: "destructive"
      });
    }
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
            <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Fotos
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Foto à Galeria</DialogTitle>
                </DialogHeader>
                <Form {...galleryForm}>
                  <form onSubmit={galleryForm.handleSubmit(
                    (data) => {
                      // Obter o arquivo do input
                      const fileInput = document.querySelector('#gallery-file-input') as HTMLInputElement;
                      const file = fileInput?.files?.[0];
                      
                      if (!file) {
                        toast({
                          title: "Erro",
                          description: "Selecione uma imagem",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      // Criar FormData para upload
                      const formData = new FormData();
                      formData.append('image', file);
                      formData.append('title', data.title);
                      formData.append('category', data.category);
                      if (data.description) {
                        formData.append('description', data.description);
                      }
                      
                      uploadGalleryImageMutation.mutate({ formData });
                    }
                  )} className="space-y-4">
                    <FormField
                      control={galleryForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título da Foto</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Nail art floral" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={galleryForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="nail-art">Nail Art</SelectItem>
                              <SelectItem value="manicure">Manicure</SelectItem>
                              <SelectItem value="pedicure">Pedicure</SelectItem>
                              <SelectItem value="alongamento">Alongamento</SelectItem>
                              <SelectItem value="decoracao">Decoração</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={galleryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição (Opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Descrição da foto..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Arquivo de Imagem</label>
                      <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <Camera className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Selecione uma imagem do seu dispositivo
                        </p>
                        <Input 
                          id="gallery-file-input"
                          type="file" 
                          accept="image/*" 
                          className="mt-2"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Validar tipo de arquivo
                              if (!file.type.startsWith('image/')) {
                                toast({
                                  title: "Erro",
                                  description: "Apenas arquivos de imagem são permitidos",
                                  variant: "destructive"
                                });
                                e.target.value = '';
                                return;
                              }
                              
                              // Validar tamanho (10MB max)
                              if (file.size > 10 * 1024 * 1024) {
                                toast({
                                  title: "Erro", 
                                  description: "A imagem deve ter no máximo 10MB",
                                  variant: "destructive"
                                });
                                e.target.value = '';
                                return;
                              }
                            }
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Máximo 10MB. Formatos: JPG, PNG, WEBP
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setGalleryOpen(false)}
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1"
                        disabled={uploadGalleryImageMutation.isPending}
                      >
                        {uploadGalleryImageMutation.isPending ? "Enviando..." : "Enviar para Galeria"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
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
              <button 
                onClick={() => setGalleryOpen(true)}
                className="border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors group"
              >
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
              <Button 
                onClick={() => setGalleryOpen(true)}
                className="bg-primary text-white"
              >
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
