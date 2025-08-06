import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, DollarSign, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { Service } from "@shared/schema";

type ServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};

// Funções para interagir com o Firebase
const fetchServices = async (): Promise<Service[]> => {
  const servicesCollection = collection(db, "services");
  const serviceSnapshot = await getDocs(servicesCollection);
  const serviceList = serviceSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
    } as Service;
  });
  return serviceList;
};

const addService = async (service: Omit<ServiceData, 'id'>) => {
  const servicesCollection = collection(db, "services");
  const docRef = await addDoc(servicesCollection, {
    ...service,
    price: parseFloat(service.price),
    duration: parseInt(service.duration as any, 10),
    points: parseInt(service.points as any, 10),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return { id: docRef.id, ...service };
};

const updateService = async (id: string, service: Partial<ServiceData>) => {
  const serviceDoc = doc(db, "services", id);
  const dataToUpdate = {
    ...service,
    price: service.price ? parseFloat(service.price) : undefined,
    duration: service.duration ? parseInt(service.duration as any, 10) : undefined,
    points: service.points ? parseInt(service.points as any, 10) : undefined,
    updatedAt: Timestamp.now()
  };
  await updateDoc(serviceDoc, dataToUpdate);
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
      toast({
        title: "Serviço criado",
        description: "O novo serviço foi adicionado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Não foi possível criar o serviço: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ id, service }: { id: string, service: Partial<ServiceData> }) => updateService(id, service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsModalOpen(false);
      resetForm();
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o serviço: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({
        title: "Serviço removido",
        description: "O serviço foi removido com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Não foi possível remover o serviço: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setServiceForm({
      name: "",
      description: "",
      duration: "",
      price: "",
      imageUrl: "",
      points: ""
    });
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
      toast({
        title: "Campos obrigatórios",
        description: "Nome, Duração, Preço e Pontos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const serviceData = {
        ...serviceForm,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                  <img 
                    src={service.imageUrl || `https://api.dicebear.com/8.x/icons/svg?seed=${service.name}`}
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
                    <Button variant="outline" size="sm" onClick={() => handleOpenModal(service)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteService(service.id)} disabled={deleteServiceMutation.isPending}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
            <DialogDescription>
              {editingService ? "Modifique as informações do serviço." : "Preencha os dados para criar um novo serviço."}
            </DialogDescription>
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
