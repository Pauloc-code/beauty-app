import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Star, X, CalendarDays } from "lucide-react";
import { format, addHours, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, updateDoc, Timestamp } from "firebase/firestore";
import type { AppointmentWithDetails, Client, Service, Appointment } from "@shared/schema";

// --- Utilitários para conversão de tipos ---
const convertTimestampToDate = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  return new Date();
};

const convertDateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// --- Funções do Firebase ---
const fetchClientAppointments = async (clientId: string): Promise<AppointmentWithDetails[]> => {
  try {
    if (!clientId) return [];

    const appointmentsQuery = query(
      collection(db, "appointments"), 
      where("clientId", "==", clientId)
    );
    
    const [appointmentSnapshot, clientsSnapshot, servicesSnapshot] = await Promise.all([
      getDocs(appointmentsQuery),
      getDocs(collection(db, "clients")),
      getDocs(collection(db, "services"))
    ]);

    const clientsMap = new Map(
      clientsSnapshot.docs.map(doc => [
        doc.id, 
        { id: doc.id, ...doc.data() } as Client
      ])
    );
    
    const servicesMap = new Map(
      servicesSnapshot.docs.map(doc => [
        doc.id, 
        { id: doc.id, ...doc.data() } as Service
      ])
    );

    const appointments = appointmentSnapshot.docs
      .map(doc => {
        try {
          const data = doc.data();
          const clientData = clientsMap.get(data.clientId);
          const serviceData = servicesMap.get(data.serviceId);

          // Validação mais robusta
          if (!clientData || !serviceData) {
            console.warn(`Appointment ${doc.id} has missing client or service data`);
            return null;
          }

          return {
            id: doc.id,
            ...data,
            // Conversões seguras de Timestamp para Date
            date: convertTimestampToDate(data.date),
            createdAt: convertTimestampToDate(data.createdAt),
            updatedAt: convertTimestampToDate(data.updatedAt),
            client: clientData,
            service: serviceData,
          } as AppointmentWithDetails;
        } catch (error) {
          console.error(`Error processing appointment ${doc.id}:`, error);
          return null;
        }
      })
      .filter((app): app is AppointmentWithDetails => app !== null)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return appointments;
  } catch (error) {
    console.error("Error fetching client appointments:", error);
    throw new Error("Erro ao carregar agendamentos");
  }
};

const updateAppointment = async (data: { id: string; payload: Partial<Appointment> }) => {
  try {
    const { id, payload } = data;
    
    // Preparar o payload com conversões necessárias
    const updatePayload: any = { 
      ...payload, 
      updatedAt: Timestamp.now() 
    };

    // Se há uma data no payload, converter para Timestamp
    if (payload.date) {
      updatePayload.date = payload.date instanceof Date 
        ? convertDateToTimestamp(payload.date)
        : payload.date;
    }

    await updateDoc(doc(db, "appointments", id), updatePayload);
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw new Error("Erro ao atualizar agendamento");
  }
};

export default function AppointmentsSection() {
  const [rescheduleDialog, setRescheduleDialog] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Em uma app real, o ID do cliente viria da autenticação
  const clientId = "mock-client-id"; 
  
  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["clientAppointments", clientId],
    queryFn: () => fetchClientAppointments(clientId),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAppointments", clientId] });
      toast({ title: "Agendamento atualizado com sucesso!" });
      setRescheduleDialog(null);
      setNewDate("");
      setNewTime("");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao atualizar agendamento", 
        variant: "destructive" 
      });
    },
  });

  const canModifyAppointment = (appointmentDate: Date) => {
    try {
      return isAfter(appointmentDate, addHours(new Date(), 12));
    } catch (error) {
      console.error("Error checking appointment modification eligibility:", error);
      return false;
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed": 
        return { badge: <Badge className="bg-green-100 text-green-800">Confirmado</Badge> };
      case "scheduled": 
        return { badge: <Badge className="bg-blue-100 text-blue-800">Agendado</Badge> };
      case "cancelled": 
        return { badge: <Badge className="bg-red-100 text-red-800">Cancelado</Badge> };
      case "completed": 
        return { badge: <Badge className="bg-purple-100 text-purple-800">Concluído</Badge> };
      default: 
        return { badge: <Badge variant="secondary">{status}</Badge> };
    }
  };

  const handleReschedule = () => {
    if (!newDate || !newTime) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma nova data e horário",
        variant: "destructive"
      });
      return;
    }

    try {
      const newDateTime = new Date(`${newDate}T${newTime}`);
      
      // Validar se a data é válida
      if (isNaN(newDateTime.getTime())) {
        toast({
          title: "Erro",
          description: "Data ou horário inválido",
          variant: "destructive"
        });
        return;
      }

      // Validar se a data não é no passado
      if (newDateTime <= new Date()) {
        toast({
          title: "Erro",
          description: "A nova data deve ser no futuro",
          variant: "destructive"
        });
        return;
      }

      if (rescheduleDialog) {
        updateAppointmentMutation.mutate({ 
          id: rescheduleDialog, 
          payload: { date: newDateTime }
        });
      }
    } catch (error) {
      console.error("Error in handleReschedule:", error);
      toast({
        title: "Erro",
        description: "Erro ao processar novo horário",
        variant: "destructive"
      });
    }
  };

  const handleCancel = (appointmentId: string) => {
    updateAppointmentMutation.mutate({ 
      id: appointmentId, 
      payload: { status: 'cancelled' }
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Carregando seus agendamentos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold">Erro ao carregar agendamentos</h3>
          <p className="text-red-600 text-sm mt-1">
            Tente novamente ou entre em contato com o suporte.
          </p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["clientAppointments", clientId] })} 
            variant="outline" 
            size="sm" 
            className="mt-3"
          >
            Tentar novamente
          </Button>
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
        {appointments.length > 0 ? (
          appointments.map((appointment) => {
            const statusInfo = getStatusInfo(appointment.status);
            
            return (
              <div key={appointment.id} className="bg-white rounded-2xl p-4 shadow-sm border">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={appointment.service.imageUrl || `https://placehold.co/60x60/fce7f3/ec4899?text=${encodeURIComponent(appointment.service.name.charAt(0))}`} 
                    alt={appointment.service.name} 
                    className="w-12 h-12 object-cover rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://placehold.co/60x60/fce7f3/ec4899?text=${encodeURIComponent(appointment.service.name.charAt(0))}`;
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{appointment.service.name}</h4>
                      {statusInfo.badge}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm space-x-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(appointment.date, "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {format(appointment.date, "HH:mm", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    R$ {Number(appointment.price || 0).toFixed(2).replace('.', ',')}
                  </div>
                  
                  <div className="flex gap-2">
                    {canModifyAppointment(appointment.date) && 
                     (appointment.status === 'scheduled' || appointment.status === 'confirmed') ? (
                      <>
                        <Dialog 
                          open={rescheduleDialog === appointment.id} 
                          onOpenChange={(open) => setRescheduleDialog(open ? appointment.id : null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <CalendarDays className="w-4 h-4 mr-1" />
                              Reagendar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reagendar Atendimento</DialogTitle>
                              <DialogDescription>
                                Selecione uma nova data e horário para seu agendamento.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="newDate">Nova Data</Label>
                                <Input 
                                  id="newDate"
                                  type="date" 
                                  value={newDate} 
                                  onChange={(e) => setNewDate(e.target.value)} 
                                  min={format(new Date(), "yyyy-MM-dd")} 
                                />
                              </div>
                              <div>
                                <Label htmlFor="newTime">Novo Horário</Label>
                                <Input 
                                  id="newTime"
                                  type="time" 
                                  value={newTime} 
                                  onChange={(e) => setNewTime(e.target.value)} 
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setRescheduleDialog(null);
                                  setNewDate("");
                                  setNewTime("");
                                }}
                                disabled={updateAppointmentMutation.isPending}
                              >
                                Cancelar
                              </Button>
                              <Button 
                                onClick={handleReschedule}
                                disabled={!newDate || !newTime || updateAppointmentMutation.isPending}
                              >
                                {updateAppointmentMutation.isPending ? "Confirmando..." : "Confirmar"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar Agendamento?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Seu agendamento será cancelado permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={updateAppointmentMutation.isPending}>
                                Manter
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleCancel(appointment.id)}
                                disabled={updateAppointmentMutation.isPending}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {updateAppointmentMutation.isPending ? "Cancelando..." : "Sim, cancelar"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 text-right">
                        Não é possível alterar
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800">
              Nenhum agendamento encontrado
            </h4>
            <p className="text-gray-500">
              Parece que você ainda não tem agendamentos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}