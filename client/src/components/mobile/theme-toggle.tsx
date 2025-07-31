import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return resolvedTheme === "dark" ? Moon : Sun;
    }
    return theme === "dark" ? Moon : Sun;
  };

  const Icon = getIcon();

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
      title={`Tema atual: ${theme === "system" ? "Sistema" : theme === "dark" ? "Escuro" : "Claro"}`}
    >
      <Icon className="w-5 h-5 text-white" />
    </button>
  );
}