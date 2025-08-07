import type { SystemSettings } from "@shared/schema";

// Esta função não é mais necessária, pois o tema é tratado no componente de customização
// e os estilos são aplicados via variáveis CSS no index.css.
// Manter o arquivo para evitar erros de importação em outros locais, mas com a lógica desativada.

export function applyColorSettings(settings: SystemSettings[] | undefined) {
  // Lógica desativada para simplificar a migração.
  // O tema será gerenciado diretamente pelos componentes que o consomem.
  if (!settings) return;
  
  // A lógica de aplicação de cores pode ser reativada aqui se necessário no futuro.
  return;
}

export function hexToHsl(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}
