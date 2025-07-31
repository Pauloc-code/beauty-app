import { Bell } from "lucide-react";

export default function MobileHeader() {
  return (
    <div className="gradient-header p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80" 
            alt="Perfil da cliente" 
            className="w-12 h-12 rounded-full border-2 border-white object-cover"
          />
          <div>
            <h2 className="text-lg font-semibold">Maria Silva</h2>
            <p className="text-sm opacity-90">
              Pontos: <span className="font-medium">150</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <button className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
