import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { applyColorSettings } from "@/lib/color-utils";
import type { SystemSettings } from "@shared/schema";

export default function SettingsSection() {
  const { toast } = useToast();
  const [colorSettings, setColorSettings] = useState({
    primaryColor: "#e91e63",
    accentColor: "#f06292",
    gradientStart: "#e91e63",
    gradientEnd: "#f06292"
  });

  const { data: settings, isLoading } = useQuery<SystemSettings[]>({
    queryKey: ["/api/settings"],
  });

  // Initialize color settings from database
  useEffect(() => {
    if (settings && Array.isArray(settings) && settings.length > 0) {
      setColorSettings({
        primaryColor: settings.find((s: SystemSettings) => s.key === "app_primary_color")?.value || "#e91e63",
        accentColor: settings.find((s: SystemSettings) => s.key === "app_accent_color")?.value || "#f06292",
        gradientStart: settings.find((s: SystemSettings) => s.key === "app_gradient_start")?.value || "#e91e63",
        gradientEnd: settings.find((s: SystemSettings) => s.key === "app_gradient_end")?.value || "#f06292"
      });
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { key: string; value: string }[]) =>
      apiRequest("/api/settings/bulk", "POST", data),
    onSuccess: () => {
      // Apply colors immediately
      const mockSettings = [
        { key: "app_primary_color", value: colorSettings.primaryColor },
        { key: "app_accent_color", value: colorSettings.accentColor },
        { key: "app_gradient_start", value: colorSettings.gradientStart },
        { key: "app_gradient_end", value: colorSettings.gradientEnd }
      ] as SystemSettings[];
      
      applyColorSettings(mockSettings);
      
      // Invalidate all settings queries to refresh data everywhere
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      
      toast({
        title: "Configurações salvas",
        description: "As cores foram atualizadas com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Settings update error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  const colorPresets = [
    {
      name: "Rosa Clássico",
      primary: "#e91e63",
      accent: "#f06292",
      gradientStart: "#e91e63",
      gradientEnd: "#f06292"
    },
    {
      name: "Roxo Elegante",
      primary: "#9c27b0",
      accent: "#ba68c8",
      gradientStart: "#9c27b0",
      gradientEnd: "#ba68c8"
    },
    {
      name: "Azul Serenidade",
      primary: "#3f51b5",
      accent: "#7986cb",
      gradientStart: "#3f51b5",
      gradientEnd: "#7986cb"
    },
    {
      name: "Verde Natureza",
      primary: "#4caf50",
      accent: "#81c784",
      gradientStart: "#4caf50",
      gradientEnd: "#81c784"
    },
    {
      name: "Laranja Energia",
      primary: "#ff9800",
      accent: "#ffb74d",
      gradientStart: "#ff9800",
      gradientEnd: "#ffb74d"
    },
    {
      name: "Coral Moderno",
      primary: "#ff5722",
      accent: "#ff8a65",
      gradientStart: "#ff5722",
      gradientEnd: "#ff8a65"
    }
  ];

  const handleColorChange = (key: string, value: string) => {
    setColorSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: typeof colorPresets[0]) => {
    setColorSettings({
      primaryColor: preset.primary,
      accentColor: preset.accent,
      gradientStart: preset.gradientStart,
      gradientEnd: preset.gradientEnd
    });
  };

  const handleSave = () => {
    const settingsArray = [
      { key: "app_primary_color", value: colorSettings.primaryColor },
      { key: "app_accent_color", value: colorSettings.accentColor },
      { key: "app_gradient_start", value: colorSettings.gradientStart },
      { key: "app_gradient_end", value: colorSettings.gradientEnd }
    ];
    
    updateSettingsMutation.mutate(settingsArray);
  };

  const resetToDefault = () => {
    setColorSettings({
      primaryColor: "#e91e63",
      accentColor: "#f06292",
      gradientStart: "#e91e63",
      gradientEnd: "#f06292"
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Personalize a aparência do aplicativo</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h2>
        <p className="text-gray-600">Personalize a aparência do aplicativo mobile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Personalização de Cores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex items-center space-x-3 mt-1">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={colorSettings.primaryColor}
                    onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                    className="w-16 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colorSettings.primaryColor}
                    onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                    className="flex-1"
                    placeholder="#e91e63"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accentColor">Cor de Destaque</Label>
                <div className="flex items-center space-x-3 mt-1">
                  <Input
                    id="accentColor"
                    type="color"
                    value={colorSettings.accentColor}
                    onChange={(e) => handleColorChange("accentColor", e.target.value)}
                    className="w-16 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={colorSettings.accentColor}
                    onChange={(e) => handleColorChange("accentColor", e.target.value)}
                    className="flex-1"
                    placeholder="#f06292"
                  />
                </div>
              </div>

              <div>
                <Label>Gradiente do Header</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div>
                    <Label htmlFor="gradientStart" className="text-xs text-gray-500">Início</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="gradientStart"
                        type="color"
                        value={colorSettings.gradientStart}
                        onChange={(e) => handleColorChange("gradientStart", e.target.value)}
                        className="w-12 h-8 p-1 rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={colorSettings.gradientStart}
                        onChange={(e) => handleColorChange("gradientStart", e.target.value)}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="gradientEnd" className="text-xs text-gray-500">Fim</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="gradientEnd"
                        type="color"
                        value={colorSettings.gradientEnd}
                        onChange={(e) => handleColorChange("gradientEnd", e.target.value)}
                        className="w-12 h-8 p-1 rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={colorSettings.gradientEnd}
                        onChange={(e) => handleColorChange("gradientEnd", e.target.value)}
                        className="flex-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {updateSettingsMutation.isPending ? "Salvando..." : "Salvar Cores"}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetToDefault}
                className="px-4"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Header Preview */}
              <div 
                className="p-4 rounded-2xl text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${colorSettings.gradientStart}, ${colorSettings.gradientEnd})`
                }}
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full"></div>
                    <div>
                      <p className="text-xs opacity-90">Boa tarde, seja bem-vinda!</p>
                      <h3 className="font-bold">Cliente Exemplo</h3>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-15 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium">Programa de Fidelidade</span>
                      <span className="text-sm font-bold">175 pts</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                      <div className="bg-yellow-300 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button Preview */}
              <div className="space-y-3">
                <button 
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors"
                  style={{ backgroundColor: colorSettings.primaryColor }}
                >
                  Botão Primário
                </button>
                <button 
                  className="w-full py-3 px-4 rounded-xl text-white font-semibold transition-colors"
                  style={{ backgroundColor: colorSettings.accentColor }}
                >
                  Botão de Destaque
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Presets */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Esquemas de Cores Predefinidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {colorPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="group p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200 hover:scale-105"
                >
                  <div 
                    className="w-full h-16 rounded-lg mb-2"
                    style={{
                      background: `linear-gradient(135deg, ${preset.gradientStart}, ${preset.gradientEnd})`
                    }}
                  ></div>
                  <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900">
                    {preset.name}
                  </p>
                  <div className="flex justify-center space-x-1 mt-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: preset.primary }}
                    ></div>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: preset.accent }}
                    ></div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}