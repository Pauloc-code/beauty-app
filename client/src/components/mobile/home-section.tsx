import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Clock, Gift, Award, Crown } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentWithDetails, GalleryImage, Client, Service } from "@shared/schema";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";

// --- Funções do Firebase ---
const fetchNextAppointment = async (clientId: string): Promise<AppointmentWithDetails | null> => {
    if (!clientId) return null;

    const now = Timestamp.now();
    const appointmentsQuery = query(
        collection(db, "appointments"), 
        where("clientId", "==", clientId),
        where("date", ">=", now),
        orderBy("date", "asc"),
        limit(1)
    );
    
    const appointmentSnapshot = await getDocs(appointmentsQuery);
    if (appointmentSnapshot.empty) return null;

    const appointmentDoc = appointmentSnapshot.docs[0];
    const appointmentData = appointmentDoc.data();

    // Buscar dados do cliente e serviço
    const clientDoc = await getDocs(query(collection(db, "clients"), where("id", "==", appointmentData.clientId)));
    const serviceDoc = await getDocs(query(collection(db, "services"), where("id", "==", appointmentData.serviceId)));

    const client = clientDoc.docs[0]?.data() as Client;
    const service = serviceDoc.docs[0]?.data() as Service;

    return {
        id: appointmentDoc.id,
        ...appointmentData,
        date: appointmentData.date.toDate(),
        createdAt: appointmentData.createdAt.toDate(),
        updatedAt: appointmentData.updatedAt.toDate(),
        client,
        service,
    } as AppointmentWithDetails;
};

const fetchRecentGalleryImages = async (): Promise<GalleryImage[]> => {
    const q = query(collection(db, "galleryImages"), orderBy("createdAt", "desc"), limit(4));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt.toDate(),
        } as GalleryImage;
    });
};


interface HomeSectionProps {
  onSectionChange?: (section: string) => void;
}

export default function HomeSection({ onSectionChange }: HomeSectionProps) {
  const clientId = "mock-client-id"; // Em uma app real, viria da autenticação

  const { data: nextAppointment, isLoading: isLoadingAppointment } = useQuery({
    queryKey: ["nextAppointment", clientId],
    queryFn: () => fetchNextAppointment(clientId),
  });

  const { data: galleryImages = [], isLoading: isLoadingGallery } = useQuery({
    queryKey: ["recentGalleryImages"],
    queryFn: fetchRecentGalleryImages,
  });

  return (
    <div className="p-4 space-y-6">
      {/* Próximo Agendamento */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Próximo Agendamento</h3>
        {isLoadingAppointment ? <p>Carregando...</p> : nextAppointment ? (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20 shadow-sm">
            <div className="flex items-center space-x-4 mb-3">
              <img src={nextAppointment.service.imageUrl || ""} alt={nextAppointment.service.name} className="w-12 h-12 object-cover rounded-xl ring-2 ring-primary ring-offset-2" />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{nextAppointment.service.name}</h4>
                <div className="flex items-center text-primary text-sm space-x-3">
                  <div className="flex items-center"><Clock className="w-4 h-4 mr-1" /><span>{format(nextAppointment.date, "HH:mm")}</span></div>
                  <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" /><span>{format(nextAppointment.date, "dd/MM")}</span></div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">{formatDistanceToNow(nextAppointment.date, { addSuffix: true, locale: ptBR })}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-amber-600 text-sm"><Star className="w-4 h-4 mr-1 fill-current" /><span>+{nextAppointment.service.points || 15} pontos</span></div>
              <Button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium" onClick={() => onSectionChange?.('appointments')}>Ver Detalhes</Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-600 mb-3">Nenhum agendamento futuro encontrado.</p>
            <Button className="bg-primary text-white px-6 py-2 rounded-xl font-medium">Agendar Agora</Button>
          </div>
        )}
      </div>

      {/* Galeria de Trabalhos Recentes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Trabalhos Recentes</h3>
          <Button variant="ghost" className="text-sm text-primary" onClick={() => onSectionChange?.('portfolio')}>Ver Todos</Button>
        </div>
        {isLoadingGallery ? <p>Carregando...</p> : (
            <div className="grid grid-cols-2 gap-3">
                {galleryImages.map((image) => (
                    <div key={image.id} className="relative group cursor-pointer">
                        <div className="relative overflow-hidden rounded-2xl shadow-sm">
                            <img src={image.url} alt={image.title || 'Trabalho recente'} className="w-full h-32 object-cover" />
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* Cartão Fidelidade */}
      <div className="rounded-2xl p-4 border bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2"><Gift className="w-6 h-6 text-primary" /><h4 className="font-bold text-gray-900">Cartão Fidelidade</h4></div>
          <Badge className="bg-primary text-white">VIP</Badge>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Seus pontos</p>
            <p className="text-2xl font-bold text-primary">150 pts</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Próxima recompensa</p>
            <p className="text-sm font-semibold text-accent">50 pts restantes</p>
          </div>
        </div>
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-900 flex items-center"><Star className="w-4 h-4 mr-2 text-amber-500" />Prêmios Disponíveis</h5>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/50 rounded-xl p-3 border border-primary/10">
              <div className="flex items-center space-x-2 mb-2"><Crown className="w-4 h-4 text-amber-500" /><span className="text-xs font-medium">200 pts</span></div>
              <p className="text-sm font-semibold">Spa Completo</p>
            </div>
            <div className="bg-white/50 rounded-xl p-3 border border-primary/10">
              <div className="flex items-center space-x-2 mb-2"><Award className="w-4 h-4 text-purple-500" /><span className="text-xs font-medium">100 pts</span></div>
              <p className="text-sm font-semibold">Nail Art Premium</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
