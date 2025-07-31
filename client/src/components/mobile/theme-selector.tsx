import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Moon, Monitor, Settings } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themes = [
    {
      id: "light" as const,
      label: "Claro",
      icon: Sun,
      description: "Tema claro sempre ativo"
    },
    {
      id: "dark" as const,
      label: "Escuro",
      icon: Moon,
      description: "Tema escuro sempre ativo"
    },
    {
      id: "system" as const,
      label: "Sistema",
      icon: Monitor,
      description: "Segue as configurações do dispositivo"
    }
  ];

  const currentTheme = themes.find(t => t.id === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <CurrentIcon 
          className="w-5 h-5" 
          style={{ color: 'var(--primary-color)' }}
        />
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {currentTheme?.label}
        </span>
        <Settings 
          className="w-4 h-4 text-gray-500" 
        />
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tema do App</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.id;
          
          return (
            <button
              key={themeOption.id}
              onClick={() => {
                setTheme(themeOption.id);
                setIsOpen(false);
              }}
              className={`flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                isSelected
                  ? "shadow-lg transform scale-[1.02]"
                  : "hover:shadow-md hover:scale-[1.01]"
              }`}
              style={{
                borderColor: isSelected ? 'var(--primary-color)' : undefined,
                backgroundColor: isSelected 
                  ? `var(--primary-color)05` 
                  : undefined
              }}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ 
                  color: isSelected 
                    ? 'var(--primary-color)' 
                    : undefined 
                }}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span 
                    className={`font-medium ${
                      isSelected ? "" : "text-gray-900 dark:text-gray-100"
                    }`}
                    style={{
                      color: isSelected ? 'var(--primary-color)' : undefined
                    }}
                  >
                    {themeOption.label}
                  </span>
                  {isSelected && (
                    <Badge 
                      className="text-xs text-white"
                      style={{ backgroundColor: 'var(--primary-color)' }}
                    >
                      Ativo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {themeOption.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center space-x-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--primary-color)' }}
          ></div>
          <span className="text-gray-700 dark:text-gray-300">
            Tema atual: <span className="font-medium">
              {resolvedTheme === "dark" ? "Escuro" : "Claro"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}