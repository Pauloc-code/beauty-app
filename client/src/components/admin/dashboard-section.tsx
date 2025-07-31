import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/today"],
  });

  const { data: todayAppointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", { date: new Date().toISOString().split('T')[0] }],
  });

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
      description: z.string().optional(),
      url: z.string().min(1, "URL da imagem é obrigatória")
    })),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      url: ""
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

  const createGalleryImageMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating gallery image with data:", data);
      const response = await apiRequest("POST", "/api/gallery", data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Gallery image created successfully:", data);
      toast({
        title: "Sucesso",
        description: "Foto adicionada à galeria com sucesso",
      });
      galleryForm.reset();
      setGalleryOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
    onError: (error) => {
      console.error("Error creating gallery image:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar foto à galeria",
        variant: "destructive"
      });
    }
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Dados do formulário:", data);
      
      // Buscar o serviço para obter o preço
      const selectedService = services.find((s: any) => s.id === data.serviceId);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Agendamentos Hoje"
          value={stats?.todayAppointments?.toString() || "0"}
          change="+12%"
          changeLabel="vs. ontem"
          icon={Calendar}
          loading={statsLoading}
        />
        
        <StatsCard
          title="Faturamento Hoje"
          value={`R$ ${stats?.todayRevenue?.toFixed(2).replace('.', ',') || "0,00"}`}
          change="+8%"
          changeLabel="vs. ontem"
          icon={DollarSign}
          variant="success"
          loading={statsLoading}
        />
        
        <StatsCard
          title="Novos Clientes"
          value={stats?.newClients?.toString() || "0"}
          change="+25%"
          changeLabel="vs. semana passada"
          icon={UserPlus}
          variant="info"
          loading={statsLoading}
        />
        
        <StatsCard
          title="Taxa de Ocupação"
          value={`${stats?.occupancyRate || 0}%`}
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
                                  {clients.map((client: any) => (
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
                                  {services.map((service: any) => (
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
              ) : todayAppointments?.length ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
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
                        <div className="flex space-x-1 mt-2">
                          <button className="p-1 text-gray-400 hover:text-primary transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
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
                createGalleryImageMutation.mutate(data);
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
              <FormField
                control={galleryForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      Cole aqui o link da imagem hospedada online
                    </p>
                  </FormItem>
                )}
              />
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
                  disabled={createGalleryImageMutation.isPending}
                >
                  {createGalleryImageMutation.isPending ? "Adicionando..." : "Adicionar à Galeria"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
