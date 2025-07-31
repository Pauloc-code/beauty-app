interface MobileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function MobileNavigation({ activeSection, onSectionChange }: MobileNavigationProps) {
  const sections = [
    { id: "home", label: "Início" },
    { id: "services", label: "Serviços" },
    { id: "portfolio", label: "Portfólio" },
    { id: "appointments", label: "Agendamentos" },
  ];

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="flex overflow-x-auto">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`nav-tab flex-shrink-0 px-6 py-3 text-sm font-medium ${
              activeSection === section.id
                ? "active text-primary border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
