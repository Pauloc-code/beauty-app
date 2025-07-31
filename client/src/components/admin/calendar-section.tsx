import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Filter, Plus, Settings, Pause, Play } from "lucide-react";
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

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const { data: services } = useQuery({
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

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDay = (date: Date) => {
    let filteredAppointments = appointments?.filter(app => 
      isSameDay(new Date(app.date), date)
    ) || [];

    // Aplicar filtros
    if (filters.status !== "all") {
      filteredAppointments = filteredAppointments.filter(app => app.status === filters.status);
    }
    if (filters.service !== "all") {
      filteredAppointments = filteredAppointments.filter(app => app.serviceId === filters.service);
    }
    if (filters.client !== "all") {
      filteredAppointments = filteredAppointments.filter(app => app.clientId === filters.client);
    }

    return filteredAppointments;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const days = direction === "prev" ? -7 : 7;
    setCurrentDate(addDays(currentDate, days));
  };

  const navigateDay = (direction: "prev" | "next") => {
    const days = direction === "prev" ? -1 : 1;
    setCurrentDate(addDays(currentDate, days));
  };

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(currentDate, { weekStartsOn: 0 })
    });
  };

  const getHourSlots = () => {
    return Array.from({ length: 12 }, (_, i) => i + 8); // 8h às 19h
  };;

  const handleCreateAppointment = () => {
    if (!newAppointment.clientId || !newAppointment.serviceId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um cliente e um serviço.",
        variant: "destructive",
      });
      return;
    }

    const selectedService = services?.find(s => s.id === newAppointment.serviceId);
    if (!selectedService) return;

    const appointmentData: InsertAppointment = {
      date: new Date(`${newAppointment.date}T${newAppointment.time}`),
      clientId: newAppointment.clientId,
      serviceId: newAppointment.serviceId,
      status: newAppointment.status,
      price: selectedService.price,
      duration: selectedService.duration
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Gestão da Agenda</h2>
            <div className="flex space-x-3">
              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filtros da Agenda</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Status do Agendamento</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="confirmed">Confirmado</SelectItem>
                          <SelectItem value="completed">Concluído</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Serviço</Label>
                      <Select value={filters.service} onValueChange={(value) => setFilters(prev => ({ ...prev, service: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os serviços</SelectItem>
                          {services?.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cliente</Label>
                      <Select value={filters.client} onValueChange={(value) => setFilters(prev => ({ ...prev, client: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os clientes</SelectItem>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => {
                        setFilters({ status: "all", service: "all", client: "all" });
                      }}>
                        Limpar Filtros
                      </Button>
                      <Button onClick={() => setIsFilterOpen(false)}>
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Configurações da Agenda</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Horários de Funcionamento</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Horário de Abertura</Label>
                          <Input type="time" defaultValue="08:00" />
                        </div>
                        <div>
                          <Label>Horário de Fechamento</Label>
                          <Input type="time" defaultValue="18:00" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Dias de Funcionamento</h4>
                      <div className="space-y-2">
                        {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day, index) => (
                          <div key={day} className="flex items-center justify-between">
                            <Label>{day}</Label>
                            <input type="checkbox" defaultChecked={index < 6} className="h-4 w-4 text-primary" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-900">Pausar Agenda</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium">Status da Agenda</div>
                            <div className="text-xs text-gray-500">Pausar temporariamente para viagens ou outros motivos</div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Data de Início da Pausa</Label>
                            <Input type="date" />
                          </div>
                          <div>
                            <Label>Data de Retorno</Label>
                            <Input type="date" />
                          </div>
                        </div>
                        <div>
                          <Label>Motivo da Pausa (Opcional)</Label>
                          <Input placeholder="Ex: Viagem, férias, etc..." />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => setIsSettingsOpen(false)}>
                        Salvar Configurações
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Data</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newAppointment.date}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Horário</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newAppointment.time}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="client">Cliente</Label>
                      <Select value={newAppointment.clientId} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, clientId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="service">Serviço</Label>
                      <Select value={newAppointment.serviceId} onValueChange={(value) => setNewAppointment(prev => ({ ...prev, serviceId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um serviço" />
                        </SelectTrigger>
                        <SelectContent>
                          {services?.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - R$ {service.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={newAppointment.status} onValueChange={(value: "scheduled" | "confirmed" | "completed" | "cancelled") => setNewAppointment(prev => ({ ...prev, status: value }))}>
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
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateAppointment} disabled={createAppointmentMutation.isPending}>
                        {createAppointmentMutation.isPending ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
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
          
          {/* Calendar Grid */}
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
                      {dayAppointments.slice(0, 2).map((appointment, index) => (
                        <div
                          key={appointment.id}
                          className="bg-primary text-white text-xs px-1 py-0.5 rounded truncate"
                          title={`${format(new Date(appointment.date), "HH:mm")} - ${appointment.client.name}`}
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

          {/* Week View */}
          {viewMode === "week" && (
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Week header */}
              <div className="grid grid-cols-8 border-b border-gray-200">
                <div className="p-3 border-r border-gray-200"></div>
                {getWeekDays().map((day) => (
                  <div key={day.toISOString()} className="p-3 text-center border-r border-gray-200 last:border-r-0">
                    <div className="text-sm font-medium text-gray-900">
                      {format(day, "EEE", { locale: ptBR })}
                    </div>
                    <div className={`text-lg font-bold ${
                      isSameDay(day, new Date()) ? "text-primary" : "text-gray-600"
                    }`}>
                      {format(day, "d")}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Time slots */}
              <div className="max-h-96 overflow-y-auto">
                {getHourSlots().map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
                    <div className="p-3 border-r border-gray-200 text-sm text-gray-500 font-medium">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {getWeekDays().map((day) => {
                      const dayAppointments = getAppointmentsForDay(day).filter(apt => {
                        const aptHour = new Date(apt.date).getHours();
                        return aptHour === hour;
                      });
                      
                      return (
                        <div key={`${day.toISOString()}-${hour}`} className="p-2 border-r border-gray-200 last:border-r-0 min-h-[60px]">
                          {dayAppointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className="bg-primary text-white text-xs px-2 py-1 rounded mb-1 truncate"
                              title={`${format(new Date(appointment.date), "HH:mm")} - ${appointment.client.name}`}
                            >
                              {format(new Date(appointment.date), "HH:mm")} {appointment.client.name}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
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
                            {hourAppointments.map((appointment) => (
                              <div
                                key={appointment.id}
                                className="bg-primary text-white p-3 rounded-lg"
                              >
                                <div className="font-medium">
                                  {format(new Date(appointment.date), "HH:mm")} - {appointment.client.name}
                                </div>
                                <div className="text-sm opacity-90">
                                  {appointment.service.name} - R$ {appointment.service.price}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  Status: {appointment.status === "scheduled" ? "Agendado" : 
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
        </CardContent>
      </Card>
    </div>
  );
}
