import { Bell } from "lucide-react";
import ThemeToggle from "@/components/mobile/theme-toggle";

export default function MobileHeader() {
  return (
    <div 
      className="p-4 text-white relative overflow-hidden"
      style={{ background: 'var(--header-gradient)' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-8 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-4 left-8 w-24 h-24 bg-white rounded-full"></div>
      </div>
      
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Beauty App</h1>
          <p className="text-white/80 text-sm">Seu salão de beleza favorito</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button className="p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}