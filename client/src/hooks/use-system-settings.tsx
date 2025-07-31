import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { SystemSettings } from "@shared/schema";
import { applyColorSettings } from "@/lib/color-utils";

export function useSystemSettings() {
  const { data: settings, isLoading } = useQuery<SystemSettings[]>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    applyColorSettings(settings);
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