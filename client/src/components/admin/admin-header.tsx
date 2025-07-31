import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminHeader() {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
            <Badge className="bg-primary text-white">Pro</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <img 
                src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                alt="Administradora do salão" 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-700">Ana Paula</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
