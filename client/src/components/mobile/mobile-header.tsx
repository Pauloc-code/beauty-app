import { Bell, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MobileHeader() {
  return (
    <div 
      className="p-4 text-white relative overflow-hidden"
      style={{ background: 'var(--header-gradient)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-8 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-4 left-8 w-24 h-24 bg-white rounded-full"></div>
      </div>
      
      <div className="relative">
        {/* Header with greeting and notification */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-yellow-400 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face" 
                alt="Maria Silva" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm opacity-90">Boa tarde, seja bem-vinda!</p>
              <h2 className="text-lg font-bold">Maria Silva</h2>
            </div>
          </div>
          
          <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Loyalty Program Card */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-semibold">Programa de Fidelidade</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold">175</div>
              <div className="text-xs opacity-80">pontos</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: '70%' }}
              ></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-90">Faltam apenas 25 pontos para sua próxima recompensa</span>
            <Badge 
              className="bg-white/20 text-white text-xs px-2 py-1"
            >
              Meta: 200
            </Badge>
          </div>
          
          <div className="mt-2 flex items-center space-x-1">
            <span className="text-xs opacity-80">Recompensas recebidas:</span>
            <div className="flex space-x-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}