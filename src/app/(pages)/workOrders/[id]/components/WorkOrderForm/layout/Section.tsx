'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface SectionProps {
  children: ReactNode;
  className?: string;
  /** Color de fons de la secció */
  variant?: 'default' | 'primary' | 'secondary';
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Si la secció és col·lapsable */
  collapsible?: boolean;
  /** Estat inicial (només si collapsible) */
  defaultExpanded?: boolean;
  /** Callback quan canvia l'estat */
  onToggle?: (expanded: boolean) => void;
  /** Accions addicionals */
  actions?: ReactNode;
  /** Badge amb número (ex: nombre d'elements) */
  badge?: number;
  className?: string;
  children?: ReactNode;
}

interface SectionContentProps {
  children: ReactNode;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SECTION_VARIANTS = {
  default: 'bg-gray-50',
  primary: 'bg-okron-bg-primary',
  secondary: 'bg-white',
};

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Section - Contenidor de secció amb fons.
 * 
 * Agrupa contingut relacionat visualment.
 */
export function Section({
  children,
  className = '',
  variant = 'default',
}: SectionProps) {
  return (
    <section
      className={`
        rounded-xl p-4
        ${SECTION_VARIANTS[variant]}
        ${className}
      `}
    >
      {children}
    </section>
  );
}

/**
 * SectionHeader - Capçalera de secció amb suport per col·lapsar.
 * 
 * Estil inspirat en seccions d'Instagram (Reels, Stories).
 */
export function SectionHeader({
  title,
  subtitle,
  icon,
  collapsible = false,
  defaultExpanded = true,
  onToggle,
  actions,
  badge,
  className = '',
  children,
}: SectionHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (!collapsible) return;
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <div className={className}>
      <div
        className={`
          flex items-center justify-between gap-3
          ${collapsible ? 'cursor-pointer select-none' : ''}
        `}
        onClick={handleToggle}
        role={collapsible ? 'button' : undefined}
        aria-expanded={collapsible ? isExpanded : undefined}
      >
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-okron-primary/10 flex items-center justify-center text-okron-primary">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {badge !== undefined && badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-okron-primary text-white rounded-full">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: Actions + Collapse button */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions && !collapsible && (
            <div onClick={e => e.stopPropagation()}>{actions}</div>
          )}
          {collapsible && (
            <div className="p-1 rounded-full hover:bg-gray-200 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Collapsible content */}
      {collapsible && (
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * SectionContent - Contingut de la secció.
 */
export function SectionContent({
  children,
  className = '',
}: SectionContentProps) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
}
