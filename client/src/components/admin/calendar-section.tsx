import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Filter, Plus, Settings, Pause, Play, Edit, Trash2, X, Calendar, List } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertAppointment } from "@shared/schema";

export default function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditAppointmentOpen, setIsEditAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showFutureAppointments, setShowFutureAppointments] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    service: "all",
    client: "all"
  });
  const [newAppointment, setNewAppointment] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    clientId: "",
    serviceId: "",
    status: "scheduled" as const
  });
  const { toast } = useToast();

  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (appointment: InsertAppointment) =>
      apiRequest("POST", "/api/appointments", appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsNewAppointmentOpen(false);
      setNewAppointment({
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        clientId: "",
        serviceId: "",
        status: "scheduled"
      });
      toast({
        title: "Agendamento criado",
        description: "Novo agendamento foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      console.log("Enviando para API:", appointmentData);
      const { id, ...updateData } = appointmentData;
      return await apiRequest("PUT", `/api/appointments/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/today"] });
      setIsEditAppointmentOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "Sucesso",
        description: "Agendamento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar agendamento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: (appointmentId: number) =>
      apiRequest("DELETE", `/api/appointments/${appointmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsEditAppointmentOpen(false);
      setSelectedAppointment(null);
      toast({
        title: "Agendamento cancelado",
        description: "Agendamento foi cancelado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar o agendamento.",
        variant: "destructive",
      });
    },
  });

  // Filter appointments based on current filters
  const getFilteredAppointments = () => {
    if (!appointments || !Array.isArray(appointments)) return [];
    
    return appointments.filter((appointment: any) => {
      const statusMatch = filters.status === "all" || appointment.status === filters.status;
      const serviceMatch = filters.service === "all" || appointment.serviceId.toString() === filters.service;
      const clientMatch = filters.client === "all" || appointment.clientId.toString() === filters.client;
      
      return statusMatch && serviceMatch && clientMatch;
    });
  };

  const getFutureAppointments = () => {
    const filtered = getFilteredAppointments();
    const now = new Date();
    
    return filtered
      .filter((appointment: any) => new Date(appointment.date) >= now)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getAppointmentsForDay = (date: Date) => {
    const filtered = getFilteredAppointments();
    return filtered.filter((appointment: any) => 
      isSameDay(new Date(appointment.date), date)
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getHourSlots = () => {
    return Array.from({ length: 12 }, (_, i) => i + 8); // 8h às 19h
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Calendário de Agendamentos</h2>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFutureAppointments(!showFutureAppointments)}
                className="flex items-center space-x-2"
              >
                {showFutureAppointments ? <Calendar className="w-4 h-4" /> : <List className="w-4 h-4" />}
                <span>{showFutureAppointments ? "Ver Calendário" : "Ver Lista"}</span>
              </Button>

              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Filtrar Agendamentos</DialogTitle>
                    <DialogDescription>
                      Filtre os agendamentos por status, serviço ou cliente para uma visualização mais específica.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Status</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Serviço</Label>
                      <Select value={filters.service} onValueChange={(value) => setFilters({...filters, service: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os serviços</SelectItem>
                          {(services as any[] || []).map((service: any) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Cliente</Label>
                      <Select value={filters.client} onValueChange={(value) => setFilters({...filters, client: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os clientes</SelectItem>
                          {(clients as any[] || []).map((client: any) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Novo Agendamento</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogDescription>
                      Crie um novo agendamento selecionando a data, horário, cliente e serviço.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Horário</Label>
                        <Input
                          type="time"
                          value={newAppointment.time}
                          onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Cliente</Label>
                      <Select value={newAppointment.clientId} onValueChange={(value) => setNewAppointment({...newAppointment, clientId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {(clients as any[] || []).map((client: any) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Serviço</Label>
                      <Select value={newAppointment.serviceId} onValueChange={(value) => setNewAppointment({...newAppointment, serviceId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {(services as any[] || []).map((service: any) => (
                            <SelectItem key={service.id} value={service.id.toString()}>
                              {service.name} - R$ {service.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={() => {
                          const servicesList = services as any[] || [];
                          const selectedService = servicesList.find((s: any) => s.id.toString() === newAppointment.serviceId);
                          const appointmentData = {
                            clientId: newAppointment.clientId,
                            serviceId: newAppointment.serviceId,
                            date: new Date(`${newAppointment.date}T${newAppointment.time}`),
                            status: newAppointment.status,
                            price: selectedService?.price?.toString() || "0"
                          };
                          createAppointmentMutation.mutate(appointmentData);
                        }}
                        disabled={createAppointmentMutation.isPending || !newAppointment.clientId || !newAppointment.serviceId}
                      >
                        {createAppointmentMutation.isPending ? "Criando..." : "Criar Agendamento"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Appointment Dialog */}
              <Dialog open={isEditAppointmentOpen} onOpenChange={setIsEditAppointmentOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Editar Agendamento</DialogTitle>
                    <DialogDescription>
                      Modifique os detalhes do agendamento ou cancele-o se necessário.
                    </DialogDescription>
                  </DialogHeader>
                  {selectedAppointment && (
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Data</Label>
                          <Input
                            type="date"
                            value={format(new Date(selectedAppointment.date), "yyyy-MM-dd")}
                            onChange={(e) => {
                              const [hours, minutes] = selectedAppointment.time?.split(':') || ['09', '00'];
                              const newDate = new Date(`${e.target.value}T${hours}:${minutes}`);
                              setSelectedAppointment({...selectedAppointment, date: newDate.toISOString()});
                            }}
                          />
                        </div>
                        <div>
                          <Label>Horário</Label>
                          <Input
                            type="time"
                            value={selectedAppointment.time || format(new Date(selectedAppointment.date), "HH:mm")}
                            onChange={(e) => setSelectedAppointment({...selectedAppointment, time: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Cliente</Label>
                        <Select value={selectedAppointment.clientId} onValueChange={(value) => setSelectedAppointment({...selectedAppointment, clientId: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(clients as any[] || []).map((client: any) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Serviço</Label>
                        <Select value={selectedAppointment.serviceId} onValueChange={(value) => setSelectedAppointment({...selectedAppointment, serviceId: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(services as any[] || []).map((service: any) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Status</Label>
                        <Select value={selectedAppointment.status} onValueChange={(value) => setSelectedAppointment({...selectedAppointment, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Agendado</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button 
                          variant="destructive" 
                          onClick={() => deleteAppointmentMutation.mutate(selectedAppointment.id)}
                          disabled={deleteAppointmentMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deleteAppointmentMutation.isPending ? "Cancelando..." : "Cancelar Agendamento"}
                        </Button>
                        
                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setIsEditAppointmentOpen(false)}>
                            Fechar
                          </Button>
                          <Button 
                            onClick={() => {
                              console.log("Salvando alterações:", selectedAppointment);
                              const updatedData = {
                                clientId: selectedAppointment.clientId,
                                serviceId: selectedAppointment.serviceId,
                                date: new Date(`${selectedAppointment.date.split('T')[0]}T${selectedAppointment.time || format(new Date(selectedAppointment.date), "HH:mm")}:00.000Z`),
                                status: selectedAppointment.status,
                                price: selectedAppointment.price
                              };
                              console.log("Dados a serem enviados:", updatedData);
                              updateAppointmentMutation.mutate({
                                id: selectedAppointment.id,
                                ...updatedData
                              });
                            }}
                            disabled={updateAppointmentMutation.isPending}
                          >
                            {updateAppointmentMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {showFutureAppointments ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Agendamentos Futuros</h3>
                <div className="text-sm text-gray-600">
                  Total: {getFutureAppointments().length} agendamentos
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFutureAppointments().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum agendamento futuro encontrado</p>
                  </div>
                ) : (
                  getFutureAppointments().map((appointment: any) => (
                    <div
                      key={appointment.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsEditAppointmentOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="font-medium text-gray-900">
                              {appointment.client.name}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                              appointment.status === "confirmed" ? "bg-green-100 text-green-800" :
                              appointment.status === "completed" ? "bg-gray-100 text-gray-800" :
                              "bg-red-100 text-red-800"
                            }`}>
                              {appointment.status === "scheduled" ? "Agendado" :
                               appointment.status === "confirmed" ? "Confirmado" :
                               appointment.status === "completed" ? "Concluído" : "Cancelado"}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            📅 {format(new Date(appointment.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            💅 {appointment.service.name}
                          </div>
                          <div className="text-sm font-medium text-primary">
                            💰 R$ {appointment.service.price}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Edit className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (viewMode === "month") navigateMonth("prev");
                      else if (viewMode === "week") navigateWeek("prev");
                      else navigateDay("prev");
                    }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {viewMode === "month" && format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    {viewMode === "week" && `Semana de ${format(startOfWeek(currentDate), "dd/MM", { locale: ptBR })} - ${format(endOfWeek(currentDate), "dd/MM/yyyy", { locale: ptBR })}`}
                    {viewMode === "day" && format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (viewMode === "month") navigateMonth("next");
                      else if (viewMode === "week") navigateWeek("next");
                      else navigateDay("next");
                    }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === "month" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("month")}
                    className={viewMode === "month" ? "bg-primary text-white" : ""}
                  >
                    Mês
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("week")}
                    className={viewMode === "week" ? "bg-primary text-white" : ""}
                  >
                    Semana
                  </Button>
                  <Button
                    variant={viewMode === "day" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                    className={viewMode === "day" ? "bg-primary text-white" : ""}
                  >
                    Dia
                  </Button>
                </div>
              </div>
              
              {/* Calendar Views */}
              {viewMode === "month" && (
                <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                  {/* Calendar header days */}
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                    <div key={`empty-${index}`} className="bg-white p-3 h-24"></div>
                  ))}
                  
                  {daysInMonth.map((date) => {
                    const dayAppointments = getAppointmentsForDay(date);
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                      <div
                        key={date.toISOString()}
                        className={`bg-white p-3 h-24 border-l border-b border-gray-100 ${
                          isToday ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${
                          isToday ? "text-primary font-bold" : 
                          isSameMonth(date, currentDate) ? "text-gray-900" : "text-gray-400"
                        }`}>
                          {format(date, "d")}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((appointment: any, index) => (
                            <div
                              key={appointment.id}
                              className="bg-primary text-white text-xs p-1 rounded cursor-pointer hover:bg-primary/90"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setIsEditAppointmentOpen(true);
                              }}
                            >
                              {format(new Date(appointment.date), "HH:mm")} {appointment.client.name}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayAppointments.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Day View */}
              {viewMode === "day" && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </h4>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {getHourSlots().map((hour) => {
                      const hourAppointments = getAppointmentsForDay(currentDate).filter(apt => {
                        const aptHour = new Date(apt.date).getHours();
                        return aptHour === hour;
                      });
                      
                      return (
                        <div key={hour} className="flex border-b border-gray-100 last:border-b-0">
                          <div className="w-20 p-4 border-r border-gray-200 text-sm text-gray-500 font-medium">
                            {hour.toString().padStart(2, '0')}:00
                          </div>
                          <div className="flex-1 p-4 min-h-[80px]">
                            {hourAppointments.length === 0 ? (
                              <div className="text-gray-400 text-sm">Horário disponível</div>
                            ) : (
                              <div className="space-y-2">
                                {hourAppointments.map((appointment: any) => (
                                  <div
                                    key={appointment.id}
                                    className="bg-primary text-white p-3 rounded-lg cursor-pointer hover:bg-primary/90 group"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setIsEditAppointmentOpen(true);
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium">
                                        {format(new Date(appointment.date), "HH:mm")} - {appointment.client.name}
                                      </div>
                                      <Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="text-sm opacity-90">
                                      {appointment.service.name} - R$ {appointment.service.price}
                                    </div>
                                    <div className="text-xs opacity-75 mt-1">
                                      Status: {appointment.status === "scheduled" ? "Agendado" : 
                                              appointment.status === "confirmed" ? "Confirmado" : 
                                              appointment.status === "completed" ? "Concluído" : 
                                              appointment.status === "cancelled" ? "Cancelado" : appointment.status}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}