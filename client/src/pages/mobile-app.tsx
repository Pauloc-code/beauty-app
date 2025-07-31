import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import MobileHeader from "@/components/mobile/mobile-header";
import MobileNavigation from "@/components/mobile/mobile-navigation";
import HomeSection from "@/components/mobile/home-section";
import ServicesSection from "@/components/mobile/services-section";
import PortfolioSection from "@/components/mobile/portfolio-section";
import AppointmentsSection from "@/components/mobile/appointments-section";

export default function MobileApp() {
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState("home");

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection />;
      case "services":
        return <ServicesSection />;
      case "portfolio":
        return <PortfolioSection />;
      case "appointments":
        return <AppointmentsSection />;
      default:
        return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Toggle for Desktop */}
      <div className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8 border-b border-gray-200">
            <button className="py-4 px-6 text-sm font-medium border-b-2 border-primary text-primary">
              <i className="fas fa-mobile-alt mr-2"></i>App Mobile (Cliente)
            </button>
            <Button
              variant="ghost"
              className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              onClick={() => setLocation("/admin")}
            >
              <i className="fas fa-desktop mr-2"></i>Painel Administrativo
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile App Container */}
      <div className="mobile-container">
        <MobileHeader />
        <MobileNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
        {renderSection()}
      </div>
    </div>
  );
}
