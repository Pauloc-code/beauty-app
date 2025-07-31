import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertService, Service } from "@shared/schema";

export default function ServicesSection() {
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
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

  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services"],
  });

  const createServiceMutation = useMutation({
    mutationFn: async (service: InsertService) => await apiRequest("POST", "/api/services", service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsNewServiceOpen(false);
      resetForm();
      toast({
        title: "Serviço criado",
        description: "Serviço foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o serviço.",
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, service }: { id: string, service: Partial<InsertService> }) =>
      await apiRequest("PATCH", `/api/services/${id}`, service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setEditingService(null);
      resetForm();
      toast({
        title: "Serviço atualizado",
        description: "Serviço foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o serviço.",
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => await apiRequest("DELETE", `/api/services/${serviceId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço removido",
        description: "Serviço foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível remover o serviço.",
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
  };

  const handleOpenNewService = () => {
    resetForm();
    setIsNewServiceOpen(true);
  };

  const handleEditService = (service: Service) => {
    setServiceForm({
      name: service.name,
      description: service.description || "",
      duration: service.duration.toString(),
      price: service.price.toString(),
      imageUrl: service.imageUrl || "",
      points: service.points.toString()
    });
    setEditingService(service);
  };

  const handleSaveService = () => {
    if (!serviceForm.name || !serviceForm.duration || !serviceForm.price || !serviceForm.points) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, duração, preço e pontos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const serviceData: InsertService = {
      name: serviceForm.name.trim(),
      description: serviceForm.description?.trim() || undefined,
      duration: parseInt(serviceForm.duration),
      price: serviceForm.price,
      imageUrl: serviceForm.imageUrl?.trim() || undefined,
      points: parseInt(serviceForm.points),
      active: true
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

  const defaultServices = [
    {
      id: "1",
      name: "Esmaltação em Gel",
      duration: 45,
      price: "35.00",
      points: 10,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
    },
    {
      id: "2", 
      name: "Spa dos Pés",
      duration: 60,
      price: "50.00",
      points: 15,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
    },
    {
      id: "3",
      name: "Unhas de Fibra", 
      duration: 90,
      price: "80.00",
      points: 25,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"
    }
  ];

  const servicesToShow = services?.length ? services : defaultServices;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Gestão de Serviços</h2>
            <Button onClick={handleOpenNewService} className="bg-primary text-white hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </div>
        
        <CardContent className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-10"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesToShow.map((service) => (
                <Card key={service.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={service.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                          alt={service.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-600">{service.duration} minutos</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-primary"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => handleDeleteService(service.id)}
                          disabled={deleteServiceMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preço:</span>
                        <span className="font-semibold text-primary">
                          R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pontos:</span>
                        <Badge variant="secondary" className="bg-accent text-white text-xs">
                          +{service.points}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge 
                          className={service.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                          }
                        >
                          {service.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(!services || services.length === 0) && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nenhum serviço cadastrado</p>
              <Button className="bg-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeiro serviço
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Modal */}
      <Dialog open={isNewServiceOpen || !!editingService} onOpenChange={(open) => {
        if (!open) {
          setIsNewServiceOpen(false);
          setEditingService(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="serviceName">Nome *</Label>
              <Input
                id="serviceName"
                value={serviceForm.name}
                onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do serviço"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={serviceForm.description}
                onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do serviço"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duração (min) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="45"
                />
              </div>
              <div>
                <Label htmlFor="points">Pontos *</Label>
                <Input
                  id="points"
                  type="number"
                  value={serviceForm.points}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, points: e.target.value }))}
                  placeholder="10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={serviceForm.price}
                onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                placeholder="35.00"
              />
            </div>
            <div>
              <Label htmlFor="imageUrl">URL da Imagem</Label>
              <Input
                id="imageUrl"
                value={serviceForm.imageUrl}
                onChange={(e) => setServiceForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsNewServiceOpen(false);
                setEditingService(null);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveService} 
                disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
              >
                {createServiceMutation.isPending || updateServiceMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
