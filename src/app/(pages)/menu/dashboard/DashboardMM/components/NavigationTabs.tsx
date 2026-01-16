import { useTranslations } from 'app/hooks/useTranslations';

interface TabItem {
  key: string;
  icon: JSX.Element;
}

// Iconos para cada tab
const TABS: TabItem[] = [
  {
    key: 'work.orders',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
        />
      </svg>
    ),
  },
  {
    key: 'costs',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
        />
      </svg>
    ),
  },
  {
    key: 'spare.parts',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
        />
      </svg>
    ),
  },
  {
    key: 'purchases',
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
    ),
  },
];

interface NavigationTabsProps {
  selectedTab: string | null;
  onTabChange: (tab: string) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  selectedTab,
  onTabChange,
}) => {
  const { t } = useTranslations();

  return (
    <div className="w-full">
      {/* Container con fondo sutil */}
      <div
        className="
          relative flex items-center
          bg-grey-10 
          p-1.5 
          rounded-2xl
          border border-grey-30
        "
      >
        {/* Tabs */}
        <div className="relative flex w-full">
          {TABS.map((tab, index) => {
            const isSelected = selectedTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`
                  relative flex-1 flex items-center justify-center gap-2
                  py-3 px-4
                  rounded-xl
                  font-medium text-sm
                  transition-all duration-300 ease-out
                  ${
                    isSelected
                      ? 'bg-white text-brand-purple shadow-card'
                      : 'text-grey-70 hover:text-brand-primary hover:bg-white/50'
                  }
                `}
                style={{
                  // Pequeño retraso en la animación basado en el índice
                  transitionDelay: `${index * 25}ms`,
                }}
              >
                {/* Icono */}
                <span
                  className={`
                    transition-transform duration-300
                    ${isSelected ? 'scale-110' : 'scale-100'}
                  `}
                >
                  {tab.icon}
                </span>

                {/* Texto - visible en desktop, oculto en móvil pequeño */}
                <span className="hidden sm:inline">{t(tab.key)}</span>

                {/* Indicador de selección animado (pill debajo) */}
                {isSelected && (
                  <span
                    className="
                      absolute -bottom-1 left-1/2 -translate-x-1/2
                      w-8 h-1 
                      bg-brand-purple 
                      rounded-full
                      animate-scaleIn
                    "
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NavigationTabs;
