import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gift, Star, Crown, Award, Trophy, Sparkles, Clock, CheckCircle } from "lucide-react";

export default function LoyaltySection() {
  const [activeTab, setActiveTab] = useState<"rewards" | "history">("rewards");

  // Mock data para demonstração
  const userPoints = 150;
  const nextRewardPoints = 200;
  const progressPercentage = (userPoints / nextRewardPoints) * 100;

  const availableRewards = [
    {
      id: 1,
      name: "Desconto 20%",
      description: "No próximo serviço",
      points: 50,
      icon: Gift,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
      available: true
    },
    {
      id: 2, 
      name: "Nail Art Premium",
      description: "Design personalizado",
      points: 100,
      icon: Award,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      available: true
    },
    {
      id: 3,
      name: "Spa Completo",
      description: "Mão + Pé + Hidratação",
      points: 200,
      icon: Crown,
      color: "text-amber-500", 
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      available: false
    },
    {
      id: 4,
      name: "Curso Básico",
      description: "Técnicas de manicure",
      points: 300,
      icon: Trophy,
      color: "text-gray-400",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      available: false
    }
  ];

  const pointsHistory = [
    {
      id: 1,
      date: "2024-01-25",
      description: "Manicure Francesa",
      points: +25,
      type: "earned"
    },
    {
      id: 2,
      date: "2024-01-20",
      description: "Desconto 20% resgatado",
      points: -50,
      type: "redeemed"
    },
    {
      id: 3,
      date: "2024-01-15",
      description: "Pedicure + Esmaltação",
      points: +30,
      type: "earned"
    },
    {
      id: 4,
      date: "2024-01-10",
      description: "Nail Art Personalizada",
      points: +45,
      type: "earned"
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* Header with user status */}
      <div className="text-center">
        <div className="flex justify-center items-center space-x-2 mb-2">
          <Gift className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Fidelidade</h2>
        </div>
        <Badge className="bg-primary text-white px-4 py-1">
          Status VIP
        </Badge>
      </div>

      {/* Points Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Seus Pontos</span>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-2xl font-bold text-primary">{userPoints}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progresso para próxima recompensa</span>
            <span className="font-semibold text-accent">
              {nextRewardPoints - userPoints} pts restantes
            </span>
          </div>
          
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{userPoints} pts</span>
              <span>{nextRewardPoints} pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("rewards")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "rewards"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Recompensas
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "history"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Histórico
        </button>
      </div>

      {/* Rewards Tab */}
      {activeTab === "rewards" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-amber-500" />
            Recompensas Disponíveis
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {availableRewards.map((reward) => {
              const IconComponent = reward.icon;
              const canRedeem = userPoints >= reward.points && reward.available;
              
              return (
                <Card 
                  key={reward.id}
                  className={`${reward.bgColor} ${reward.borderColor} border transition-all duration-200 ${
                    canRedeem ? "hover:shadow-lg hover:scale-[1.02]" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${reward.bgColor}`}>
                          <IconComponent className={`w-5 h-5 ${reward.color}`} />
                        </div>
                        <div>
                          <h4 className={`font-semibold ${canRedeem ? "text-gray-900" : "text-gray-500"}`}>
                            {reward.name}
                          </h4>
                          <p className={`text-sm ${canRedeem ? "text-gray-600" : "text-gray-400"}`}>
                            {reward.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-medium ${canRedeem ? reward.color : "text-gray-400"}`}>
                          {reward.points} pts
                        </div>
                        {canRedeem ? (
                          <Button size="sm" className="mt-2 h-7 text-xs">
                            Resgatar
                          </Button>
                        ) : (
                          <Badge variant="outline" className="mt-2 text-xs">
                            {userPoints < reward.points ? "Insuficiente" : "Indisponível"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-gray-600" />
            Histórico de Pontos
          </h3>
          
          <div className="space-y-3">
            {pointsHistory.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        entry.type === "earned" ? "bg-green-50" : "bg-red-50"
                      }`}>
                        {entry.type === "earned" ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Gift className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(entry.date)}</p>
                      </div>
                    </div>
                    
                    <div className={`font-bold ${
                      entry.points > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {entry.points > 0 ? "+" : ""}{entry.points} pts
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center pt-4">
            <Button variant="outline" size="sm">
              Ver Mais Histórico
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}