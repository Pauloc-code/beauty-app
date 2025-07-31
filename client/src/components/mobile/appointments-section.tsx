import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, Star } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentWithDetails } from "@shared/schema";

export default function AppointmentsSection() {
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  
  // Mock client ID - in real app this would come from authentication
  const clientId = "mock-client-id";
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", { clientId }],
  });

  // Dados de exemplo para demonstração
  const mockAppointments: AppointmentWithDetails[] = [
    {
      id: "1",
      clientId: "1",
      serviceId: "1", 
      date: new Date(Date.now() + 86400000), // Amanhã
      status: "scheduled",
      notes: "Cliente gosta de cores vibrantes",
      price: "35.00",
      createdAt: new Date(),
      updatedAt: new Date(),
      client: {
        id: "1",
        name: "Maria Silva",
        cpf: "12345678901",
        email: "maria@email.com",
        phone: "(11) 99999-9999",
        points: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      service: {
        id: "1",
        name: "Esmaltação em Gel",
        description: "Esmaltação duradoura com gel",
        duration: 45,
        price: "35.00",
        points: 10,
        imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      id: "2",
      clientId: "1",
      serviceId: "2",
      date: new Date(Date.now() + 172800000), // Em 2 dias
      status: "confirmed",
      notes: "",
      price: "50.00",
      createdAt: new Date(),
      updatedAt: new Date(),
      client: {
        id: "1",
        name: "Maria Silva",
        cpf: "12345678901",
        email: "maria@email.com",
        phone: "(11) 99999-9999",
        points: 150,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      service: {
        id: "2",
        name: "Spa dos Pés",
        description: "Relaxamento completo",
        duration: 60,
        price: "50.00",
        points: 15,
        imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  ];

  const appointmentsToShow = (appointments as AppointmentWithDetails[])?.length ? (appointments as AppointmentWithDetails[]) : mockAppointments;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed":
        return { 
          badge: <Badge className="bg-green-100 text-green-800 text-xs">✓ Confirmado</Badge>,
          color: "border-green-200 bg-green-50/30"
        };
      case "scheduled":
        return { 
          badge: <Badge className="bg-blue-100 text-blue-800 text-xs">📅 Agendado</Badge>,
          color: "border-blue-200 bg-blue-50/30"
        };
      case "cancelled":
        return { 
          badge: <Badge className="bg-red-100 text-red-800 text-xs">✗ Cancelado</Badge>,
          color: "border-red-200 bg-red-50/30"
        };
      case "completed":
        return { 
          badge: <Badge className="bg-purple-100 text-purple-800 text-xs">★ Concluído</Badge>,
          color: "border-purple-200 bg-purple-50/30"
        };
      default:
        return { 
          badge: <Badge variant="secondary" className="text-xs">{status}</Badge>,
          color: "border-gray-200"
        };
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Meus Agendamentos</h3>
          <p className="text-gray-600 text-sm">Gerencie seus compromissos</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="h-9 bg-gray-200 rounded-xl flex-1"></div>
                <div className="h-9 bg-gray-200 rounded-xl flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Meus Agendamentos</h3>
        <p className="text-gray-600 text-sm">Gerencie seus compromissos</p>
      </div>
      
      <div className="space-y-4">
        {appointmentsToShow.length ? (
          appointmentsToShow.map((appointment) => {
            const statusInfo = getStatusInfo(appointment.status);
            const isSelected = selectedAppointment === appointment.id;
            
            return (
              <div
                key={appointment.id}
                onClick={() => setSelectedAppointment(isSelected ? null : appointment.id)}
                className={`relative bg-white rounded-2xl p-4 shadow-sm border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? `${statusInfo.color} shadow-lg transform scale-[1.02] ring-2 ring-primary ring-offset-1`
                    : "border-gray-200 hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
                }`}
              >
                {/* Indicador de seleção */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                    <Star className="w-3 h-3 text-white fill-current" />
                  </div>
                )}

                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <img
                      src={appointment.service.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"}
                      alt={appointment.service.name}
                      className={`w-12 h-12 object-cover rounded-xl transition-all duration-300 ${
                        isSelected ? "ring-2 ring-primary ring-offset-1" : ""
                      }`}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-semibold transition-colors ${
                        isSelected ? "text-primary" : "text-gray-900"
                      }`}>
                        {appointment.service.name}
                      </h4>
                      {statusInfo.badge}
                    </div>
                    
                    <div className="flex items-center text-gray-600 text-sm space-x-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(appointment.date), "dd/MM", { locale: ptBR })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(new Date(appointment.date), "HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {isSelected && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-xl animate-in slide-in-from-top duration-300">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Duração: {appointment.service.duration} minutos</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>Rua das Flores, 123 - Centro</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>(11) 99999-9999</span>
                      </div>
                      {appointment.notes && (
                        <div className="mt-2 p-2 bg-white rounded-lg">
                          <p className="text-gray-700 text-xs">📝 {appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-primary">
                    R$ {parseFloat(appointment.price).toFixed(2).replace('.', ',')}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isSelected 
                          ? "bg-primary/10 text-primary border-primary hover:bg-primary hover:text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Reagendar
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>

                {/* Animação de destaque */}
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-50 animate-pulse pointer-events-none"></div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum agendamento ainda
            </h4>
            <p className="text-gray-500 mb-6">
              Que tal agendar seu primeiro atendimento?
            </p>
            <Button className="bg-primary text-white px-8 py-3 rounded-2xl font-semibold shadow-lg hover:bg-primary/90 transform transition-all duration-300 hover:scale-105">
              Fazer Agendamento
            </Button>
          </div>
        )}
      </div>

      {/* Botão flutuante quando há agendamento selecionado */}
      {selectedAppointment && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Button className="w-full bg-primary text-white py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:bg-primary/90 transform transition-all duration-300 hover:scale-[1.02]">
            Gerenciar Agendamento
          </Button>
        </div>
      )}
    </div>
  );
}
