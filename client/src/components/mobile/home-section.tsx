import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HomeSection() {
  const { data: todayAppointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", { date: new Date().toISOString().split('T')[0] }],
  });

  const { data: galleryImages } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const nextAppointment = todayAppointments?.[0];

  return (
    <div className="p-6 space-y-6">
      {/* Next Appointment */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Próximo Agendamento</h3>
        {isLoading ? (
          <Card className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ) : nextAppointment ? (
          <Card className="bg-secondary p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{nextAppointment.service.name}</p>
                <p className="text-sm text-gray-600">
                  {formatDistanceToNow(new Date(nextAppointment.date), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
              <Button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">
                Detalhes
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-secondary p-4">
            <p className="text-gray-600 text-center">Nenhum agendamento para hoje</p>
          </Card>
        )}
      </div>

      {/* Quick Booking */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Agende Agora</h3>
        <Button className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-primary/90">
          <Calendar className="w-5 h-5 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Recent Work */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Trabalhos Recentes</h3>
        <div className="grid grid-cols-2 gap-3">
          {galleryImages?.slice(0, 4).map((image, index) => (
            <img
              key={image.id}
              src={image.url}
              alt={image.title || `Trabalho ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg gallery-image"
            />
          )) || (
            <>
              <img
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                alt="Nail art em gel com design floral"
                className="w-full h-32 object-cover rounded-lg gallery-image"
              />
              <img
                src="https://images.unsplash.com/photo-1576502200272-341a4b8d5ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300"
                alt="Manicure francesa elegante"
                className="w-full h-32 object-cover rounded-lg gallery-image"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
