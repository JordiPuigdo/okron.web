'use client';

import { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface TwoColumnLayoutProps {
  /** Contingut de la columna principal (esquerra) */
  main: ReactNode;
  /** Contingut de la columna secundària (dreta) */
  sidebar: ReactNode;
  /** Proporció de la columna principal (default: 65%) */
  mainWidth?: '50' | '60' | '65' | '70' | '75';
  /** Gap entre columnes */
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
  /** En mobile, quin contingut va primer */
  mobileOrder?: 'main-first' | 'sidebar-first';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAIN_WIDTH_CLASSES = {
  '50': 'lg:w-1/2',
  '60': 'lg:w-3/5',
  '65': 'lg:w-[65%]',
  '70': 'lg:w-[70%]',
  '75': 'lg:w-3/4',
};

const SIDEBAR_WIDTH_CLASSES = {
  '50': 'lg:w-1/2',
  '60': 'lg:w-2/5',
  '65': 'lg:w-[35%]',
  '70': 'lg:w-[30%]',
  '75': 'lg:w-1/4',
};

const GAP_CLASSES = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TwoColumnLayout - Layout de dues columnes responsiu.
 *
 * En desktop: mostra dues columnes amb les proporcions especificades.
 * En mobile: apila les columnes verticalment.
 *
 * Inspirat en layouts de Facebook/Instagram (contingut + sidebar).
 */
export function TwoColumnLayout({
  main,
  sidebar,
  mainWidth = '65',
  gap = 'md',
  className = '',
  mobileOrder = 'main-first',
}: TwoColumnLayoutProps) {
  const mainWidthClass = MAIN_WIDTH_CLASSES[mainWidth];
  const sidebarWidthClass = SIDEBAR_WIDTH_CLASSES[mainWidth];
  const gapClass = GAP_CLASSES[gap];

  return (
    <div
      className={`
        flex flex-col lg:flex-row
        ${gapClass}
        ${className}
      `}
    >
      {/* Main Column */}
      <div
        className={`
          w-full ${mainWidthClass}
          ${mobileOrder === 'sidebar-first' ? 'order-2 lg:order-1' : 'order-1'}
        `}
      >
        {main}
      </div>

      {/* Sidebar Column */}
      <div
        className={`
          w-full ${sidebarWidthClass}
          ${mobileOrder === 'sidebar-first' ? 'order-1 lg:order-2' : 'order-2'}
        `}
      >
        {sidebar}
      </div>
    </div>
  );
}
