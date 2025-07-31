import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Star, Heart, Sparkles, Clock, MapPin, Gift, Award, Crown } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentWithDetails, GalleryImage } from "@shared/schema";

export default function HomeSection() {
  
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
      description: "Nail art com desenhos únicos",
      category: "Nail Art",
      createdAt: new Date()
    },
    {
      id: "2", 
      url: "https://images.unsplash.com/photo-1576502200272-341a4b8d5ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Francesa elegante",
      description: "Estilo clássico francesinha",
      category: "Clássico",
      createdAt: new Date()
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Cores vibrantes",
      description: "Esmaltes coloridos e brilhantes",
      category: "Colorido",
      createdAt: new Date()
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      title: "Arte floral",
      description: "Desenhos delicados com flores",
      category: "Floral",
      createdAt: new Date()
    }
  ];

  const nextAppointment = (todayAppointments as AppointmentWithDetails[])?.length 
    ? (todayAppointments as AppointmentWithDetails[])[0] 
    : mockNextAppointment;
  const imagesToShow = (galleryImages as GalleryImage[])?.length 
    ? (galleryImages as GalleryImage[]) 
    : defaultGalleryImages;



  return (
    <div className="p-4 space-y-6">



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
                src={nextAppointment.service.imageUrl || ""}
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
              <div className="flex items-center text-amber-600 text-sm">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span>+{nextAppointment.service.loyaltyPoints || 15} pontos fidelidade</span>
              </div>
              <Button 
                className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transform transition-all duration-200 hover:scale-105"
                onClick={() => {
                  // Aqui você pode adicionar a lógica para mostrar detalhes do agendamento
                  console.log('Mostrar detalhes do agendamento:', nextAppointment);
                }}
              >
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



      {/* Recent Work Gallery */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">Trabalhos Recentes</h3>
          <Button 
            variant="ghost" 
            className="text-sm"
            style={{ color: 'var(--primary-color)' }}
          >
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
                    <span 
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      {image.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty Card with Rewards */}
      <div 
        className="rounded-2xl p-4 border"
        style={{
          background: `linear-gradient(to bottom right, var(--primary-color)10, var(--accent-color)10, var(--primary-color)05)`,
          borderColor: 'var(--primary-color)20'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Gift 
              className="w-6 h-6" 
              style={{ color: 'var(--primary-color)' }}
            />
            <h4 className="font-bold text-gray-900">Cartão Fidelidade</h4>
          </div>
          <Badge 
            className="text-white"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            VIP
          </Badge>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Seus pontos</p>
            <p 
              className="text-2xl font-bold"
              style={{ color: 'var(--primary-color)' }}
            >
              150 pts
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Para próxima recompensa</p>
            <p 
              className="text-sm font-semibold"
              style={{ color: 'var(--accent-color)' }}
            >
              50 pts restantes
            </p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className="h-3 rounded-full transition-all duration-500" 
            style={{ 
              width: '75%',
              background: `linear-gradient(to right, var(--primary-color), var(--accent-color))`
            }}
          ></div>
        </div>
        
        <div className="space-y-3">
          <h5 className="font-semibold text-gray-900 flex items-center">
            <Star className="w-4 h-4 mr-2 text-amber-500" />
            Prêmios Disponíveis
          </h5>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Available Rewards */}
            <div 
              className="bg-white/50 rounded-xl p-3 border"
              style={{ borderColor: 'var(--primary-color)10' }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-gray-700">200 pts</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Spa Completo</p>
              <p className="text-xs text-gray-600">Mão + Pé + Hidratação</p>
            </div>
            
            <div 
              className="bg-white/50 rounded-xl p-3 border"
              style={{ borderColor: 'var(--primary-color)10' }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium text-gray-700">100 pts</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Nail Art Premium</p>
              <p className="text-xs text-gray-600">Design personalizado</p>
            </div>
            
            <div 
              className="rounded-xl p-3 border"
              style={{
                backgroundColor: 'var(--primary-color)05',
                borderColor: 'var(--primary-color)20'
              }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <Gift 
                  className="w-4 h-4" 
                  style={{ color: 'var(--primary-color)' }}
                />
                <span 
                  className="text-xs font-medium" 
                  style={{ color: 'var(--primary-color)' }}
                >
                  50 pts
                </span>
              </div>
              <p 
                className="text-sm font-semibold" 
                style={{ color: 'var(--primary-color)' }}
              >
                Desconto 20%
              </p>
              <p 
                className="text-xs" 
                style={{ color: 'var(--primary-color)70' }}
              >
                Próximo serviço
              </p>
              <Button size="sm" className="w-full mt-2 h-6 text-xs">
                Resgatar
              </Button>
            </div>
            
            <div className="bg-white/50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">300 pts</span>
              </div>
              <p className="text-sm font-semibold text-gray-500">Curso Básico</p>
              <p className="text-xs text-gray-400">Técnicas de manicure</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
