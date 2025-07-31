import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Star } from "lucide-react";
import type { Service } from "@shared/schema";

export default function ServicesSection() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services/active"],
  });

  // Dados de exemplo para demonstração
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
    {
      id: "3",
      name: "Unhas de Fibra",
      description: "Alongamento e fortalecimento com fibra",
      duration: 90,
      price: "80.00",
      points: 25,
      active: true,
      imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const servicesToShow = (services as Service[])?.length ? (services as Service[]) : defaultServices;

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
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nossos Serviços</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Escolha o serviço perfeito para você</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {servicesToShow.map((service: Service) => (
          <div
            key={service.id}
            onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
            className={`relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 cursor-pointer ${
              selectedService === service.id
                ? "shadow-lg transform scale-[1.02]"
                : "border-gray-200 hover:shadow-md active:scale-[0.98]"
            }`}
            style={{
              borderColor: selectedService === service.id ? 'var(--primary-color)' : undefined,
              background: selectedService === service.id 
                ? `linear-gradient(to right, var(--primary-color)05, var(--accent-color)05)` 
                : undefined
            }}
          >
            {/* Indicador visual de seleção */}
            {selectedService === service.id && (
              <div 
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary-color)' }}
              >
                <Star className="w-3 h-3 text-white fill-current" />
              </div>
            )}

            <div className="flex space-x-4 mb-4">
              <div className="relative">
                <img
                  src={service.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                  alt={service.name}
                  className={`w-20 h-20 object-cover rounded-xl transition-all duration-300 ${
                    selectedService === service.id ? "ring-2 ring-offset-2" : ""
                  }`}
                  style={selectedService === service.id ? {
                    '--tw-ring-color': 'var(--primary-color)'
                  } as React.CSSProperties : {}}
                />
              </div>
              
              <div className="flex-1">
                <h4 
                  className={`font-semibold text-lg transition-colors ${
                    selectedService === service.id ? "" : "text-gray-900"
                  }`}
                  style={{
                    color: selectedService === service.id ? 'var(--primary-color)' : undefined
                  }}
                >
                  {service.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{service.duration}min</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-white text-xs"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    +{service.points} pts
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div 
                className="text-2xl font-bold"
                style={{ color: 'var(--primary-color)' }}
              >
                R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
              </div>
              
              <Button 
                className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                  selectedService === service.id
                    ? "text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-700 hover:text-white"
                }`}
                style={{
                  backgroundColor: selectedService === service.id ? 'var(--primary-color)' : undefined
                }}
                onMouseEnter={(e) => {
                  if (selectedService !== service.id) {
                    e.currentTarget.style.backgroundColor = 'var(--primary-color)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedService !== service.id) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '';
                  }
                }}
              >
                {selectedService === service.id ? "Selecionado" : "Selecionar"}
              </Button>
            </div>

            {/* Animação de destaque */}
            {selectedService === service.id && (
              <div 
                className="absolute inset-0 rounded-2xl opacity-50 animate-pulse pointer-events-none"
                style={{
                  background: `linear-gradient(to right, var(--primary-color)10, var(--accent-color)10)`
                }}
              ></div>
            )}
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Button 
            className="w-full text-white py-4 rounded-2xl font-semibold text-lg shadow-2xl transform transition-all duration-300 hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--primary-color)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color)90';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-color)';
            }}
          >
            Agendar Serviço Selecionado
          </Button>
        </div>
      )}

      {servicesToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💅</span>
          </div>
          <p className="text-gray-500 mb-4">Nenhum serviço disponível no momento</p>
        </div>
      )}
    </div>
  );
}
