import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, Star, X, CalendarDays } from "lucide-react";
import { format, addHours, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, updateDoc, Timestamp } from "firebase/firestore";
import type { AppointmentWithDetails, Client, Service } from "@shared/schema";

// --- Funções do Firebase ---
const fetchClientAppointments = async (clientId: string): Promise<AppointmentWithDetails[]> => {
    if (!clientId) return [];

    const appointmentsQuery = query(collection(db, "appointments"), where("clientId", "==", clientId));
    
    const appointmentSnapshot = await getDocs(appointmentsQuery);
    const clientsSnapshot = await getDocs(collection(db, "clients"));
    const servicesSnapshot = await getDocs(collection(db, "services"));

    const clientsMap = new Map(clientsSnapshot.docs.map(doc => [doc.id, {id: doc.id, ...doc.data()} as Client]));
    const servicesMap = new Map(servicesSnapshot.docs.map(doc => [doc.id, {id: doc.id, ...doc.data()} as Service]));

    return appointmentSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            client: clientsMap.get(data.clientId)!,
            service: servicesMap.get(data.serviceId)!,
        } as AppointmentWithDetails;
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Ordenar por data
};

const updateAppointment = async (data: { id: string, payload: any }) => {
    const { id, payload } = data;
    await updateDoc(doc(db, "appointments", id), { ...payload, updatedAt: Timestamp.now() });
};


export default function AppointmentsSection() {
  const [rescheduleDialog, setRescheduleDialog] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const clientId = "mock-client-id"; // Em uma app real, viria da autenticação
  
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["clientAppointments", clientId],
    queryFn: () => fetchClientAppointments(clientId),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientAppointments", clientId] });
      toast({ title: "Agendamento atualizado com sucesso!" });
      setRescheduleDialog(null);
    },
    onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const canModifyAppointment = (appointmentDate: Date) => {
    return isAfter(appointmentDate, addHours(new Date(), 12));
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "confirmed": return { badge: <Badge className="bg-green-100 text-green-800">Confirmado</Badge> };
      case "scheduled": return { badge: <Badge className="bg-blue-100 text-blue-800">Agendado</Badge> };
      case "cancelled": return { badge: <Badge className="bg-red-100 text-red-800">Cancelado</Badge> };
      case "completed": return { badge: <Badge className="bg-purple-100 text-purple-800">Concluído</Badge> };
      default: return { badge: <Badge variant="secondary">{status}</Badge> };
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Carregando seus agendamentos...</div>;
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
                  <img src={appointment.service.imageUrl || `https://placehold.co/60x60/fce7f3/ec4899?text=${appointment.service.name.charAt(0)}`} alt={appointment.service.name} className="w-12 h-12 object-cover rounded-xl" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{appointment.service.name}</h4>
                      {statusInfo.badge}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm space-x-3">
                      <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{format(appointment.date, "dd/MM/yyyy", { locale: ptBR })}</div>
                      <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{format(appointment.date, "HH:mm", { locale: ptBR })}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">R$ {Number(appointment.price).toFixed(2).replace('.', ',')}</div>
                  <div className="flex gap-2">
                    {canModifyAppointment(appointment.date) && (appointment.status === 'scheduled' || appointment.status === 'confirmed') ? (
                      <>
                        <Dialog open={rescheduleDialog === appointment.id} onOpenChange={(open) => setRescheduleDialog(open ? appointment.id : null)}>
                          <DialogTrigger asChild><Button variant="outline" size="sm"><CalendarDays className="w-4 h-4 mr-1" />Reagendar</Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Reagendar Atendimento</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Nova Data</Label>
                                <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={format(new Date(), "yyyy-MM-dd")} />
                              </div>
                              <div>
                                <Label>Novo Horário</Label>
                                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setRescheduleDialog(null)}>Cancelar</Button>
                              <Button onClick={() => {
                                const newDateTime = new Date(`${newDate}T${newTime}`);
                                updateAppointmentMutation.mutate({ id: appointment.id, payload: { date: Timestamp.fromDate(newDateTime) } });
                              }} disabled={!newDate || !newTime || updateAppointmentMutation.isPending}>Confirmar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><X className="w-4 h-4 mr-1" />Cancelar</Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Cancelar Agendamento?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Manter</AlertDialogCancel>
                              <AlertDialogAction onClick={() => updateAppointmentMutation.mutate({ id: appointment.id, payload: { status: 'cancelled' } })}>Sim, cancelar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <div className="text-xs text-gray-500 text-right">Não é possível alterar</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-800">Nenhum agendamento encontrado</h4>
            <p className="text-gray-500">Parece que você ainda não tem agendamentos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
