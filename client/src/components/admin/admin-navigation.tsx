interface AdminNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AdminNavigation({ activeSection, onSectionChange }: AdminNavigationProps) {
  const sections = [
    { id: "dashboard", label: "Dashboard" },
    { id: "calendar", label: "Agenda" },
    { id: "clients", label: "Clientes" },
    { id: "services", label: "Serviços" },
    { id: "gallery", label: "Galeria" },
    { id: "financial", label: "Financeiro" },
    { id: "customization", label: "Personalização" },
    { id: "settings", label: "Configurações" },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`nav-tab flex-shrink-0 py-4 px-2 text-sm font-medium border-b-2 ${
                activeSection === section.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
