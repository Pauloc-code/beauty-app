import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import StatsCard from "@/components/ui/stats-card";
import { 
  Calendar, 
  DollarSign, 
  UserPlus, 
  TrendingUp,
  CalendarPlus,
  Users,
  Megaphone,
  Camera,
  Edit,
  X,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export default function DashboardSection() {
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/today"],
  });

  const { data: allAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
  });

  // Filtrar agendamentos do dia atual no cliente
  const todayAppointments = allAppointments?.filter((appointment: any) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  }) || [];

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

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

  const appointmentForm = useForm({
    resolver: zodResolver(z.object({
      clientId: z.string().min(1, "Cliente é obrigatório"),
      serviceId: z.string().min(1, "Serviço é obrigatório"),
      date: z.string().min(1, "Data é obrigatória"),
      time: z.string().min(1, "Horário é obrigatório"),
      notes: z.string().optional(),
      price: z.string().optional(),
      status: z.string().optional()
    })),
    defaultValues: {
      clientId: "",
      serviceId: "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      status: "scheduled",
      notes: ""
    },
    mode: "onChange"
  });

  // Create client form
  const clientForm = useForm({
    resolver: zodResolver(z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(11, "CPF deve ter 11 dígitos"),
      email: z.string().email("Email inválido").optional().or(z.literal("")),
      phone: z.string().min(1, "Telefone é obrigatório"),
      notes: z.string().optional()
    })),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      notes: ""
    }
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating client with data:", data);
      const response = await apiRequest("POST", "/api/clients", data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Client created successfully:", data);
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso",
      });
      clientForm.reset();
      setNewClientOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    },
    onError: (error) => {
      console.error("Error creating client:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar cliente",
        variant: "destructive"
      });
    }
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

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Dados do formulário:", data);
      
      // Buscar o serviço para obter o preço
      const selectedService = (services as any[]).find((s: any) => s.id === data.serviceId);
      if (!selectedService) {
        throw new Error("Serviço não encontrado");
      }
      
      const appointmentData = {
        clientId: data.clientId,
        serviceId: data.serviceId,
        date: new Date(`${data.date}T${data.time}:00.000Z`),
        status: data.status || "scheduled",
        price: selectedService.price,
        notes: data.notes || ""
      };
      
      console.log("Dados enviados para API:", appointmentData);
      return apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/today"] });
      setNewAppointmentOpen(false);
      appointmentForm.reset();
      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar agendamento",
        variant: "destructive"
      });
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      console.log("Updating appointment:", id, data);
      return await apiRequest("PUT", `/api/appointments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/today"] });
      toast({
        title: "Sucesso",
        description: "Status do agendamento atualizado!",
      });
    },
    onError: (error) => {
      console.error("Update appointment error:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar agendamento",
        variant: "destructive"
      });
    }
  });

  const handleCompleteAppointment = (appointment: any) => {
    setSelectedAppointment(appointment);
    setPaymentModalOpen(true);
  };

  const handleNoShowAppointment = (appointment: any) => {
    updateAppointmentMutation.mutate({
      id: appointment.id,
      data: { status: 'no_show' }
    });
  };

  const handlePaymentSubmit = (paymentMethod: string) => {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        id: selectedAppointment.id,
        data: { 
          status: 'completed',
          paymentMethod: paymentMethod,
          paymentStatus: 'paid'
        }
      });
      setPaymentModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Agendamentos Hoje"
          value={(stats as any)?.todayAppointments?.toString() || "0"}
          change="+12%"
          changeLabel="vs. ontem"
          icon={Calendar}
          loading={statsLoading}
        />
        
        <StatsCard
          title="Faturamento Hoje"
          value={`R$ ${(stats as any)?.todayRevenue?.toFixed(2).replace('.', ',') || "0,00"}`}
          change="+8%"
          changeLabel="vs. ontem"
          icon={DollarSign}
          variant="success"
          loading={statsLoading}
        />
        
        <StatsCard
          title="Novos Clientes"
          value={(stats as any)?.newClients?.toString() || "0"}
          change="+25%"
          changeLabel="vs. semana passada"
          icon={UserPlus}
          variant="info"
          loading={statsLoading}
        />
        
        <StatsCard
          title="Taxa de Ocupação"
          value={`${(stats as any)?.occupancyRate || 0}%`}
          change="+5%"
          changeLabel="vs. média mensal"
          icon={TrendingUp}
          variant="warning"
          loading={statsLoading}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Agenda de Hoje</h3>
                <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-white hover:bg-primary/90">
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Novo Agendamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md" aria-describedby="new-appointment-description">
                    <DialogHeader>
                      <DialogTitle>Novo Agendamento</DialogTitle>
                      <p id="new-appointment-description" className="text-sm text-gray-600">
                        Crie um novo agendamento selecionando cliente, serviço, data e horário.
                      </p>
                    </DialogHeader>
                    <Form {...appointmentForm}>
                      <form onSubmit={appointmentForm.handleSubmit(
                        (data) => {
                          console.log("Submitting form with data:", data);
                          createAppointmentMutation.mutate(data);
                        },
                        (errors) => {
                          console.log("Form validation errors:", errors);
                          toast({
                            title: "Erro de validação",
                            description: "Preencha todos os campos obrigatórios",
                            variant: "destructive"
                          });
                        }
                      )} className="space-y-4">
                        <FormField
                          control={appointmentForm.control}
                          name="clientId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cliente</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um cliente" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(clients as any[]).map((client: any) => (
                                    <SelectItem key={client.id} value={client.id}>
                                      {client.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={appointmentForm.control}
                          name="serviceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Serviço</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um serviço" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(services as any[]).map((service: any) => (
                                    <SelectItem key={service.id} value={service.id}>
                                      {service.name} - R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={appointmentForm.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={appointmentForm.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={appointmentForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações</FormLabel>
                              <FormControl>
                                <Input placeholder="Observações (opcional)" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setNewAppointmentOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={createAppointmentMutation.isPending}
                            className="bg-primary text-white hover:bg-primary/90"
                          >
                            {createAppointmentMutation.isPending ? "Criando..." : "Criar Agendamento"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <CardContent className="p-6">
              {appointmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 bg-secondary rounded-lg animate-pulse">
                      <div className="text-center">
                        <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-8"></div>
                      </div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="flex space-x-1">
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (todayAppointments as any[])?.length ? (
                <div className="space-y-4">
                  {(todayAppointments as any[]).map((appointment: any) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-secondary rounded-lg">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">
                          {format(new Date(appointment.date), "HH:mm")}
                        </p>
                        <p className="text-xs text-gray-500">{appointment.service.duration}min</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{appointment.client.name}</p>
                        <p className="text-sm text-gray-600">{appointment.service.name}</p>
                        <p className="text-sm text-gray-500">{appointment.client.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          R$ {parseFloat(appointment.price).toFixed(2).replace('.', ',')}
                        </p>
                        <div className="flex flex-col space-y-1 mt-2">
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 text-gray-400 hover:text-green-600"
                              onClick={() => handleCompleteAppointment(appointment)}
                              disabled={appointment.status === 'completed'}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="p-1 text-gray-400 hover:text-yellow-600"
                              onClick={() => handleNoShowAppointment(appointment)}
                              disabled={appointment.status === 'no_show'}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-xs">
                            {appointment.status === 'completed' && <span className="text-green-600">✓ Concluído</span>}
                            {appointment.status === 'no_show' && <span className="text-yellow-600">! Faltou</span>}
                            {appointment.status === 'scheduled' && <span className="text-blue-600">Agendado</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum agendamento para hoje</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activities */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => setNewAppointmentOpen(true)}
                  className="w-full bg-primary text-white p-3 rounded-lg font-medium text-left justify-start hover:bg-primary/90"
                >
                  <CalendarPlus className="w-5 h-5 mr-3" />
                  Novo Agendamento
                </Button>
                <Button 
                  onClick={() => {
                    console.log("Opening new client modal");
                    setNewClientOpen(true);
                  }}
                  variant="outline" 
                  className="w-full p-3 rounded-lg font-medium text-left justify-start"
                >
                  <UserPlus className="w-5 h-5 mr-3" />
                  Cadastrar Cliente
                </Button>
                <Button 
                  onClick={() => {
                    console.log("Opening promotion modal");
                    setPromotionOpen(true);
                  }}
                  variant="outline" 
                  className="w-full p-3 rounded-lg font-medium text-left justify-start"
                >
                  <Megaphone className="w-5 h-5 mr-3" />
                  Enviar Promoção
                </Button>
                <Button 
                  onClick={() => {
                    console.log("Opening gallery upload modal");
                    setGalleryOpen(true);
                  }}
                  variant="outline" 
                  className="w-full p-3 rounded-lg font-medium text-left justify-start"
                >
                  <Camera className="w-5 h-5 mr-3" />
                  Upload Galeria
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Agendamento confirmado</p>
                    <p className="text-xs text-gray-500">há 5 minutos</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <UserPlus className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Nova cliente cadastrada</p>
                    <p className="text-xs text-gray-500">há 1 hora</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Camera className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">3 fotos adicionadas à galeria</p>
                    <p className="text-xs text-gray-500">há 2 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Cadastrar Cliente */}
      <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            <p className="text-sm text-gray-600">
              Adicione um novo cliente ao sistema com os dados básicos.
            </p>
          </DialogHeader>
          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit(
              (data) => {
                console.log("Submitting client form with data:", data);
                createClientMutation.mutate(data);
              },
              (errors) => {
                console.log("Client form validation errors:", errors);
              }
            )} className="space-y-4">
              <FormField
                control={clientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={clientForm.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678901" maxLength={11} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={clientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="cliente@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={clientForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={clientForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <textarea 
                        className="w-full mt-1 p-2 border rounded-md h-20 text-sm resize-none"
                        placeholder="Observações sobre o cliente..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setNewClientOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createClientMutation.isPending}
                >
                  {createClientMutation.isPending ? "Criando..." : "Cadastrar Cliente"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal Enviar Promoção */}
      <Dialog open={promotionOpen} onOpenChange={setPromotionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Promoção</DialogTitle>
            <p className="text-sm text-gray-600">
              Envie uma mensagem promocional para seus clientes.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título da Promoção</label>
              <Input placeholder="Ex: Desconto de 20% em nail art" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <textarea 
                className="w-full mt-1 p-2 border rounded-md h-20 text-sm"
                placeholder="Digite a mensagem promocional..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Enviar para</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o público" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  <SelectItem value="active">Clientes ativos</SelectItem>
                  <SelectItem value="vip">Clientes VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log("Promotion modal cancelled");
                  setPromotionOpen(false);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  console.log("Sending promotion");
                  toast({
                    title: "Promoção Enviada",
                    description: "Mensagem promocional enviada com sucesso!",
                  });
                  setPromotionOpen(false);
                }}
                className="flex-1"
              >
                Enviar Promoção
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Upload Galeria */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload para Galeria</DialogTitle>
            <p className="text-sm text-gray-600">
              Adicione novas fotos dos seus trabalhos à galeria.
            </p>
          </DialogHeader>
          <Form {...galleryForm}>
            <form onSubmit={galleryForm.handleSubmit(
              (data) => {
                console.log("Submitting gallery form with data:", data);
                
                // Obter o arquivo do input
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
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
              },
              (errors) => {
                console.log("Gallery form validation errors:", errors);
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
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <textarea 
                        className="w-full mt-1 p-2 border rounded-md h-16 text-sm resize-none"
                        placeholder="Descrição da foto..."
                        {...field}
                      />
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

      {/* Modal Forma de Pagamento */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Atendimento</DialogTitle>
            <p className="text-sm text-gray-600">
              Selecione a forma de pagamento recebida para {selectedAppointment?.client?.name}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{selectedAppointment?.service?.name}</p>
              <p className="text-primary font-semibold">
                R$ {selectedAppointment?.price ? parseFloat(selectedAppointment.price).toFixed(2).replace('.', ',') : '0,00'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handlePaymentSubmit('cash')}
                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg"
                disabled={updateAppointmentMutation.isPending}
              >
                💰 Dinheiro
              </Button>
              <Button 
                onClick={() => handlePaymentSubmit('pix')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg"
                disabled={updateAppointmentMutation.isPending}
              >
                📱 PIX
              </Button>
              <Button 
                onClick={() => handlePaymentSubmit('card')}
                className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg"
                disabled={updateAppointmentMutation.isPending}
              >
                💳 Cartão
              </Button>
              <Button 
                onClick={() => handlePaymentSubmit('credit')}
                className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-lg"
                disabled={updateAppointmentMutation.isPending}
              >
                📝 Fiado
              </Button>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPaymentModalOpen(false);
                  setSelectedAppointment(null);
                }}
                className="flex-1"
                disabled={updateAppointmentMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
