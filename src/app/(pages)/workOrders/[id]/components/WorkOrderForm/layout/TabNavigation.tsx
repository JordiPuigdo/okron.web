'use client';

import { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  /** Estil dels tabs */
  variant?: 'default' | 'pills' | 'underline';
  /** Mida dels tabs */
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZE_CLASSES = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TabNavigation - Navegació per pestanyes estil TikTok/Instagram.
 *
 * Suporta diferents estils:
 * - default: Fons sòlid per tab actiu
 * - pills: Capsules arrodonides
 * - underline: Línia inferior (estil Instagram)
 */
export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  variant = 'pills',
  size = 'md',
}: TabNavigationProps) {
  return (
    <div
      className={`
        flex items-center gap-1 overflow-x-auto scrollbar-hide
        ${variant === 'underline' ? 'border-b border-gray-200' : 'bg-gray-100 p-1 rounded-xl'}
        ${className}
      `}
    >
      {tabs.map(tab => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={activeTab === tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          variant={variant}
          size={size}
        />
      ))}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TabButtonProps {
  tab: TabItem;
  isActive: boolean;
  onClick: () => void;
  variant: 'default' | 'pills' | 'underline';
  size: 'sm' | 'md' | 'lg';
}

function TabButton({ tab, isActive, onClick, variant, size }: TabButtonProps) {
  const sizeClass = SIZE_CLASSES[size];

  // Base classes comuns
  const baseClasses = `
    relative flex items-center gap-2 font-medium
    transition-all duration-200 whitespace-nowrap
    ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${sizeClass}
  `;

  // Classes específiques per variant
  const variantClasses = {
    default: `
      rounded-lg
      ${isActive 
        ? 'bg-white text-okron-primary shadow-sm' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }
    `,
    pills: `
      rounded-lg
      ${isActive 
        ? 'bg-okron-primary text-white shadow-sm' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
      }
    `,
    underline: `
      pb-3 border-b-2 -mb-px
      ${isActive 
        ? 'border-okron-primary text-okron-primary' 
        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      }
    `,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={tab.disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
      <span>{tab.label}</span>
      {tab.badge !== undefined && tab.badge > 0 && (
        <span
          className={`
            min-w-[18px] h-[18px] px-1 text-xs font-bold rounded-full
            flex items-center justify-center
            ${isActive 
              ? variant === 'pills' 
                ? 'bg-white/20 text-white' 
                : 'bg-okron-primary text-white'
              : 'bg-gray-300 text-gray-700'
            }
          `}
        >
          {tab.badge > 99 ? '99+' : tab.badge}
        </span>
      )}
    </button>
  );
}
