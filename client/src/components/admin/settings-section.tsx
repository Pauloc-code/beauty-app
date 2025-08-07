import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Settings, Clock, Calendar, Globe } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import type { SystemSettings } from "@shared/schema";

// --- Constantes ---
const BRAZIL_TIMEZONES = [
  { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
  { value: "America/Manaus", label: "Manaus (UTC-4)" },
];
const HOLIDAY_REGIONS = [
  { value: "sao_paulo", label: "São Paulo" },
  { value: "rio_de_janeiro", label: "Rio de Janeiro" },
];

// --- Funções do Firebase ---
const fetchSystemSettings = async (): Promise<SystemSettings> => {
    const settingsDocRef = doc(db, "systemSettings", "default");
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
        } as SystemSettings;
    } else {
        // Cria configurações padrão se não existirem
        const defaultSettings: Omit<SystemSettings, 'id'> = {
            timezone: "America/Sao_Paulo",
            showHolidays: true,
            holidayRegion: "sao_paulo",
            workingDays: [1, 2, 3, 4, 5, 6],
            workingHours: { start: "08:00", end: "18:00" },
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await setDoc(settingsDocRef, {
            ...defaultSettings,
            createdAt: Timestamp.fromDate(defaultSettings.createdAt),
            updatedAt: Timestamp.fromDate(defaultSettings.updatedAt),
        });
        return { id: "default", ...defaultSettings };
    }
};

const updateSystemSettings = async (settings: Partial<SystemSettings>) => {
    const settingsDocRef = doc(db, "systemSettings", "default");
    await setDoc(settingsDocRef, { ...settings, updatedAt: Timestamp.now() }, { merge: true });
};

export default function SettingsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [localSettings, setLocalSettings] = useState<Partial<SystemSettings>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: fetchSystemSettings,
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: updateSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemSettings"] });
      toast({ title: "Configurações salvas com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
  };

  const handleLocalUpdate = (key: keyof SystemSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading || !localSettings.timezone) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-primary" />Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />Fuso Horário</Label>
                <Select value={localSettings.timezone} onValueChange={(value) => handleLocalUpdate("timezone", value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BRAZIL_TIMEZONES.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Feriados</Label>
                <div className="flex items-center justify-between">
                  <span>Exibir na agenda</span>
                  <Switch checked={localSettings.showHolidays} onCheckedChange={(checked) => handleLocalUpdate("showHolidays", checked)} />
                </div>
                {localSettings.showHolidays && (
                  <Select value={localSettings.holidayRegion} onValueChange={(value) => handleLocalUpdate("holidayRegion", value)}>
                    <SelectTrigger><SelectValue placeholder="Região" /></SelectTrigger>
                    <SelectContent>{HOLIDAY_REGIONS.map(region => <SelectItem key={region.value} value={region.value}>{region.label}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <Label className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Horário de Funcionamento</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-time" className="text-xs text-gray-500">Abertura</Label>
                  <Input id="start-time" type="time" value={localSettings.workingHours?.start} onChange={(e) => handleLocalUpdate("workingHours", { ...localSettings.workingHours, start: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-xs text-gray-500">Fechamento</Label>
                  <Input id="end-time" type="time" value={localSettings.workingHours?.end} onChange={(e) => handleLocalUpdate("workingHours", { ...localSettings.workingHours, end: e.target.value })} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => setLocalSettings(settings || {})} disabled={updateSettingsMutation.isPending}>Cancelar</Button>
        <Button onClick={handleSave} disabled={updateSettingsMutation.isPending} className="bg-primary hover:bg-primary/90">
          {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
