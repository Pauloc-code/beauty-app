import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { SystemSettings } from "@shared/schema";

export function useSystemSettings() {
  const { data: settings, isLoading } = useQuery<SystemSettings[]>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings && settings.length > 0) {
      const root = document.documentElement;

      // Definir cores padrão
      const defaultColors = {
        app_primary_color: "#e91e63",
        app_accent_color: "#f06292",
        app_gradient_start: "#e91e63",
        app_gradient_end: "#f06292"
      };

      // Buscar configurações salvas ou usar padrões
      const primaryColor = settings.find(s => s.key === "app_primary_color")?.value || defaultColors.app_primary_color;
      const accentColor = settings.find(s => s.key === "app_accent_color")?.value || defaultColors.app_accent_color;
      const gradientStart = settings.find(s => s.key === "app_gradient_start")?.value || defaultColors.app_gradient_start;
      const gradientEnd = settings.find(s => s.key === "app_gradient_end")?.value || defaultColors.app_gradient_end;

      // Aplicar cores personalizadas como variáveis CSS
      root.style.setProperty("--primary-color", primaryColor);
      root.style.setProperty("--accent-color", accentColor);
      root.style.setProperty("--gradient-start", gradientStart);
      root.style.setProperty("--gradient-end", gradientEnd);

      // Aplicar gradiente do header
      root.style.setProperty("--header-gradient", `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`);
    }
  }, [settings]);

  return {
    settings,
    isLoading,
    getSettingValue: (key: string, defaultValue?: string) => {
      const setting = settings?.find(s => s.key === key);
      return setting?.value || defaultValue;
    }
  };
}