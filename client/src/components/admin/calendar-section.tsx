import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import type { Client, Service, Appointment, AppointmentWithDetails, SystemSettings, InsertAppointment } from "@shared/schema";

// --- Funções do Firebase ---
const fetchClients = async (): Promise<Client[]> => {
    const snapshot = await getDocs(collection(db, "clients"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate(), updatedAt: doc.data().updatedAt.toDate() } as Client));
};

const fetchServices = async (): Promise<Service[]> => {
    const snapshot = await getDocs(collection(db, "services"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate(), updatedAt: doc.data().updatedAt.toDate() } as Service));
};

const fetchAppointments = async (): Promise<AppointmentWithDetails[]> => {
    const appointmentSnapshot = await getDocs(collection(db, "appointments"));
    const clientsSnapshot = await getDocs(collection(db, "clients"));
    const servicesSnapshot = await getDocs(collection(db, "services"));

    const clientsMap = new Map(clientsSnapshot.docs.map(doc => [doc.id, {id: doc.id, ...doc.data()} as Client]));
    const servicesMap = new Map(servicesSnapshot.docs.map(doc => [doc.id, {id: doc.id, ...doc.data()} as Service]));

    return appointmentSnapshot.docs.map(doc => {
        const data = doc.data();
        const clientData = clientsMap.get(data.clientId);
        const serviceData = servicesMap.get(data.serviceId);
        if (!clientData || !serviceData) return null;
        return {
            id: doc.id,
            ...data,
            date: data.date.toDate(),
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            client: clientData,
            service: serviceData,
        } as AppointmentWithDetails;
    }).filter((app): app is AppointmentWithDetails => app !== null);
};

const fetchSystemSettings = async (): Promise<SystemSettings | null> => {
    const snapshot = await getDocs(collection(db, "systemSettings"));
    if (snapshot.empty) return null;
    const docData = snapshot.docs[0].data();
    return {
        id: snapshot.docs[0].id,
        ...docData,
        createdAt: docData.createdAt.toDate(),
        updatedAt: docData.updatedAt.toDate(),
    } as SystemSettings;
};

export default function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [isEditAppointmentOpen, setIsEditAppointmentOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    clientId: "",
    serviceId: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: appointments = [] } = useQuery({ queryKey: ["appointments"], queryFn: fetchAppointments });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: fetchClients });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: fetchServices });
  const { data: systemSettings } = useQuery({ queryKey: ["systemSettings"], queryFn: fetchSystemSettings });

  const createAppointmentMutation = useMutation({
    mutationFn: async (appointment: InsertAppointment) => {
        await addDoc(collection(db, "appointments"), {
            ...appointment,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsNewAppointmentOpen(false);
      toast({ title: "Agendamento criado com sucesso." });
    },
    onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: string) => await deleteDoc(doc(db, "appointments", appointmentId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsEditAppointmentOpen(false);
      toast({ title: "Agendamento cancelado com sucesso." });
    },
    onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: "destructive" }),
  });

  const isHoliday = (date: Date): { isHoliday: boolean; name?: string } => {
    if (!systemSettings?.showHolidays) return { isHoliday: false };
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const nationalHolidays = [ { month: 1, day: 1, name: "Ano Novo" }, { month: 4, day: 21, name: "Tiradentes" } ];
    const nationalHoliday = nationalHolidays.find(h => h.month === month && h.day === day);
    if (nationalHoliday) return { isHoliday: true, name: nationalHoliday.name };
    return { isHoliday: false };
  };

  const getAppointmentsForDay = (date: Date) => appointments.filter(appointment => isSameDay(appointment.date, date));

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
                <Button onClick={() => setIsNewAppointmentOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Agendamento
                </Button>
            </div>
          
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day} className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-600">{day}</div>
                ))}
                
                {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                    <div key={`empty-${index}`} className="bg-white p-3 h-24"></div>
                ))}
                
                {daysInMonth.map((date) => {
                    const dayAppointments = getAppointmentsForDay(date);
                    const isToday = isSameDay(date, new Date());
                    const holidayInfo = isHoliday(date);
                    
                    return (
                      <div key={date.toISOString()} className={`bg-white p-3 h-24 ${isToday ? "bg-blue-50" : holidayInfo.isHoliday ? "bg-red-50" : ""}`}>
                        <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>{format(date, "d")}</div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 2).map((appointment) => (
                            <div key={appointment.id} className="text-white text-xs p-1 rounded cursor-pointer bg-blue-500"
                              onClick={() => { setSelectedAppointment(appointment); setIsEditAppointmentOpen(true); }}>
                              {format(appointment.date, "HH:mm")} {appointment.client.name}
                            </div>
                          ))}
                          {dayAppointments.length > 2 && <div className="text-xs text-gray-500">+{dayAppointments.length - 2} mais</div>}
                        </div>
                      </div>
                    );
                })}
            </div>
        </CardContent>
      </Card>

      <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Data</Label>
                        <Input type="date" value={newAppointment.date} onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})} />
                    </div>
                    <div>
                        <Label>Horário</Label>
                        <Input type="time" value={newAppointment.time} onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})} />
                    </div>
                </div>
                <div>
                    <Label>Cliente</Label>
                    <Select value={newAppointment.clientId} onValueChange={(value) => setNewAppointment({...newAppointment, clientId: value})}>
                        <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
                        <SelectContent>{clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Serviço</Label>
                    <Select value={newAppointment.serviceId} onValueChange={(value) => setNewAppointment({...newAppointment, serviceId: value})}>
                        <SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger>
                        <SelectContent>{services.map((service) => <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsNewAppointmentOpen(false)}>Cancelar</Button>
                    <Button onClick={() => {
                        const selectedService = services.find(s => s.id === newAppointment.serviceId);
                        if (!selectedService) {
                            toast({ title: "Erro", description: "Selecione um serviço válido", variant: "destructive" });
                            return;
                        }
                        const appointmentData: InsertAppointment = {
                            clientId: newAppointment.clientId,
                            serviceId: newAppointment.serviceId,
                            date: new Date(`${newAppointment.date}T${newAppointment.time}`),
                            status: "scheduled",
                            price: selectedService.price,
                        };
                        createAppointmentMutation.mutate(appointmentData);
                    }} disabled={createAppointmentMutation.isPending}>Criar</Button>
                </div>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditAppointmentOpen} onOpenChange={setIsEditAppointmentOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Detalhes do Agendamento</DialogTitle></DialogHeader>
            {selectedAppointment && (
                <div className="space-y-4 py-4">
                    <p>Cliente: {selectedAppointment.client.name}</p>
                    <p>Serviço: {selectedAppointment.service.name}</p>
                    <p>Data: {format(selectedAppointment.date, "dd/MM/yyyy HH:mm")}</p>
                    <div className="flex justify-between pt-4">
                        <Button variant="destructive" onClick={() => deleteAppointmentMutation.mutate(selectedAppointment.id)} disabled={deleteAppointmentMutation.isPending}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancelar Agendamento
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditAppointmentOpen(false)}>Fechar</Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
