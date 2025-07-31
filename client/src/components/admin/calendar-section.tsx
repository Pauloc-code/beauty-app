import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertAppointment } from "@shared/schema";

export default function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
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
    return appointments?.filter(app => 
      isSameDay(new Date(app.date), date)
    ) || [];
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
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
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
                onClick={() => navigateMonth("prev")}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-semibold text-gray-900">
                {format(currentDate, "MMMM yyyy", { locale: ptBR })}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth("next")}
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

          {viewMode !== "month" && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-2">Visualização de {viewMode === "week" ? "semana" : "dia"}</p>
              <p className="text-sm text-gray-500">
                Esta visualização será implementada em uma versão futura
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
