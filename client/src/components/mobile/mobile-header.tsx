import { Bell, Gift, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MobileHeaderProps {
  backgroundColor?: string;
}

export default function MobileHeader({ backgroundColor = "gradient-header" }: MobileHeaderProps) {
  // Mock client data - em um app real viria da autenticação
  const clientData = {
    name: "Maria Silva",
    points: 175,
    nextRewardAt: 200,
    totalRewards: 3
  };

  const progressPercentage = (clientData.points / clientData.nextRewardAt) * 100;
  const pointsToNextReward = clientData.nextRewardAt - clientData.points;
  const canRedeem = clientData.points >= clientData.nextRewardAt;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className={`${backgroundColor} p-6 text-white relative overflow-hidden`}>
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        {/* Header with profile and notifications */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80" 
                alt="Perfil da cliente" 
                className="w-14 h-14 rounded-full border-3 border-white shadow-lg object-cover"
              />
              {canRedeem && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Gift className="w-3 h-3 text-yellow-900" />
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm opacity-90 font-medium">
                {getGreeting()}, seja bem-vinda!
              </p>
              <h2 className="text-xl font-bold mb-1">{clientData.name}</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canRedeem && (
              <Badge className="bg-yellow-400 text-yellow-900 text-xs font-bold animate-pulse">
                Resgate
              </Badge>
            )}
            <button className="p-3 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-all duration-200 hover:scale-105">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Loyalty Progress Section */}
        <div className="bg-white bg-opacity-15 rounded-xl p-3 backdrop-blur-sm border border-white border-opacity-20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Star className="w-4 h-4 text-yellow-300 fill-current" />
              <span className="font-semibold text-xs">Programa de Fidelidade</span>
            </div>
            <div className="text-right">
              <span className="text-base font-bold">{clientData.points}</span>
              <span className="text-xs opacity-90 ml-1">pts</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mb-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-yellow-300 to-yellow-400 h-full rounded-full transition-all duration-1000 ease-out shadow-inner relative"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              >
                {/* Shimmer effect on progress bar */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-opacity-30 to-transparent animate-shimmer"></div>
              </div>
            </div>
            
            {/* Progress indicator dots */}
            <div className="flex justify-between absolute -top-0.5 left-0 right-0">
              {[25, 50, 75, 100].map((milestone) => (
                <div
                  key={milestone}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    progressPercentage >= milestone 
                      ? 'bg-yellow-300 shadow-md' 
                      : 'bg-white bg-opacity-30'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Progress Text */}
          <div className="flex items-center justify-between text-xs opacity-90 mt-2">
            {canRedeem ? (
              <div className="flex items-center space-x-1.5">
                <Gift className="w-3 h-3 text-yellow-300" />
                <span className="font-semibold text-yellow-300 text-xs">
                  🎉 Você pode resgatar uma recompensa!
                </span>
              </div>
            ) : (
              <span className="text-xs">
                Faltam apenas <span className="font-bold text-yellow-300">{pointsToNextReward} pontos</span> para sua próxima recompensa
              </span>
            )}
            <span className="text-right text-xs">
              Meta: {clientData.nextRewardAt}
            </span>
          </div>
          
          {/* Rewards earned indicator */}
          {clientData.totalRewards > 0 && (
            <div className="flex items-center space-x-1 mt-1.5 pt-1.5 border-t border-white border-opacity-20">
              <span className="text-xs opacity-75">Recompensas obtidas:</span>
              <div className="flex space-x-0.5">
                {Array.from({ length: Math.min(clientData.totalRewards, 5) }, (_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 text-yellow-300 fill-current" />
                ))}
                {clientData.totalRewards > 5 && (
                  <span className="text-xs">+{clientData.totalRewards - 5}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
