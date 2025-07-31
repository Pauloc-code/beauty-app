import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Star, Heart, Sparkles, Clock, MapPin } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentWithDetails, GalleryImage } from "@shared/schema";

export default function HomeSection() {
  const [selectedQuickAction, setSelectedQuickAction] = useState<string | null>(null);
  
  const { data: todayAppointments, isLoading } = useQuery({
    queryKey: ["/api/appointments", { date: new Date().toISOString().split('T')[0] }],
  });

  const { data: galleryImages } = useQuery({
    queryKey: ["/api/gallery"],
  });

  // Mock data para demonstração
  const mockNextAppointment: AppointmentWithDetails = {
    id: "1",
    clientId: "1",
    serviceId: "1",
    date: new Date(Date.now() + 7200000), // Em 2 horas
    status: "confirmed",
    notes: "Cliente prefere tons rosados",
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
      description: "Esmaltação duradoura",
      duration: 45,
      price: "35.00",
      points: 10,
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  const defaultGalleryImages: GalleryImage[] = [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Design artístico moderno",
      category: "Nail Art",
      createdAt: new Date()
    },
    {
      id: "2", 
      url: "https://images.unsplash.com/photo-1576502200272-341a4b8d5ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Francesa elegante",
      category: "Clássico",
      createdAt: new Date()
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Cores vibrantes",
      category: "Colorido",
      createdAt: new Date()
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Arte floral",
      category: "Floral",
      createdAt: new Date()
    }
  ];

  const nextAppointment = todayAppointments?.length ? todayAppointments[0] : mockNextAppointment;
  const imagesToShow = galleryImages?.length ? galleryImages : defaultGalleryImages;

  const quickActions = [
    { id: "book", label: "Agendar", icon: Calendar, color: "bg-primary" },
    { id: "gallery", label: "Ver Portfólio", icon: Heart, color: "bg-pink-500" },
    { id: "services", label: "Serviços", icon: Sparkles, color: "bg-purple-500" },
    { id: "profile", label: "Meu Perfil", icon: Star, color: "bg-amber-500" }
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Olá, Maria! 👋</h2>
        <p className="text-gray-600">Que tal cuidar das suas unhas hoje?</p>
      </div>

      {/* Next Appointment Card */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Próximo Agendamento</h3>
        {isLoading ? (
          <div className="bg-white rounded-2xl p-4 shadow-sm border animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : nextAppointment ? (
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20 shadow-sm">
            <div className="flex items-center space-x-4 mb-3">
              <img
                src={nextAppointment.service.imageUrl}
                alt={nextAppointment.service.name}
                className="w-12 h-12 object-cover rounded-xl ring-2 ring-primary ring-offset-2"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{nextAppointment.service.name}</h4>
                <div className="flex items-center text-primary text-sm space-x-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{format(new Date(nextAppointment.date), "HH:mm")}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{format(new Date(nextAppointment.date), "dd/MM")}</span>
                  </div>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {formatDistanceToNow(new Date(nextAppointment.date), { 
                  addSuffix: true, 
                  locale: ptBR 
                })}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Rua das Flores, 123</span>
              </div>
              <Button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transform transition-all duration-200 hover:scale-105">
                Ver Detalhes
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-6 text-center border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-600 mb-3">Nenhum agendamento para hoje</p>
            <Button className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-primary/90">
              Agendar Agora
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">Ações Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isSelected = selectedQuickAction === action.id;
            
            return (
              <button
                key={action.id}
                onClick={() => setSelectedQuickAction(isSelected ? null : action.id)}
                className={`relative p-4 rounded-2xl text-white font-semibold transition-all duration-300 ${
                  action.color
                } ${
                  isSelected 
                    ? "shadow-2xl transform scale-105 ring-4 ring-white ring-offset-2" 
                    : "shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-full transition-all duration-300 ${
                    isSelected ? "bg-white/30 scale-110" : "bg-white/20"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm">{action.label}</span>
                </div>
                
                {isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Work Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Trabalhos Recentes</h3>
          <Button variant="ghost" className="text-primary text-sm">
            Ver Todos
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {imagesToShow.slice(0, 4).map((image, index) => (
            <div
              key={image.id || index}
              className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-sm">
                <img
                  src={image.url}
                  alt={image.title || `Trabalho ${index + 1}`}
                  className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 right-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-xs font-medium">{image.title}</p>
                  {image.category && (
                    <span className="text-xs bg-primary px-2 py-1 rounded-full">
                      {image.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Points Status */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Seus Pontos</h4>
            <p className="text-2xl font-bold text-amber-600">150 pts</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Próxima recompensa:</p>
            <p className="text-sm font-medium text-amber-600">50 pts restantes</p>
          </div>
        </div>
        <div className="w-full bg-amber-200 rounded-full h-2 mt-3">
          <div className="bg-amber-500 h-2 rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>

      {/* Floating Action Button */}
      {selectedQuickAction && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Button className="w-full bg-primary text-white py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:bg-primary/90 transform transition-all duration-300 hover:scale-[1.02]">
            {quickActions.find(a => a.id === selectedQuickAction)?.label}
          </Button>
        </div>
      )}
    </div>
  );
}
