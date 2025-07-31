import type { SystemSettings } from "@shared/schema";

export function applyColorSettings(settings: SystemSettings[] | undefined) {
  const root = document.documentElement;

  // Definir cores padrão
  const defaultColors = {
    app_primary_color: "#e91e63",
    app_accent_color: "#f06292",
    app_gradient_start: "#e91e63",
    app_gradient_end: "#f06292"
  };

  // Buscar configurações salvas ou usar padrões
  const primaryColor = settings?.find(s => s.key === "app_primary_color")?.value || defaultColors.app_primary_color;
  const accentColor = settings?.find(s => s.key === "app_accent_color")?.value || defaultColors.app_accent_color;
  const gradientStart = settings?.find(s => s.key === "app_gradient_start")?.value || defaultColors.app_gradient_start;
  const gradientEnd = settings?.find(s => s.key === "app_gradient_end")?.value || defaultColors.app_gradient_end;

  // Aplicar cores personalizadas como variáveis CSS
  root.style.setProperty("--primary-color", primaryColor);
  root.style.setProperty("--accent-color", accentColor);
  root.style.setProperty("--gradient-start", gradientStart);
  root.style.setProperty("--gradient-end", gradientEnd);

  // Aplicar gradiente do header
  root.style.setProperty("--header-gradient", `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`);

  console.log("Applied color settings:", {
    primaryColor,
    accentColor,
    gradientStart,
    gradientEnd
  });

  return {
    primaryColor,
    accentColor,
    gradientStart,
    gradientEnd
  };
}

export function hexToHsl(hex: string) {
  // Convert hex to RGB first
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}