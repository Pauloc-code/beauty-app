import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DebugLogger } from "@/lib/debug-logger";
import { TestDataGenerator } from "@/lib/test-data-generator";
import { AdminTester } from "@/lib/admin-tester";
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
  const [isGeneratingTestData, setIsGeneratingTestData] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleGenerateTestData = async () => {
    DebugLogger.log("AdminPanel", "Starting test data generation");
    setIsGeneratingTestData(true);
    try {
      await TestDataGenerator.generateAllTestData();
      DebugLogger.success("AdminPanel", "Test data generation completed");
    } catch (error) {
      DebugLogger.error("AdminPanel", "Test data generation failed", error);
    } finally {
      setIsGeneratingTestData(false);
    }
  };

  const handleRunAdminTests = async () => {
    DebugLogger.log("AdminPanel", "Starting admin panel validation");
    setIsRunningTests(true);
    try {
      await AdminTester.testAdminFunctions();
      DebugLogger.success("AdminPanel", "Admin tests completed successfully");
    } catch (error) {
      DebugLogger.error("AdminPanel", "Admin tests failed", error);
    } finally {
      setIsRunningTests(false);
    }
  };

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
      {/* Navigation Toggle for Desktop */}
      <div className="sticky top-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center border-b border-gray-200">
            <div className="flex space-x-8">
              <button className="py-4 px-6 text-sm font-medium border-b-2 border-primary text-primary">
                <i className="fas fa-desktop mr-2"></i>Painel Administrativo
              </button>
              <Button
                variant="ghost"
                className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                onClick={() => setLocation("/app")}
              >
                <i className="fas fa-mobile-alt mr-2"></i>App Mobile (Cliente)
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="py-2 px-4 text-xs mr-2"
                onClick={handleGenerateTestData}
                disabled={isGeneratingTestData}
              >
                {isGeneratingTestData ? "Gerando..." : "🧪 Dados de Teste"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="py-2 px-4 text-xs"
                onClick={handleRunAdminTests}
                disabled={isRunningTests}
              >
                {isRunningTests ? "Testando..." : "🔧 Teste Admin"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AdminHeader />
      <AdminNavigation activeSection={activeSection} onSectionChange={setActiveSection} />
      {renderSection()}
    </div>
  );
}
