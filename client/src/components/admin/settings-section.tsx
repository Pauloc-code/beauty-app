import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Clock, Calendar, Globe } from "lucide-react";

// Lista de fusos horários do Brasil
const BRAZIL_TIMEZONES = [
  { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
  { value: "America/Manaus", label: "Manaus (UTC-4)" },
  { value: "America/Rio_Branco", label: "Rio Branco (UTC-5)" },
  { value: "America/Noronha", label: "Fernando de Noronha (UTC-2)" },
];

// Regiões de feriados
const HOLIDAY_REGIONS = [
  { value: "sao_paulo", label: "São Paulo" },
  { value: "rio_de_janeiro", label: "Rio de Janeiro" },
  { value: "belo_horizonte", label: "Belo Horizonte" },
  { value: "brasilia", label: "Brasília" },
  { value: "salvador", label: "Salvador" },
  { value: "recife", label: "Recife" },
  { value: "fortaleza", label: "Fortaleza" },
  { value: "porto_alegre", label: "Porto Alegre" },
  { value: "curitiba", label: "Curitiba" },
  { value: "manaus", label: "Manaus" },
];

interface SystemSettings {
  id: string;
  timezone: string;
  showHolidays: boolean;
  holidayRegion: string;
  workingDays: number[];
  workingHours: {
    start: string;
    end: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function SettingsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localSettings, setLocalSettings] = useState<Partial<SystemSettings>>({});

  const { data: settings, isLoading } = useQuery<SystemSettings>({
    queryKey: ["/api/system-settings"],
  });

  // Update local settings when data changes
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<SystemSettings>) => {
      console.log('🔄 Salvando configurações:', updatedSettings);
      
      try {
        const response = await apiRequest("PUT", "/api/system-settings", updatedSettings);
        const result = await response.json();
        console.log('✅ Resultado:', result);
        return result;
      } catch (error) {
        console.error('❌ Erro na API:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Sucesso! Invalidando cache...');
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      setLocalSettings({}); // Clear local changes
      toast({
        title: "Configurações salvas",
        description: "As configurações do sistema foram atualizadas com sucesso!",
      });
    },
    onError: (error) => {
      console.error('💥 Erro completo:', error);
      toast({
        title: "Erro",
        description: `Falha ao salvar: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    console.log('🚀 Clique no botão Salvar - configurações locais:', localSettings);
    if (Object.keys(localSettings).length === 0) {
      console.warn('⚠️ Nenhuma alteração para salvar');
      toast({
        title: "Nenhuma alteração",
        description: "Não há configurações para salvar.",
        variant: "default",
      });
      return;
    }
    updateSettingsMutation.mutate(localSettings);
  };

  const handleLocalUpdate = (key: keyof SystemSettings, value: any) => {
    console.log(`🔧 Alterando ${key}:`, value);
    setLocalSettings(prev => {
      const newSettings = {
        ...prev,
        [key]: value
      };
      console.log('📝 Configurações locais atualizadas:', newSettings);
      return newSettings;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
        </div>
        <div className="animate-pulse">
          <div className="grid gap-6">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-pink-600" />
        <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
      </div>

      {/* Layout Compacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-pink-600" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Coluna 1: Timezone e Feriados */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-pink-600" />
                  Fuso Horário
                </Label>
                <Select
                  value={localSettings.timezone || settings?.timezone}
                  onValueChange={(value) => handleLocalUpdate("timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar fuso horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRAZIL_TIMEZONES.map((timezone) => (
                      <SelectItem key={timezone.value} value={timezone.value}>
                        {timezone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-pink-600" />
                  Feriados
                </Label>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Exibir na agenda</span>
                  <Switch
                    checked={localSettings.showHolidays ?? settings?.showHolidays ?? true}
                    onCheckedChange={(checked) => handleLocalUpdate("showHolidays", checked)}
                  />
                </div>
                
                {(localSettings.showHolidays ?? settings?.showHolidays ?? true) && (
                  <Select
                    value={localSettings.holidayRegion || settings?.holidayRegion}
                    onValueChange={(value) => handleLocalUpdate("holidayRegion", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Região" />
                    </SelectTrigger>
                    <SelectContent>
                      {HOLIDAY_REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Coluna 2: Horário de Funcionamento */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-pink-600" />
                Horário de Funcionamento
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-time" className="text-xs text-gray-500">Abertura</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={localSettings.workingHours?.start || settings?.workingHours?.start || "08:00"}
                    onChange={(e) => handleLocalUpdate("workingHours", {
                      ...((localSettings.workingHours || settings?.workingHours) ?? {}),
                      start: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-xs text-gray-500">Fechamento</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={localSettings.workingHours?.end || settings?.workingHours?.end || "18:00"}
                    onChange={(e) => handleLocalUpdate("workingHours", {
                      ...((localSettings.workingHours || settings?.workingHours) ?? {}),
                      end: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => setLocalSettings(settings || {})}
          disabled={updateSettingsMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}