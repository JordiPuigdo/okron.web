'use client';

import { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Padding del contenidor */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Max width del contenidor */
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PADDING_CLASSES = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

const MAX_WIDTH_CLASSES = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-[1400px]',
  full: 'max-w-full',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * PageContainer - Contenidor principal de la pàgina.
 *
 * Proporciona un layout centrat amb amplada màxima i padding.
 * Similar al contenidor principal de Facebook/Instagram.
 */
export function PageContainer({
  children,
  className = '',
  padding = 'md',
  maxWidth = 'full',
}: PageContainerProps) {
  const paddingClass = PADDING_CLASSES[padding];
  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth];

  return (
    <div
      className={`
        w-full mx-auto
        ${paddingClass}
        ${maxWidthClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
