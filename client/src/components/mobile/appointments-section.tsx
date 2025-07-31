import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AppointmentsSection() {
  // Mock client ID - in real app this would come from authentication
  const clientId = "mock-client-id";
  
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", { clientId }],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="status-confirmed">Confirmado</Badge>;
      case "scheduled":
        return <Badge className="status-pending">Agendado</Badge>;
      case "cancelled":
        return <Badge className="status-cancelled">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Meus Agendamentos</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
                <div className="h-8 bg-gray-200 rounded flex-1"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">Meus Agendamentos</h3>
      </div>
      
      <div className="space-y-4">
        {appointments?.length ? (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{appointment.service.name}</h4>
                {getStatusBadge(appointment.status)}
              </div>
              <p className="text-gray-600 mb-2">
                {format(new Date(appointment.date), "PPPP", { locale: ptBR })}
              </p>
              <p className="text-gray-600 mb-3">
                {format(new Date(appointment.date), "HH:mm", { locale: ptBR })} - 
                {format(new Date(new Date(appointment.date).getTime() + appointment.service.duration * 60000), "HH:mm", { locale: ptBR })}
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium">
                  Reagendar
                </Button>
                <Button variant="outline" className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200">
                  Cancelar
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500 mb-4">Você ainda não possui agendamentos</p>
            <Button className="bg-primary text-white">
              Fazer primeiro agendamento
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
