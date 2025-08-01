import { useState } from "react";
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
    onSuccess: (data) => {
      setLocalSettings(data);
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: Partial<SystemSettings>) =>
      apiRequest("/api/system-settings", {
        method: "PUT",
        body: JSON.stringify(updatedSettings),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      toast({
        title: "Configurações salvas",
        description: "As configurações do sistema foram atualizadas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const handleLocalUpdate = (key: keyof SystemSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
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

      <div className="grid gap-6">
        {/* Configurações de Fuso Horário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-pink-600" />
              Fuso Horário
            </CardTitle>
            <CardDescription>
              Configure o fuso horário padrão para agendamentos e relatórios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Fuso Horário</Label>
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
          </CardContent>
        </Card>

        {/* Configurações de Feriados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-pink-600" />
              Feriados
            </CardTitle>
            <CardDescription>
              Configure a exibição de feriados na agenda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-holidays">Exibir Feriados</Label>
                <p className="text-sm text-gray-500">
                  Mostrar feriados nacionais e regionais na agenda
                </p>
              </div>
              <Switch
                id="show-holidays"
                checked={localSettings.showHolidays ?? settings?.showHolidays ?? true}
                onCheckedChange={(checked) => handleLocalUpdate("showHolidays", checked)}
              />
            </div>
            
            {(localSettings.showHolidays ?? settings?.showHolidays ?? true) && (
              <div className="space-y-2">
                <Label htmlFor="holiday-region">Região dos Feriados</Label>
                <Select
                  value={localSettings.holidayRegion || settings?.holidayRegion}
                  onValueChange={(value) => handleLocalUpdate("holidayRegion", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar região" />
                  </SelectTrigger>
                  <SelectContent>
                    {HOLIDAY_REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações de Horário de Funcionamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-pink-600" />
              Horário de Funcionamento
            </CardTitle>
            <CardDescription>
              Configure os horários de funcionamento padrão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Horário de Abertura</Label>
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
              <div className="space-y-2">
                <Label htmlFor="end-time">Horário de Fechamento</Label>
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
          </CardContent>
        </Card>
      </div>

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