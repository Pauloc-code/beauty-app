import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import AdminHeader from "@/components/admin/admin-header";
import AdminNavigation from "@/components/admin/admin-navigation";
import DashboardSection from "@/components/admin/dashboard-section";
import CalendarSection from "@/components/admin/calendar-section";
import ClientsSection from "@/components/admin/clients-section";
import ServicesSection from "@/components/admin/services-section";
import GallerySection from "@/components/admin/gallery-section";
import FinancialSection from "@/components/admin/financial-section";
import CustomizationSection from "@/components/admin/customization-section";
import SettingsSection from "@/components/admin/settings-section";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardSection />;
      case "calendar":
        return <CalendarSection />;
      case "clients":
        return <ClientsSection />;
      case "services":
        return <ServicesSection />;
      case "gallery":
        return <GallerySection />;
      case "financial":
        return <FinancialSection />;
      case "customization":
        return <CustomizationSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center border-b border-gray-200">
            <div className="flex space-x-8">
              <button className="py-4 px-6 text-sm font-medium border-b-2 border-primary text-primary">
                Painel Administrativo
              </button>
              <Button
                variant="ghost"
                className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                onClick={() => setLocation("/app")}
              >
                App Mobile (Cliente)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AdminHeader />
      <AdminNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderSection()}
      </main>
    </div>
  );
}
