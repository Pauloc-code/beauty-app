import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";
import type { Service } from "@shared/schema";

// Dados de exemplo que já existiam no seu ficheiro
const defaultServices: Service[] = [
    {
      id: "1",
      name: "Esmaltação em Gel",
      description: "Esmaltação duradoura com gel de alta qualidade",
      duration: 45,
      price: "35.00",
      points: 10,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      name: "Spa dos Pés",
      description: "Relaxamento completo com hidratação profunda",
      duration: 60,
      price: "50.00",
      points: 15,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // ...outros serviços de exemplo...
];

// Função de fetch simulada para o React Query
const fetchActiveServices = async (): Promise<Service[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return defaultServices.filter(s => s.active);
};

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  // A chamada ao useQuery foi corrigida
  const { data: services, isLoading } = useQuery({
    queryKey: ["activeServices"], // Chave de query corrigida
    queryFn: fetchActiveServices, // queryFn adicionada
  });

  const servicesToShow = services || [];

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Nossos Serviços</h3>
          <p className="text-gray-600 text-sm">Escolha o serviço perfeito para você</p>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border animate-pulse">
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
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
        <h3 className="text-xl font-bold text-gray-900">Nossos Serviços</h3>
        <p className="text-gray-600 text-sm">Escolha o serviço perfeito para você</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {servicesToShow.map((service: Service) => (
          <div
            key={service.id}
            onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
            className={`relative bg-white rounded-2xl p-4 shadow-sm border transition-all duration-300 cursor-pointer ${
              selectedService === service.id
                ? "shadow-lg transform scale-[1.02]"
                : "border-gray-200 hover:shadow-md active:scale-[0.98]"
            }`}
            style={{
              borderColor: selectedService === service.id ? 'var(--primary-color)' : undefined,
            }}
          >
            <div className="flex space-x-4 mb-4">
              <img
                src={service.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                alt={service.name}
                className="w-20 h-20 object-cover rounded-xl"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-lg text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{service.duration}min</span>
                  </div>
                  <Badge variant="secondary" style={{ backgroundColor: 'var(--accent-color)' }}>
                    +{service.points} pts
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-color)' }}>
                R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
              </div>
              <Button 
                className={`px-6 py-2 rounded-xl font-medium`}
                style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}
              >
                Selecionar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
