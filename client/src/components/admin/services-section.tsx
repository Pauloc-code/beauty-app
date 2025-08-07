import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, DollarSign, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { Service, InsertService } from "@shared/schema";

// --- Funções do Firebase ---
const fetchServices = async (): Promise<Service[]> => {
  const servicesCollection = collection(db, "services");
  const serviceSnapshot = await getDocs(servicesCollection);
  return serviceSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as Service;
  });
};

const addService = async (service: Omit<InsertService, 'createdAt' | 'updatedAt'>) => {
  const servicesCollection = collection(db, "services");
  await addDoc(servicesCollection, {
    ...service,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
};

const updateService = async ({ id, service }: { id: string, service: Partial<InsertService> }) => {
  const serviceDoc = doc(db, "services", id);
  await updateDoc(serviceDoc, {
    ...service,
    updatedAt: Timestamp.now()
  });
};

const deleteService = async (id: string) => {
  const serviceDoc = doc(db, "services", id);
  await deleteDoc(serviceDoc);
};

export default function ServicesSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    imageUrl: "",
    points: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  const createServiceMutation = useMutation({
    mutationFn: addService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsModalOpen(false);
      resetForm();
      toast({ title: "Serviço criado com sucesso." });
    },
    onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const updateServiceMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsModalOpen(false);
      resetForm();
      toast({ title: "Serviço atualizado com sucesso." });
    },
    onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Serviço removido com sucesso." });
    },
    onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const resetForm = () => {
    setServiceForm({ name: "", description: "", duration: "", price: "", imageUrl: "", points: "" });
    setEditingService(null);
  };

  const handleOpenModal = (service: Service | null = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        name: service.name,
        description: service.description || "",
        duration: service.duration.toString(),
        price: service.price.toString(),
        imageUrl: service.imageUrl || "",
        points: service.points.toString()
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSaveService = () => {
    const { name, duration, price, points } = serviceForm;
    if (!name || !duration || !price || !points) {
      toast({ title: "Campos obrigatórios", description: "Nome, Duração, Preço e Pontos são obrigatórios.", variant: "destructive" });
      return;
    }

    const serviceData: Omit<InsertService, 'createdAt' | 'updatedAt'> = {
      name: serviceForm.name,
      description: serviceForm.description,
      duration: parseInt(serviceForm.duration, 10),
      price: serviceForm.price,
      points: parseInt(serviceForm.points, 10),
      imageUrl: serviceForm.imageUrl,
      active: true,
    };

    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, service: serviceData });
    } else {
      createServiceMutation.mutate(serviceData);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm("Tem certeza que deseja remover este serviço?")) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Gestão de Serviços</h2>
            <Button onClick={() => handleOpenModal()} className="bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {isLoading ? <p>Carregando serviços...</p> : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <img 
                    src={service.imageUrl || `https://placehold.co/80x80/fce7f3/ec4899?text=${service.name.charAt(0)}`}
                    alt={service.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {service.duration} min</span>
                      <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1" /> R$ {Number(service.price).toFixed(2)}</span>
                      <span className="flex items-center"><Star className="w-4 h-4 mr-1" /> {service.points} pts</span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(service)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteService(service.id)} disabled={deleteServiceMutation.isPending}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription>{editingService ? "Modifique as informações do serviço." : "Preencha os dados para criar um novo serviço."}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome do Serviço *</Label>
              <Input id="name" value={serviceForm.name} onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" value={serviceForm.description} onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duração (min) *</Label>
                <Input id="duration" type="number" value={serviceForm.duration} onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input id="price" type="number" step="0.01" value={serviceForm.price} onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="points">Pontos *</Label>
                <Input id="points" type="number" value={serviceForm.points} onChange={(e) => setServiceForm(prev => ({ ...prev, points: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input id="imageUrl" value={serviceForm.imageUrl} onChange={(e) => setServiceForm(prev => ({ ...prev, imageUrl: e.target.value }))} />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveService} disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
                {createServiceMutation.isPending || updateServiceMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
