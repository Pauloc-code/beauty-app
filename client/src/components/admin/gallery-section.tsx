import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Eye, Trash2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp, query, orderBy } from "firebase/firestore";
import type { GalleryImage, InsertGalleryImage } from "@shared/schema";

// --- Funções do Firebase ---
const fetchGalleryImages = async (): Promise<GalleryImage[]> => {
    const q = query(collection(db, "galleryImages"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
        } as GalleryImage;
    });
};

const addGalleryImage = async (data: { imageFile: File, title: string, category: string, description?: string }) => {
    const { imageFile, ...imageData } = data;

    // 1. Upload da imagem para o Firebase Storage
    const storage = getStorage();
    const storageRef = ref(storage, `gallery/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 2. Salvar os dados da imagem no Firestore
    const imageDoc: InsertGalleryImage = {
        ...imageData,
        url: downloadURL,
        createdAt: Timestamp.now(),
    };
    await addDoc(collection(db, "galleryImages"), imageDoc);
};

const deleteGalleryImage = async (imageId: string) => {
    // Nota: Isto apaga apenas o registo no Firestore, não o arquivo no Storage.
    // A remoção do arquivo no Storage pode ser implementada posteriormente se necessário.
    await deleteDoc(doc(db, "galleryImages", imageId));
};


export default function GallerySection() {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const galleryForm = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Título é obrigatório"),
      category: z.string().min(1, "Categoria é obrigatória"),
      description: z.string().optional(),
      imageFile: z.instanceof(File, { message: "Por favor, selecione uma imagem." }),
    })),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      imageFile: undefined,
    }
  });

  const { data: galleryImages = [], isLoading } = useQuery({
    queryKey: ["galleryImages"],
    queryFn: fetchGalleryImages,
  });

  const uploadGalleryImageMutation = useMutation({
    mutationFn: addGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      toast({ title: "Sucesso", description: "Foto enviada para a galeria." });
      galleryForm.reset();
      setGalleryOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Erro ao enviar foto: ${error.message}`, variant: "destructive" });
    }
  });

  const deleteImageMutation = useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryImages"] });
      toast({ title: "Imagem removida", description: "A imagem foi removida da galeria." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Não foi possível remover a imagem: ${error.message}`, variant: "destructive" });
    },
  });

  const handleDeleteImage = (imageId: string) => {
    if (confirm("Tem certeza que deseja remover esta imagem?")) {
      deleteImageMutation.mutate(imageId);
    }
  };

  return (
    <div className="space-y-6">
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
                <DialogHeader><DialogTitle>Adicionar Foto à Galeria</DialogTitle></DialogHeader>
                <Form {...galleryForm}>
                  <form onSubmit={galleryForm.handleSubmit(data => uploadGalleryImageMutation.mutate(data))} className="space-y-4">
                    <FormField control={galleryForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Ex: Nail art floral" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={galleryForm.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger></FormControl><SelectContent><SelectItem value="nail-art">Nail Art</SelectItem><SelectItem value="manicure">Manicure</SelectItem><SelectItem value="pedicure">Pedicure</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={galleryForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Opcional" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={galleryForm.control} name="imageFile" render={({ field: { onChange, value, ...rest }}) => (<FormItem><FormLabel>Imagem</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setGalleryOpen(false)}>Cancelar</Button>
                      <Button type="submit" disabled={uploadGalleryImageMutation.isPending}>{uploadGalleryImageMutation.isPending ? "Enviando..." : "Enviar"}</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <CardContent className="p-6">
          {isLoading ? <p>Carregando galeria...</p> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image) => (
                <div key={image.id} className="relative group">
                  <img src={image.url} alt={image.title || "Imagem da galeria"} className="w-full h-40 object-cover rounded-lg" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <Button variant="outline" size="sm" className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100"><Eye className="w-4 h-4" /></Button>
                      <Button variant="outline" size="sm" className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50" onClick={() => handleDeleteImage(image.id)} disabled={deleteImageMutation.isPending}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
