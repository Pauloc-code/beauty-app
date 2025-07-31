interface MobileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function MobileNavigation({ activeSection, onSectionChange }: MobileNavigationProps) {
  const sections = [
    { id: "home", label: "Início", icon: "🏠" },
    { id: "services", label: "Serviços", icon: "💅" },
    { id: "loyalty", label: "Fidelidade", icon: "🎁" },
    { id: "portfolio", label: "Portfólio", icon: "📸" },
    { id: "appointments", label: "Agenda", icon: "📅" },
  ];

  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="grid grid-cols-5 gap-1 p-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`relative flex flex-col items-center p-3 rounded-xl transition-all duration-200 ${
              activeSection === section.id
                ? "text-white shadow-lg transform scale-105"
                : "text-gray-600 hover:bg-gray-50 active:scale-95"
            }`}
            style={{
              backgroundColor: activeSection === section.id ? 'var(--primary-color)' : 'transparent',
              color: activeSection === section.id ? 'white' : undefined
            }}
            onMouseEnter={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.color = 'var(--primary-color)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeSection !== section.id) {
                e.currentTarget.style.color = '';
              }
            }}
          >
            <span className="text-lg mb-1">{section.icon}</span>
            <span className="text-xs font-medium">{section.label}</span>
            {activeSection === section.id && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
