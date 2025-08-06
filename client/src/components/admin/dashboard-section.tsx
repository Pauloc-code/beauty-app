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
import { z } from "zod";
import StatsCard from "@/components/ui/stats-card";
import { 
  Calendar, 
  DollarSign, 
  UserPlus, 
  TrendingUp,
  CalendarPlus,
  Camera,
  Edit,
  Check,
  X,
  Settings
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, doc, Timestamp, query, where, orderBy, limit, startOfDay, endOfDay } from "firebase/firestore";
import type { Client, Service, Appointment, AppointmentWithDetails, GalleryImage, InsertClient, InsertAppointment, InsertGalleryImage } from "@shared/schema";

// --- Funções do Firebase ---
const fetchTodayStats = async () => {
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  // Agendamentos de hoje
  const appointmentsQuery = query(
    collection(db, "appointments"),
    where("date", ">=", Timestamp.fromDate(startOfToday)),
    where("date", "<=", Timestamp.fromDate(endOfToday))
  );
  const appointmentSnapshot = await getDocs(appointmentsQuery);
  const todayAppointments = appointmentSnapshot.size;

  // Faturamento de hoje
  let todayRevenue = 0;
  appointmentSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.status === 'completed') {
      todayRevenue += parseFloat(data.price || "0");
    }
  });

  // Novos clientes na última semana
  const oneWeekAgo = new Date(today);
  oneWeekAgo.setDate(today.getDate() - 7);
  const newClientsQuery = query(collection(db, "clients"), where("createdAt", ">=", Timestamp.fromDate(oneWeekAgo)));
  const newClientsSnapshot = await getDocs(newClientsQuery);
  const newClients = newClientsSnapshot.size;
  
  // Taxa de ocupação (simplificada)
  const totalSlots = 10; // Exemplo: 10 horários por dia
  const occupancyRate = totalSlots > 0 ? Math.round((todayAppointments / totalSlots) * 100) : 0;

  return { todayAppointments, todayRevenue, newClients, occupancyRate: Math.min(occupancyRate, 100) };
};

const fetchRecentActivities = async (): Promise<any[]> => {
    const q = query(collection(db, "clients"), orderBy("createdAt", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'client',
        action: 'cadastrado',
        description: `Nova cliente cadastrada: ${doc.data().name}`,
        timestamp: doc.data().createdAt.toDate(),
        icon: 'UserPlus',
        iconBg: 'bg-blue-100'
    }));
    return activities;
};

const fetchAppointments = async (): Promise<AppointmentWithDetails[]> => {
    const appointmentSnapshot = await getDocs(collection(db, "appointments"));
    const clientsSnapshot = await getDocs(collection(db, "clients"));
    const servicesSnapshot = await getDocs(collection(db, "services"));

    const clientsMap = new Map(clientsSnapshot.docs.map(doc => [doc.id, doc.data() as Client]));
    const servicesMap = new Map(servicesSnapshot.docs.map(doc => [doc.id, doc.data() as Service]));

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
    });
};


export default function DashboardSection() {
  const [newAppointmentOpen, setNewAppointmentOpen] = useState(false);
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [appointmentDetailOpen, setAppointmentDetailOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["todayStats"],
    queryFn: fetchTodayStats,
  });

  const { data: allAppointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });
  
  const { data: clients = [] } = useQuery<Client[]>({ queryKey: ['clients'] });
  const { data: services = [] } = useQuery<Service[]>({ queryKey: ['services'] });

  const { data: recentActivities = [] } = useQuery({
    queryKey: ["recentActivities"],
    queryFn: fetchRecentActivities,
  });

  const todayAppointments = useMemo(() => 
    allAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      return (
        appointmentDate.getDate() === today.getDate() &&
        appointmentDate.getMonth() === today.getMonth() &&
        appointmentDate.getFullYear() === today.getFullYear()
      );
  }), [allAppointments]);

  // Forms
  const appointmentForm = useForm({
    resolver: zodResolver(z.object({
      clientId: z.string().min(1, "Cliente é obrigatório"),
      serviceId: z.string().min(1, "Serviço é obrigatório"),
      date: z.string().min(1, "Data é obrigatória"),
      time: z.string().min(1, "Horário é obrigatório"),
      notes: z.string().optional(),
    })),
    defaultValues: {
      clientId: "",
      serviceId: "",
      date: new Date().toISOString().split('T')[0],
      time: "",
      notes: ""
    },
  });

  const clientForm = useForm({
    resolver: zodResolver(z.object({
      name: z.string().min(1, "Nome é obrigatório"),
      cpf: z.string().length(11, "CPF deve ter 11 dígitos"),
      email: z.string().email("Email inválido").optional().or(z.literal("")),
      phone: z.string().min(1, "Telefone é obrigatório"),
    })),
    defaultValues: { name: "", cpf: "", email: "", phone: "" }
  });

  const galleryForm = useForm({
    resolver: zodResolver(z.object({
      title: z.string().min(1, "Título é obrigatório"),
      category: z.string().min(1, "Categoria é obrigatória"),
      description: z.string().optional()
    })),
    defaultValues: { title: "", category: "", description: "" }
  });

  // Mutations
  const createClientMutation = useMutation({
    mutationFn: async (data: InsertClient) => {
        const docRef = await addDoc(collection(db, "clients"), {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            points: 0
        });
        return { id: docRef.id, ...data };
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Cliente cadastrado com sucesso" });
      clientForm.reset();
      setNewClientOpen(false);
      queryClient.invalidateQueries({ queryKey: ["clients", "recentActivities"] });
    },
    onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const selectedService = services.find(s => s.id === data.serviceId);
      if (!selectedService) throw new Error("Serviço não encontrado");

      const localDateTime = new Date(`${data.date}T${data.time}`);
      
      const appointmentData: InsertAppointment = {
        clientId: data.clientId,
        serviceId: data.serviceId,
        date: localDateTime,
        status: "scheduled",
        price: selectedService.price,
        notes: data.notes || ""
      };
      await addDoc(collection(db, "appointments"), { ...appointmentData, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "todayStats", "recentActivities"] });
      setNewAppointmentOpen(false);
      appointmentForm.reset();
      toast({ title: "Sucesso", description: "Agendamento criado com sucesso!" });
    },
    onError: (error: Error) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      const appointmentDoc = doc(db, "appointments", id);
      await updateDoc(appointmentDoc, { ...data, updatedAt: Timestamp.now() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", "todayStats", "recentActivities"] });
      toast({ title: "Sucesso", description: "Agendamento atualizado!" });
    },
    onError: (error: Error) => toast({ title: "Erro", description: `Erro ao atualizar: ${error.message}`, variant: "destructive" })
  });

  const handleCompleteAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment as AppointmentWithDetails);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (paymentMethod: string) => {
    if (selectedAppointment) {
      updateAppointmentMutation.mutate({
        id: selectedAppointment.id,
        data: { 
          status: 'completed',
          paymentMethod: paymentMethod as any,
          paymentStatus: 'paid'
        }
      });
      setPaymentModalOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleViewDetails = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setAppointmentDetailOpen(true);
  };
  
  const IconMap: { [key: string]: React.ElementType } = {
    Check, UserPlus, Camera, Calendar, X
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Agendamentos Hoje" value={stats?.todayAppointments?.toString() || "0"} icon={Calendar} loading={statsLoading} />
        <StatsCard title="Faturamento Hoje" value={`R$ ${stats?.todayRevenue?.toFixed(2).replace('.', ',') || "0,00"}`} icon={DollarSign} variant="success" loading={statsLoading} />
        <StatsCard title="Novos Clientes" value={stats?.newClients?.toString() || "0"} icon={UserPlus} variant="info" loading={statsLoading} />
        <StatsCard title="Taxa de Ocupação" value={`${stats?.occupancyRate || 0}%`} icon={TrendingUp} variant="warning" loading={statsLoading} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agenda de Hoje */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Agenda de Hoje</h3>
            </div>
            <CardContent className="p-6">
              {appointmentsLoading ? <p>Carregando...</p> : todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-4 p-4 rounded-lg bg-[#ffe3ee]">
                      <div className="text-center">
                        <p className="font-medium text-gray-600 text-[18px]">
                          {format(appointment.date, "HH:mm")}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{appointment.client?.name}</p>
                        <p className="text-sm text-gray-600">{appointment.service?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary text-[18px] font-bold">
                          R$ {Number(appointment.price).toFixed(2).replace('.', ',')}
                        </p>
                        <div className="flex items-center justify-end space-x-2 mt-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(appointment)}>
                            <Edit className="w-3 h-3 mr-1" /> Detalhes
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCompleteAppointment(appointment)} disabled={appointment.status === 'completed'}>
                            <Check className="w-3 h-3 mr-1" /> {appointment.status === 'completed' ? 'Concluído' : 'Confirmar'}
                          </Button>
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

        {/* Ações Rápidas e Atividades Recentes */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Button onClick={() => setNewAppointmentOpen(true)} className="w-full justify-start"><CalendarPlus className="w-5 h-5 mr-3" />Novo Agendamento</Button>
                <Button onClick={() => setNewClientOpen(true)} variant="outline" className="w-full justify-start"><UserPlus className="w-5 h-5 mr-3" />Cadastrar Cliente</Button>
                <Button onClick={() => setGalleryOpen(true)} variant="outline" className="w-full justify-start"><Camera className="w-5 h-5 mr-3" />Upload Galeria</Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Atividades Recentes</h3>
              <div className="space-y-3">
                {recentActivities.length > 0 ? recentActivities.map((activity) => {
                    const Icon = IconMap[activity.icon] || Check;
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${activity.iconBg}`}><Icon className="w-3 h-3" /></div>
                        <div>
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-gray-500">{format(activity.timestamp, "dd/MM/yy HH:mm", { locale: ptBR })}</p>
                        </div>
                      </div>
                    );
                }) : <p className="text-sm text-gray-500">Nenhuma atividade recente.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={newAppointmentOpen} onOpenChange={setNewAppointmentOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
            <Form {...appointmentForm}>
                <form onSubmit={appointmentForm.handleSubmit(data => createAppointmentMutation.mutate(data))} className="space-y-4">
                    <FormField control={appointmentForm.control} name="clientId" render={({ field }) => (<FormItem><FormLabel>Cliente</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger></FormControl><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <FormField control={appointmentForm.control} name="serviceId" render={({ field }) => (<FormItem><FormLabel>Serviço</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecione um serviço" /></SelectTrigger></FormControl><SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} - R$ {Number(s.price).toFixed(2)}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={appointmentForm.control} name="date" render={({ field }) => (<FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={appointmentForm.control} name="time" render={({ field }) => (<FormItem><FormLabel>Horário</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                    <FormField control={appointmentForm.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Observações</FormLabel><FormControl><Input placeholder="Opcional" {...field} /></FormControl></FormItem>)} />
                    <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setNewAppointmentOpen(false)}>Cancelar</Button><Button type="submit" disabled={createAppointmentMutation.isPending}>Criar</Button></div>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Cliente</DialogTitle></DialogHeader>
            <Form {...clientForm}>
                <form onSubmit={clientForm.handleSubmit(data => createClientMutation.mutate(data as InsertClient))} className="space-y-4">
                    <FormField control={clientForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={clientForm.control} name="cpf" render={({ field }) => (<FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} maxLength={11} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={clientForm.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={clientForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="flex justify-end space-x-2"><Button type="button" variant="outline" onClick={() => setNewClientOpen(false)}>Cancelar</Button><Button type="submit" disabled={createClientMutation.isPending}>Cadastrar</Button></div>
                </form>
            </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Finalizar Atendimento</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
                <Button onClick={() => handlePaymentSubmit('cash')} className="h-16">Dinheiro</Button>
                <Button onClick={() => handlePaymentSubmit('pix')} className="h-16">PIX</Button>
                <Button onClick={() => handlePaymentSubmit('card')} className="h-16">Cartão</Button>
                <Button onClick={() => handlePaymentSubmit('credit')} className="h-16">Fiado</Button>
            </div>
        </DialogContent>
      </Dialog>

      <Dialog open={appointmentDetailOpen} onOpenChange={setAppointmentDetailOpen}>
        <DialogContent>
            <DialogHeader><DialogTitle>Detalhes do Agendamento</DialogTitle></DialogHeader>
            {selectedAppointment && <div>{selectedAppointment.client.name}</div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
