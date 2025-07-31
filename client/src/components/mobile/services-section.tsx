import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ServicesSection() {
  const { data: services, isLoading } = useQuery({
    queryKey: ["/api/services/active"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Nossos Serviços</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
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
        <h3 className="text-xl font-bold text-gray-900">Nossos Serviços</h3>
      </div>
      
      <div className="space-y-4">
        {services?.map((service) => (
          <Card key={service.id} className="service-card border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <img
                src={service.imageUrl || "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                alt={service.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                <p className="text-sm text-gray-600">{service.duration} min</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-lg font-bold text-primary">
                    R$ {parseFloat(service.price).toFixed(2).replace('.', ',')}
                  </span>
                  <Badge variant="secondary" className="bg-accent text-white">
                    +{service.points} pts
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="w-full mt-3 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/90">
              Agendar
            </Button>
          </Card>
        )) || (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum serviço disponível no momento</p>
          </div>
        )}
      </div>
    </div>
  );
}
