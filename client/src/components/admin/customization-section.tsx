import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Palette, Eye, Smartphone } from "lucide-react";

interface ColorTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_THEMES = [
  {
    name: "Rosa Clássico",
    primaryColor: "#ec4899",
    secondaryColor: "#f9a8d4",
    accentColor: "#fce7f3",
    backgroundColor: "#ffffff",
    textColor: "#1f2937"
  },
  {
    name: "Rosa Vibrante",
    primaryColor: "#e91e63",
    secondaryColor: "#f48fb1",
    accentColor: "#fce4ec",
    backgroundColor: "#ffffff",
    textColor: "#212121"
  },
  {
    name: "Magenta Luxo",
    primaryColor: "#d946ef",
    secondaryColor: "#e879f9",
    accentColor: "#fae8ff",
    backgroundColor: "#ffffff",
    textColor: "#1e293b"
  },
  {
    name: "Rosa Suave",
    primaryColor: "#f472b6",
    secondaryColor: "#fbcfe8",
    accentColor: "#fdf2f8",
    backgroundColor: "#ffffff",
    textColor: "#374151"
  }
];

export default function CustomizationSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTheme, setSelectedTheme] = useState<Partial<ColorTheme>>({});
  const [customColors, setCustomColors] = useState({
    primaryColor: "#ec4899",
    secondaryColor: "#f9a8d4",
    accentColor: "#fce7f3",
    backgroundColor: "#ffffff",
    textColor: "#1f2937"
  });

  const { data: currentTheme, isLoading } = useQuery<ColorTheme>({
    queryKey: ["/api/theme"],
    onSuccess: (data) => {
      setSelectedTheme(data);
      setCustomColors({
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        accentColor: data.accentColor,
        backgroundColor: data.backgroundColor,
        textColor: data.textColor
      });
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: (themeData: Partial<ColorTheme>) =>
      apiRequest("/api/theme", {
        method: "PUT",
        body: JSON.stringify(themeData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme"] });
      toast({
        title: "Tema atualizado",
        description: "As cores do painel foram atualizadas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar o tema. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleApplyTheme = (theme: typeof DEFAULT_THEMES[0]) => {
    const themeData = {
      name: theme.name,
      ...theme
    };
    setCustomColors(theme);
    updateThemeMutation.mutate(themeData);
  };

  const handleCustomColorChange = (colorType: keyof typeof customColors, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const handleSaveCustomColors = () => {
    const themeData = {
      name: "Personalizado",
      ...customColors
    };
    updateThemeMutation.mutate(themeData);
  };

  const previewStyle = {
    '--primary': customColors.primaryColor,
    '--secondary': customColors.secondaryColor,
    '--accent': customColors.accentColor,
    '--background': customColors.backgroundColor,
    '--text': customColors.textColor,
  } as React.CSSProperties;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-gray-900">Personalização</h2>
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
        <Palette className="h-6 w-6 text-pink-600" />
        <h2 className="text-2xl font-bold text-gray-900">Personalização</h2>
      </div>

      <div className="grid gap-6">
        {/* Temas Predefinidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-pink-600" />
              Temas Predefinidos
            </CardTitle>
            <CardDescription>
              Escolha um dos temas pré-configurados para o painel do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_THEMES.map((theme, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{theme.name}</h3>
                    <Button
                      size="sm"
                      onClick={() => handleApplyTheme(theme)}
                      disabled={updateThemeMutation.isPending}
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      Aplicar
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: theme.primaryColor }}
                      title="Cor Primária"
                    />
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: theme.secondaryColor }}
                      title="Cor Secundária"
                    />
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: theme.accentColor }}
                      title="Cor de Destaque"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cores Personalizadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-pink-600" />
              Cores Personalizadas
            </CardTitle>
            <CardDescription>
              Crie sua própria combinação de cores para o painel do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={customColors.primaryColor}
                      onChange={(e) => handleCustomColorChange("primaryColor", e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={customColors.primaryColor}
                      onChange={(e) => handleCustomColorChange("primaryColor", e.target.value)}
                      className="flex-1"
                      placeholder="#ec4899"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={customColors.secondaryColor}
                      onChange={(e) => handleCustomColorChange("secondaryColor", e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={customColors.secondaryColor}
                      onChange={(e) => handleCustomColorChange("secondaryColor", e.target.value)}
                      className="flex-1"
                      placeholder="#f9a8d4"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accent-color">Cor de Destaque</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={customColors.accentColor}
                      onChange={(e) => handleCustomColorChange("accentColor", e.target.value)}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={customColors.accentColor}
                      onChange={(e) => handleCustomColorChange("accentColor", e.target.value)}
                      className="flex-1"
                      placeholder="#fce7f3"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <Label>Pré-visualização</Label>
                <div 
                  className="border rounded-lg p-4 space-y-3"
                  style={previewStyle}
                >
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" style={{ color: 'var(--primary)' }} />
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      Painel do Cliente
                    </span>
                  </div>
                  <div 
                    className="rounded p-3"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <div 
                      className="text-sm font-medium mb-2"
                      style={{ color: 'var(--primary)' }}
                    >
                      Próximo Agendamento
                    </div>
                    <div style={{ color: 'var(--text)' }}>
                      Manicure - Amanhã às 14:00
                    </div>
                  </div>
                  <button 
                    className="w-full py-2 px-4 rounded font-medium text-white"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Agendar Serviço
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveCustomColors}
                disabled={updateThemeMutation.isPending}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {updateThemeMutation.isPending ? "Salvando..." : "Salvar Cores Personalizadas"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}